/**
 * 메인페이지에서 step 선택 후 열리는 학습 화면 : 교재, 에디터, 에뮬레이터
 */
var bookReady = false; // 체크 기록 표시에는 사운드가 재생되지 않도록
(function() {
    const setVh = () => { // 교재영역 접고 열때 화면위로 밀리는 현상 대응
        document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);
        document.documentElement.style.setProperty('--halfHeight', `-${window.innerHeight/2}px`);
    };
    window.addEventListener('resize', setVh);
    setVh();

    const params = new URLSearchParams(location.search);
    const course = params.get('course'); //cid
    const bookId = params.get('book'); 
    const page = params.get('page');
    let userData, record, emulator, editSection, pageData;

    window.createComponent = createComponent;
    if(location.pathname.includes('makeroom')) { // makeroom 페이지에서만 화면생성
        init();
    }

    function init(){
        if(!mid) {
            toastr.error('접근 권한이 없습니다.');
            return;
        }
        getUserData(function(data) {
            userData = data;
            record = data[course] || {};
            if(!record[bookId]) record[bookId] = {};

            BX.component(learnWindow.main).appendTo(topBox);
            editSection = $('.editSection');
            BX.component(learn.lessonWindow).appendTo(editSection[0]);
            emulator = $('.emulator');
            emulator.find('.appWindow')[0].addEventListener('mousemove', mousemove);
            emulator.find('.appWindow')[0].addEventListener('mouseout', mouseout);
            const consoleDiv = $('.consolewindow');
            $('.editSection .fn-btn > :contains("play_arrow")')[0].onclick = runApp; //실행 버튼

            window.consoleDiv = consoleDiv;
            window.saveUserData = saveUserData;
            window.openPractice = openPractice;

            //교재 붙이기
            if(bookId) { // 교재학습모드
                const resetButton = $('.editSection .fn-btn > div:contains("restart_alt")');
                resetButton.show();
                resetButton[0].onclick = refreshApp; //리셋 버튼
                $.ajax({url: `./lecture/${course}/${bookId}/${bookId}.json`, dataType: "json"})
                .done((json) => {
                    pageData = json.pages;

                    if(pageData.length == 0) {
                        toastr.error('작성된 교재가 없습니다.');
                        return;
                    }
                    lessonBook(pageData).appendTo($('.lessonBook')[0]);
                    checkStudied();
                })
                .fail((xhr, status, error) => {})
            } 
            else { // 에디터 모드
                $('.appTitle')[0].innerText = 'New App';
                $('.lessonWindow').addClass('play');
                $('.editSection > :first-child').addClass('play');
                $('.aceEditor').addClass('play');
                $('.emulator').addClass('play');
            }

            const targetApp = location.hash.slice(1);
            setTimeout(() => {
                const editor =  $('.ace_editor')[0].aceEditor;
                if(targetApp == 'free') {
                    $('.emulator').show();
                }
                else if(targetApp) {
                    $('.emulator').show(); 
                    const app = BX.components[targetApp];
                    // const code = app.appCode; console.log(code, 25);
                    editSection.find('.appTitle')[0].innerText = app.appTitle;
                    app.bx().appendTo($('.appWindow')[0]);
                    
                    editor.session.setMode("ace/mode/javascript");
                    // editor.setValue(code, 1);
                    editor.focus();
                    // runApp();
                }
                // editor.getSession().on('change', editorUpdate);
                $(editor).on('focus', e => {
                    clickedRunBtn = false;
                });
            }, 500);
        });
    }

    /**
     * 유형별 컨텐츠 컴포넌트 생성
     * @param {object} unit 컴포넌트 데이터
     * @returns 컨텐츠 컴포넌트 box
     */
    function createComponent(unit) {
        let result;
        const enter = '%250A';
        const plus = '%252B';
        const component = unit.comp;
        if(component == 'check') { // 체크상자
            let txt = unit.text;
            if(unit.style) {
                for(let style of unit.style) {
                    txt = txt.replace(style.target, `<font style="${style.type}">${style.target}</font>`);
                }
            }

            result = BX.component(lesson.check);
            result.children()[0].innerHTML = txt;
            
            if(unit.id) {
                result.children()[1].id = unit.id;
            }
        } 
        else if(component == 'title') { //제목
            result = BX.component(lesson.title).text(unit.text);
        }
        else if(['text', 'sub', 'sup'].includes(component)) { //텍스트
            let txt = unit.text;
            if(unit.style) {
                txt = unit.text;
                for(let style of unit.style) {
                    txt = txt.replace(style.target, `<font style="${style.type}">${style.target}</font>`);
                }
            }

            result = BX.component(lesson[component]).html(txt);
        }
        else if(component == 'par') { //문단, 가운데정렬
            let enteredTxt = unit.text.replaceAll('\n', '<br>');

            const txt = `<p style="${unit.style}">${enteredTxt}</p>`
            result = BX.component(lesson.par).html(txt);
        }
        else if(component == 'link') { // 링크 : 새창열기
            result = BX.component(lesson.link);
            const aTag = result.find('a')[0];
            aTag.href = unit.src;
            aTag.innerText = unit.text;
            aTag.style = unit.linkstyle;
        }
        else if(component == 'codeBox') { //카본 코드상자 (미사용)
            let code = unit.text.replaceAll('\n', enter);
            code = code.replaceAll('+', plus);
            const src = `https://carbon.now.sh/embed?bg=rgba%28171%2C184%2C195%2C0%29&t=material&wt=bw&l=javascript&ds=false&dsyoff=7px&dsblur=57px&wc=${unit.tab}&wa=false&pv=0px&ph=28px&ln=true&fl=${unit.start}&fm=JetBrains+Mono&fs=18px&lh=141%25&si=false&es=1x&wm=false&code=${code}`;
            const frame = BX.component(lesson.codeBox).height(unit.height);
            frame[0].src = src; 
            result = frame;  
        }
        else if(component == 'aceEditor') { //에디터
            let code = unit.text;
            result = BX.component(lesson.aceEditor).height(unit.height);
            setTimeout(() => {
                const editor = result.children()[0].aceEditor;
                editor.setValue(code); 
                editor.clearSelection();
                editor.setReadOnly(true);
                editor.renderer.$cursorLayer.element.style.opacity = 0; //커서 감추기
                if(unit.start) editor.setOption("firstLineNumber", unit.start * 1)
            }, 100);
        } 
        else if(component == 'direction') { // 단순 에디터 열기
            const bgCode = unit.bgCode;
            const title = unit.title;
            const codeId = unit.codeId;
            const targetLine = unit.targetLine;
            const bg = BX.component(lesson.direction);
            bg.children()[0].innerHTML = unit.text;
            bg.children()[1].onclick = e => {
                //에디터 열어주기.
                if(e.target.value == '에디터 열기') {
                    // location.hash = '';
                    const editor =  $('.ace_editor')[0].aceEditor;
                    if(bgCode || bgCode == 'clear') {
                        editor.setValue(bgCode);
                        if(targetLine) editor.gotoLine(targetLine);
                    } else {
                        editor.setValue('');
                    }
                    
                    if(title) { // 에디터 제목 삽입
                        $('.appTitle')[0].innerText = title;
                    }

                    if(codeId) {
                        $('.appTitle')[0].id = codeId;
                        // pageId 전달
                        const pageId = $($(e.target).parents()[1]).find('.pageidtag')[0].innerText;
                        $('.appTitle')[0].dataset.pid = pageId;

                        if(record && record[bookId]) {
                            const pageRecord = record[bookId][pageId];
                            if(pageRecord && pageRecord.code) {
                                if(pageRecord.code[codeId]) {
                                    const codeRecord = pageRecord.code[codeId].code;
                                    editor.setValue(codeRecord);
                                    editor.navigateFileEnd(); //커서는 마지막 라인으로 
                                }
                            }
                        }
                    }

                    $('.lessonWindow').addClass('half');
                     //, inline:'end'
                     e.target.scrollIntoView({block:'start'});
                    setTimeout(() => {
                        
                        $('.lessonBook')[0].style.overflowY = 'hidden';
                        e.target.value = 'DONE';
                    }, 500);
                }
                else {
                    $('.lessonWindow').removeClass('half');
                    setTimeout(() => {
                        $('.lessonBook')[0].style.overflowY = 'auto';
                        e.target.scrollIntoView({block:'start'});
                        e.target.value = '에디터 열기';
                        consoleDiv.empty();
                    }, 500);
                }
            }
            result = bg;
        }
        else if(component == 'table') { //표
            const table = BX.component(lesson.table);
            table[0].style.gridTemplateColumns = `repeat(${unit.column}, 1fr)`;
            for(let el of unit.arr) {
                box().appendTo(table).text(el).border('0.5px solid lightgray').fontSize(15).color('white').align('center');
            }
            result = table;
        }
        else if(component == 'tableFH') {
            result = BX.component(lesson.tableFixedHeader).width(unit.width).marginLeft(`calc((100% - ${unit.width}px) / 2)`);
            $(result).find('.tblContent')[0].style.height = `${unit.height}px`;
            const head = unit.headarr.split(',');
            const content = unit.arr.split(',');
            const column = Number(unit.column);
            let targetRow;
            for(let i=0; i<content.length; i++) {
                if(i % column == 0) {
                    targetRow = document.createElement('tr');
                    $(result).find('tbody')[0].appendChild(targetRow);
                }
                const td = document.createElement('td');
                targetRow.appendChild(td);
                td.innerText = content[i];
            }
            for(let h=0; h<head.length; h++) {
                const th = document.createElement('th');
                const target = $(result).find('thead tr')[0];
                target.appendChild(th);
                th.innerText = head[h];
            }
        }
        else if(component == 'tableHVH') {
            result = BX.component(lesson.tableHorizontalVerticalHighlight).width(unit.width).marginLeft(`calc((100% - ${unit.width}px) / 2)`);
            const content = unit.arr.split(',');
            const column = Number(unit.column);
            let targetRow;
            for(let i=0; i<content.length; i++) {
                if(i % column == 0) {
                    targetRow = document.createElement('tr');
                    $(result).find('tbody')[0].appendChild(targetRow);
                }
                const td = document.createElement('td');
                targetRow.appendChild(td);
                td.innerText = content[i];
            }
            
        }
        else if(component == 'appBtn') { // 앱보기 
            const compName = unit.compName;
            const btn = BX.component(lesson.appBtn);
            btn[0].value = `${compName} 앱 보기`;
            btn[0].onclick = e => {
                $('.emulator')[0].style.display = 'block';
                $('.appWindow').empty();
                BX.components[compName].bx().appendTo($('.appWindow')[0]);
            }
            result = btn;
        }
        else if(component == 'practiceDirection') { // 실습 에디터 열기 버튼
            const targetApp = unit.targetApp;
            const codeId = unit.codeId;
            const targetLine = unit.targetLine;
            const bg = BX.component(lesson.practiceDirection);
            bg.children()[0].innerHTML = unit.text;
            bg.children()[1].onclick = e => {
                if(e.target.value == '에디터 열기') {
                    location.hash = targetApp;
                    openPractice(targetApp, unit.title, unit.bgCode);
                    const editor =  $('.ace_editor')[0].aceEditor;
                    if(targetLine) editor.gotoLine(targetLine);

                    if(codeId) {
                        $('.appTitle')[0].id = codeId;
                        // pageId 전달
                        const pageId = $($(e.target).parents()[1]).find('.pageidtag')[0].innerText;
                        $('.appTitle')[0].dataset.pid = pageId;

                        if(record && record[bookId]) {
                            const pageRecord = record[bookId][pageId];
                            if(pageRecord && pageRecord.code) {
                                if(pageRecord.code[codeId]) {
                                    const codeRecord = pageRecord.code[codeId].code;
                                    editor.setValue(codeRecord);
                                    editor.navigateFileEnd(); //커서는 마지막 라인으로 
                                }
                            }
                        }
                    }
        
                    $('.lessonWindow').addClass('half');
                    e.target.scrollIntoView({block:'start'});
                    setTimeout(() => {
                        $('.lessonBook')[0].style.overflowY = 'hidden';
                        e.target.value = 'DONE';
                    }, 500);
                }
                else {
                    $('.lessonWindow').removeClass('half');
                    $('.lessonBook')[0].style.overflowY = 'auto';
                    setTimeout(() => {
                        e.target.scrollIntoView({block:'start'});
                        e.target.value = '에디터 열기';
                        consoleDiv.empty();
                    }, 500);
                } 
            }
            result = bg;
        }
        else if(component == 'ending') { // 마지막 엔딩 배너
            result = BX.component(lesson.ending);
        } 
        else if(component == 'postit') {
            result = BX.component(lesson.postit);
            result[0].innerHTML = unit.text.replaceAll('\n', '<br>');
        }
        else if(component == 'image') {
            const img = BX.component(lesson.imageBox);
            img.children()[0].style.width = unit.width.includes('%') ? unit.width : `${unit.width}px`;
            img.children()[0].src = unit.src;
            result = img;
        }
        else if(component == 'hidebox') {
            const hideEl = BX.component(lesson.hideBox);
            hideEl.children()[0].innerText = unit.text;
            if(unit.id) {
                hideEl.children()[0].id = unit.id;
            }
            result = hideEl;
        }
        else if(component == 'quiz') {
            result = BX.component(lesson.quiz);
            
            let num = 1;
            const showQuiz = function() {
                const quizData = unit.quiz[num-1];
                const inputBox = result.find('input')[0];
                inputBox.value = '';
                inputBox.style.color = 'black';
                result.find('.quizbutton')[0].name = quizData.id;
                result.find('.quizPopup')[0].id = quizData.id;
                result.find('.quizQuestion').prev()[0].innerText = `${num} / ${unit.quiz.length}`;
                result.find('.quizQuestion')[0].innerHTML = quizData.question.replaceAll('\n', '<br>');
                if(quizData.type == 'multiple') { //객관식인 경우
                    $(inputBox).hide();
                    result.find('.quizExamples').show();
                    const sheet = result.find('.quizExamples')[0];
                    $(sheet).empty();
                    for(let i in quizData.example) {
                        const no = i * 1 + 1;
                        const exLine = BX.component(lesson.quizExample).appendTo(sheet);
                        exLine.children()[0].innerText = `(${no})`;
                        exLine.children()[1].innerHTML = `${quizData.example[i].replaceAll('\n', '<br>')}`;
                    }
                } 
                else if(quizData.type == 'short') { //주관식인 경우
                    $(inputBox).show();
                    result.find('.quizExamples').hide();
                }

                $('.quizExample').removeClass('show');
                const answer = quizData.answer;
                
                //퀴즈 팝업에서 제출버튼 클릭이벤트
                result.find('.quizSubmitBtn')[0].onclick = e => {
                    const submitted = quizData.type == 'multiple' ? 
                    $('.quizExample.checked').index() + 1 : $(e.target).prev()[0].value;
                    const quizPopup = result.find('.quizPopup')[0];
                    const resultSheet = BX.component(lesson.quizResult).appendTo(quizPopup);
                    // 정답체크
                    if(answer == submitted) {
                        resultSheet.color('blue');
                        resultSheet.children()[0].innerText = '정답';
                    }
                    else {
                        resultSheet.color('red');
                        resultSheet.children()[0].innerText = '오답';
                        //정답 표시하기
                        if(quizData.type == 'multiple') {
                            $(`.quizExample:nth-child(${answer * 1})`).addClass('show');
                        }
                        else if(quizData.type == 'short') {
                            inputBox.value = answer;
                            inputBox.style.color = 'blue';
                        }
                    }

                    //퀴즈 풀이 학습기록
                    
                    setTimeout(() => { //정답,오답 알림 제거 후 다음 문제 생성
                        resultSheet.remove();
                        if(num >= unit.quiz.length) {
                            toastr.success('마지막 문항입니다.');
                            num = 1;
                            return;
                        }
                        num++;
                        showQuiz();
                    }, 2000);
                }
            }
            result.find('.quizbutton')[0].onclick = e => {
                showQuiz();
                $(`#${e.target.name}`).addClass('on');
            }
        }

        return result;
    }
    /**
     * 교재 내에서 practice direction의 에디터 열기 버튼을 클릭한 경우
     * @param {*} targetApp 
     */
    function openPractice(targetApp, title, bgCode) {
        const editor =  $('.ace_editor')[0].aceEditor;
        $('.emulator').show(); 

        if(targetApp != 'free') {
            const app = BX.components[targetApp];
            const code = app.appCode || bgCode;
            editSection.find('.appTitle')[0].innerText = app.appTitle;
            $('.appWindow').empty();
            app.practice().appendTo($('.appWindow')[0]); 
            editor.setValue(code, 1);
            editor.focus();
            
            // editorUpdate();
            // eval(app.bgCode);
            runApp();
        } else {
            editSection.find('.appTitle')[0].innerText = title;
            editor.setValue(bgCode, 1);
            editor.focus();
        }
         //배경코드 실행
        
        // editor.getSession().on('change', editorUpdate);
        $(editor).on('focus', e => {
            clickedRunBtn = false;
        });
    }

    let no = 0;
    let clickedRunBtn = false;
    function editorUpdate() {
        const editor =  $('.ace_editor')[0].aceEditor;
        //높이 자동조절
        $('.ace_editor')[0].style.height = editor.getSession().getDocument().getLength() * editor.renderer.lineHeight + editor.renderer.scrollBar.getWidth() + 'px';
        editor.resize();
        // const nextCard = () => {
        //     clickedRunBtn = false;
        //     if(no == typing.length) return;
        //     $('.codingCard')[0].innerHTML = card[no];
        //     no++;
        //     // const editorLineNo = $('.ace_editor')[0].aceEditor.getSession().getScreenLength();
        //     // if(no != 1 && editorLineNo != no + 2) {
        //     //     editor.session.insert({
        //     //         row : ,
        //     //         column: typing[no-1].code.length + 1
        //     //     }, "\n");
        //     // }
        //     // editor.gotoLine(no + 2); 
        // }

        // if(no >= typing.length) {
        //     // $('.codingCard').parent()[0].style.display = 'none';
        //     return;
        // }
        // // 타이핑 체크
        // if(typing[no].type == 'init') {
        //     nextCard();
        // }
        // else if(typing[no].type == 'code' &&  editor.session.getLine(typing[no].line-1) ==  typing[no].code) {
        //     nextCard();
        // } 
        // else if(typing[no].type == 'run') {
        //     //런버튼 클릭 체크, 코드 체크.
        //     if(!clickedRunBtn) {
        //         return;
        //     }
        //     nextCard();
        // } 
        // else if(typing[no].type == 'runCode') {
        //     if(typing[no].line == '' && !editor.getValue().includes(typing[no].code)) {
        //         return;
        //     }
        //     else if(typing[no].line && editor.session.getLine(typing[no].line-1) !=  typing[no].code) {
        //         return;
        //     }
        //     if(!clickedRunBtn) {
        //         return;
        //     }
        //     nextCard();
        // }
    }

    /**
     * 에뮬레이터에서 마우스 포인터 좌표 정보 출력
     * @param {*} e 
     * @returns 
     */
    function mousemove(e){
        const x = Math.floor(e.clientX - $('.appWindow')[0].getBoundingClientRect().x - 1);
        const y = Math.floor(e.clientY - $('.appWindow')[0].getBoundingClientRect().y - 1);

        if( x < 0 || y < 0 ) return;

        $('.nav-x').show(); 
        $('.nav-x')[0].style.left = x + 'px';
        $('.nav-x')[0].firstChild.innerText = 'x : ' + x;

        $('.nav-y').show();
        $('.nav-y')[0].style.top = y + 'px';
        $('.nav-y')[0].firstChild.innerText = 'y : ' + y;
    }

    /**
     * 마우스 커서가 에뮬레이터에서 벗어나면 네베게이션 숨기기
     * @param {*} e 
     */
    function mouseout(e) {
        $('.nav-x').hide();
        $('.nav-y').hide();
    }

    /**
     * 에디터 리셋 버큰 클릭 이벤트
     * @param {*} e 
     */
    function refreshApp(e) {
        // 교재모드인 경우, 코드기록 삭제, 배경코드
        const editor =  $('.ace_editor')[0].aceEditor;
        const codeId = $('.appTitle')[0].id;
        const pageId = $('.appTitle')[0].getAttribute('data-pid');

        if(codeId) {
            const deletedTarget = record[bookId][pageId].code[codeId];
            if(deletedTarget) {
                delete record[bookId][pageId].code[codeId];
                let saveData = {};
                saveData[course] = record;
                
                //merge의 경우, 없는(삭제) 데이터는 그대로 남으므로, update 아닌 write로 저장
                userWriteDocument(`users/${mid}`, saveData, (result) => {
                    toastr.success('코드 기록이 삭제되었습니다.');
                });
            }

            const data = pageData.filter(o => Object.keys(o)[0] == pageId)[0];
            const content = data[pageId].content;
            const compData = content.filter( o => o.codeId && o.codeId == codeId)[0];
    
            let bgCode;
            //practice direction의 경우, bgCode가 없으므로. 앱 컴포넌트 데이터에서 appCode 가져오기
            if(compData.comp == 'practiceDirection') {
                bgCode = BX.components[compData.targetApp].appCode;
            } 
            else { // 일반 direction인 경우
                bgCode = compData.bgCode;
            }
            editor.setValue(bgCode);
            editor.navigateFileEnd(); 
            
        }
        else {
            editor.setValue('');
        }
    }

    /**
     * 코드 실행 버튼 클릭 이벤트
     */
    function runApp(e) {
        $('.appWindow').empty();
        const editor =  $('.ace_editor')[0].aceEditor;
        const targetApp = location.hash.slice(1);
        let code = editor.getValue();
        if(targetApp && targetApp != 'free') {
            BX.components[targetApp].practice().appendTo($('.appWindow')[0]);
        } 
             
        playSound('effectsound1');
        consoleDiv.empty();

        try {
            eval(code);
        } 
        catch(error) {
            print(`<font color=red>[ERROR] ${error.message}</font>`);
        }


        const codeId = $('.appTitle')[0].id; //record
        if(e && codeId) { // 교재학습인 경우 코드기록
            const title = $('.appTitle')[0].innerText;
            const pageId = $('.appTitle')[0].getAttribute('data-pid');
            let codeData = {
                id : codeId,
                code : code,
                time: Date.now(),
                title : title
            };

            if(!record[bookId]) {
                record[bookId] = {};
            }

            if(!record[bookId][pageId]) { // 페이지 데이터가 없으면
                record[bookId][pageId] = {code : {}};
            }

            const inputCode = {};
            inputCode[codeId] = codeData; 

            record[bookId][pageId].code = inputCode;
            
            // 데이터 업데이트 저장.
            updateUserData(record);
        }

        editor.blur();
        clickedRunBtn = true;
        // editorUpdate();
    }

    /**
     * pageData로 교재 생성
     * @param {object} pageData 배열
     * @returns 생성된 페이지 box
     */
    function lessonBook(pageData) {
        const b = box();
        const book = pageData;

        const appendNav = function () {
            const navBg = $('.bookNav'); 
            for(let pages of book) {
                const pageId = Object.keys(pages)[0];
                const btn = box().appendTo(navBg[0]).html(navBg.children().length)//.html('<span class="material-symbols-outlined">lock</span>');
                btn.attr('name', pageId);
                // btn[0].onclick = e => {
                //     if (e.target !== e.currentTarget) { //자식요소 클릭시
                //         if(e.target.tagName == 'SPAN') {
                //             $(e.target).parent()[0].click();
                //         }
                //         return;
                //     }

                //     if(!isReadAll()) {
                //         toastr.error(`미확인 체크박스를 확인하고 다시 시도하세요.`);
                //         return;
                //     }

                //     const params = new URLSearchParams(location.search);                   
                //     params.set('page', $(e.target).index() + 1);
                //     location.href = 'makeroom.html?' + params.toString();
                //     return;

                //     if(!isReadAll() && !e.target.classList.contains('open')) { // 체크되지 않은 체크박스가 있는 경우
                //         toastr.error(`미확인 체크박스를 확인하고 다시 시도하세요.`);
                //         return;
                //     }
                //     //이전 page가 열렸는지 확인
                //     const isFirst = e.target == $('.bookNav div').first()[0];
                //     if(!isFirst && !$(e.target).prev()[0].classList.contains('open')) { 
                //         toastr.error('이전 학습을 먼저 완료하세요.');
                //         return;
                //     }
                //     if(e.target.classList.contains('on')) return; //재클릭 방지

                //     if($('.lessonWindow')[0].classList.contains('fold')) { //에디터가 열린 경우 초기화
                //         $('.lessonWindow').toggleClass('fold');
                //         $('.lessonBook')[0].style.overflow = 'auto';
                //     }

                //     $(e.target).find('span')[0].innerText = 'lock_open';
                //     const page = $(e.target).attr('name');
                    
                //     $(e.target).addClass("on"); // 클릭한 버튼 표시
                //     $(e.target).addClass("open"); // 열린 버튼 표시
                //     $('.bookNav div').not($(e.target)).removeClass("on");
                //     drawPage(book[page]);
                // }

                //제목 탭 붙이기
                const tag = BX.component(learn.navLabel).appendTo(btn);
                tag[0].innerText = Object.values(pages)[0].title; 
            }
        }

        const openPage = function(page) {
            const contains = Object.values(book[Number(page) - 1])[0].content;
            drawPage(contains, Object.keys(book[Number(page) - 1])[0]);
            $($('.bookNav').children()[page-1]).addClass("on open"); 
        }

        /**
         * 교재 페이지 생성
         * @param {object} contents 페이지 컨텐츠 컴포넌트 배열
         * @param {boolean} scroll 스크롤 모드 여부
         */
        const drawPage = function(contents, pageId, scroll) {
            $('.lessonBook')[0].style.opacity = 0;
            $('.lessonBook').scrollTop(0);
            let loading;
            if(!scroll) {
                b.empty();
                loading = BX.component(learn.loading).appendTo($('.lessonWindow')[0]);
            }
            
            const wrap = box().appendTo(b);
            for(let [idx, unit] of contents.entries()) {
                const created = createComponent(unit).appendTo(wrap);
                
                if(unit.comp == 'title') { //페이지 아이디 붙이기 
                    $(created).find('.pageidtag')[0].innerHTML = pageId;
                }

                unit.enter = Number(unit.enter)
                if(unit.enter) { //줄내림
                    for(var i=0; i<unit.enter; i++) {
                        BX.component(lesson.enter).appendTo(wrap);
                    }
                }

                if( !scroll && idx == contents.length-1) {
                    const pageMoveBtn = BX.component(lesson.nextBtn).appendTo(wrap);
                    pageMoveBtn.children()[0].onclick = movePrevPage;
                    pageMoveBtn.children()[1].onclick = moveNextPage;
                    if(page == '1') {
                        pageMoveBtn.children()[0].style.display = 'none';
                    } 
                    else if(page == String(Object.keys(book).length)){
                        pageMoveBtn.children()[1].style.display = 'none';
                    }
                }
            }
            
            if(!scroll) {
                setTimeout( () => {
                    loading.remove();
                    $('.lessonBook')[0].style.opacity = 1;
                }, 2000);
            }
        }

        //location parameter page 유무에 따라 페이지 OR 스크롤 모드 분기
        if(page) {
            appendNav();
            openPage(page);
        } 
        else {
            // $('.bookNav')[0].style.display ='none';
            const loading = BX.component(learn.loading).appendTo($('.lessonWindow')[0]);
            for(let page=0; page<book.length; page++) {
                drawPage(Object.values(book[page])[0].content, Object.keys(book[page])[0], true);

                if(page == book.length-1) {
                    setTimeout( () => {
                        loading.remove();
                        $('.lessonBook')[0].style.opacity = 1;
                    }, 2000);
                }
            }
        }

        return b;
    } 

    // function getUserData() {
    //     const result = JSON.parse(localStorage.getItem(mid));
    //     return result || {};
    // }

    /**
     * 학습자 진도기록용 클릭이벤트 : 체크, 스크래치 박스 등 id를 가진 컨텐츠
     * @param {*} target 
     */
    function saveUserData(target) {
        const pageid = $($(target).parents()[1]).find('.pageidtag')[0].innerText;
        const clickid = target.id;
        if(!clickid) return;

        if(!record[bookId]) {
            record[bookId] = {};
        }

        if(!record[bookId][pageid]) {
            record[bookId][pageid] = {
                clicked : []
            };
        }
        if(!record[bookId][pageid].clicked) {
            record[bookId][pageid].clicked = [];
        }
        if(!record[bookId][pageid].clicked.includes(clickid)) {
            record[bookId][pageid].clicked.push(clickid);
            record[bookId][pageid].time = Date.now();
        }
        // 기록
        localStorage.setItem(mid, JSON.stringify(record));
        updateUserData(record);
    }

    /**
     * 학습자 기록 업데이트
     * @param {*} record 
     */
    function updateUserData(record) {
        // 교재 편집모드 에서는 update 제외
        if(new URLSearchParams(location.search).get('edit') == 'on') {
            return;
        } 
        let saveData = {};
        saveData[course] = record;
        userUpdateDocument(`users/${mid}`, saveData);
    }
    /**
     * 학습자 진도기록에서 체크된 항목 표시해주기
     */
    function checkStudied() {
        const data = record[bookId];

        //체크 기록 가져오기
        let studied = [];
        if(page) { //페이지 모드
            const pageId = $('.pageidtag')[0].innerText;
            if(data[pageId]) studied = data[pageId].clicked;
        }
        else { // 스크롤 모드
            Object.keys(data).forEach(function(pagdId) {
                studied = studied.concat(data[pagdId].clicked);
            });
        }
        
        if(studied) {
            const checks = $('input.read_check');
            checks.each(function(i, b) {
                if(b.type == 'checkbox' && studied.includes(b.id)){
                    b.click();
                }   
            });
            const hidebox = $('.hideb');
            hidebox.each(function(i, b) {
                const hideTarget = $(b).children()[0];
                if(studied.includes(hideTarget.id)) {
                    hideTarget.click();
                }
            });
        }
        
        bookReady = true;
    }

    /**
     *  학습자 입력요소 체크 여부 확인
     * @returns true or false
     */
    function isReadAll() { //페이지의 체크박스를 모두 체크하였는지 확인
        const checks = $('input.read_check');
        let notReadCount = 0;
        checks.each(function(i, b) {
            if(b.type == 'checkbox'){
                if(!b.checked) { //미체크 항목
                    notReadCount++;
                }
                else { //체크항목
                    
                }
            } 
        });

        const hidebox = $('.hideb');
        hidebox.each(function(i, b) {
            const hideTarget = $(b).children()[0];
            if($(hideTarget).hasClass('checked')) {
                // hideTarget.id;
            } 
            else {
                notReadCount++;
            }
        });

        return notReadCount == 0;
    }

    /**
     * 이전 버튼 클릭이벤트
     */
    function movePrevPage() {
        const params = new URLSearchParams(location.search);                   
        params.set('page', Number(params.get('page')) - 1);
        location.href = 'makeroom.html?' + params.toString();
    }

    /**
     * 다음 버튼 클릭이벤트
     */
    function moveNextPage() {
        if(!isReadAll()) {
            toastr.error(`미확인 체크박스를 확인하고 다시 시도하세요.`);
            return;
        }
        const params = new URLSearchParams(location.search);                   
        params.set('page', Number(params.get('page')) + 1);
        location.href = 'makeroom.html?' + params.toString();
    }

    /**
     * 코드실행 ctrl + s 단축키 사용 키 이벤트
     */
    let isCtrl, isSkey;
    document.onkeyup = function(e) {
        if (e.key == 'Control')  isCtrl = false; //17
        if (e.key == 's')  isSkey = false;
    }
    document.onkeydown = function(e) {
        if(e.key == 'Control') isCtrl = true; 
        if(e.key == 's') isSkey = true; //83
        if(isSkey && isCtrl) {
            $('.editSection .fn-btn :nth-child(3)')[0].click();
            return false;
        }
    }
})();


