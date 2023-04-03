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
    const crs = params.get('p_cpsubj');
    const bookId = params.get('book'); 
    const page = params.get('page');
    const quiz = params.get('q');
    const crsStart = params.get('edustart');
    let userData, record, emulator, editSection, pageData, timer;
    let autoSubmit; // 자동제출 여부.

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
            record = data.course[crs];
            if(!record.progress) record.progress = {};
            if(!quiz && !record.progress[bookId]) record.progress[bookId] = {};
            
            if(quiz) {
                // window.addEventListener('beforeunload', (event) => {
                //     event.preventDefault();
                //     event.returnValue = '';
                // });
                const quizWindow = BX.component(learn.quizWindow).appendTo(topBox);
                const quizGuide =BX.component(learn.quizGuide).appendTo(topBox);
                // 팝업 시작하기 버튼 클릭이벤트 
                quizGuide.find('button')[0].onclick = openQuiz;
            }
            else {
                BX.component(learnWindow.main).appendTo(topBox);
                editSection = $('.editSection');
                emulator = $('.emulator');
                emulator.find('.appWindow')[0].addEventListener('mousemove', mousemove);
                emulator.find('.appWindow')[0].addEventListener('mouseout', mouseout);
                const consoleDiv = $('.consolewindow');
                $('.editSection .fn-btn > :contains("play_arrow")')[0].onclick = runApp; //실행 버튼
                window.consoleDiv = consoleDiv;
                window.saveUserData = saveUserData;
                window.openPractice = openPractice;
                BX.component(learn.lessonWindow).appendTo(editSection[0]);
            }

            //교재 붙이기
            if(bookId) { // 교재학습모드
                if(!quiz){
                    const resetButton = $('.editSection .fn-btn > div:contains("restart_alt")');
                    resetButton.show();
                    resetButton[0].onclick = refreshApp; //리셋 버튼
                }
                $.ajax({url: `./lecture/${crs}/${bookId}/${bookId}.json`, dataType: "json"})
                .done((json) => {
                    pageData = json.pages;

                    if(pageData.length == 0) {
                        toastr.error('작성된 교재가 없습니다.');
                        return;
                    }
                    
                    if(quiz){ //퀴즈 기록으로 
                        quizBook(pageData).appendTo($('.quizPaper')[0]);
                        checkSolved();
                    } 
                    else { //진도 기록으로 
                        lessonBook(pageData).appendTo($('.lessonBook')[0]);
                        checkStudied();
                    }
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
            if(!quiz){
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
            }
        });
    }
    /**
     * 타이머 동작처리
     * @param {number} minute 분 설정
     * @param {number} second 초 설정
     */
    function startTimer(minute, second){
        timer = setInterval(() => {
            $('.quizTimer')[0].style.animationPlayState = 'running';
            if(second == 0) second = 60;
            if(second == 60) minute--;
            second--;
            
            $('.timerDisplay')[0].textContent = `${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
            
            //남은 시간을 1초단위로 기록
            userData.course[crs].quiz.testTime = (minute * 60) + second;
            userUpdateDocument(`users/${mid}`, userData);
            
            // 학습종료일 자정이면 자동 제출
            const today = new Date();
            const deadline = new Date(today.getFullYear(), today.getMonth() + 1, 1).getTime();
            if(Date.now() >= deadline) { 
                autoSubmit = true;
                minute = 0;
                second = 0;
            }   

            if(minute == 0 && second == 0) {
                // 시간 종료. 제출하기 버튼 자동 클릭.
                document.querySelector('.quizbutton')[0].click(); 
            }
        }, 1000);
    }

    /**
     * 퀴즈 팝업 시작하기 버튼 클릭 이벤트 핸들러
     * @param {*} e 
     */
    function openQuiz(e) {
        //한번 더 체크?
        let testTime = userData.course[crs].quiz.testTime;
        if(!testTime){
            testTime = 3600;
            userData.course[crs].quiz.testTime = testTime;
            userUpdateDocument(`users/${mid}`, userData);
        }
        if(testTime <= 0) { // 응시 시간 초과 - 결과 자동 제출

            return;
        }

        $('.quizGuidePop')[0].remove();
        let minute = Math.floor(testTime / 60);
        let second = testTime % 60;
        $('.timerDisplay')[0].textContent = `${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
        
        startTimer(minute, second);
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
                        if(record.progress && record.progress[bookId]) {
                            const pageRecord = record.progress[bookId][pageId];
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

                        if(record.progress && record.progress[bookId]) {
                            const pageRecord = record.progress[bookId][pageId];
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
            img.children()[0].src = unit.src.replace('9627cb42', 'L018761');
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
        else if(component == 'quizQuestion') { // 응시용 퀴즈교재 컴포넌트
            const bg = box();
            const quest = BX.component(lesson[component]).appendTo(bg);
            quest.children()[0].innerText = unit.quizNo + '.';
            quest.children()[1].innerHTML = unit.question;

            const exp = BX.component(lesson['finalQuizExample']).appendTo(bg);
            const examples = unit.example;
            for(var i=0; i<examples.length; i++) {
                const bogi = BX.component(lesson['finalExp']).text(`(${i+1}) ${examples[i]}`).appendTo(exp);
                bogi[0].dataset.no = i+1;
                bogi[0].dataset.q = unit.quizNo;
                bogi[0].onclick = checkedExample;
            }

            result = bg;
        }
        else if(component == 'finalQuizSubmit'){
            result = BX.component(lesson.finalQuizSubmit);
            result.find('.quizbutton')[0].onclick = submitQuiz;
        }
        

        return result;
    }

    function postExam() { // 기존 리얼코딩 시험제출 코드 수정 필요.
        var crs_code = crs;
        var chapter = getLocationParameter('chapter') || '';
        var mid = getLocationParameter('member_id');

        var postExam = function(){
            var sdate = getLocationParameter('sdate') || '20190801';
            var progress = '100';

            var examResult = getQuizSolveData();
            var score = examResult.correctCount / examResult.quizCount;
            score = parseInt( score * 100 );

            var passDesc = score >= 60 ? '02' : '03';

            var url = "/cest/exam-lotte-prepost";//"/openapi/urlreq/http://ez.lotteacademy.co.kr/servlet/controller.cp.OutsideContentsServlet";
            var param = {
                RECORD_COUNT: "1",      // 처리건수 (인원)
                COURSE_CODE: crs_code,  // "L015075"
                COURSE_SQ: sdate,       // "20190801"
                MEMBER_ID: mid,         // "realcoding"
                PROGRESS_RESULT: progress,  // "70" 진도백분율환산
                EXAM_RESULT: score,       // 시험백분율환산점수
                TOTAL_RESULT: score,       // 시험 점수와 같은건가?
                COMPLETION_YN: passDesc,    // 01: 진행중, 02: 수료, 03: 미수료 - 수료되지 못한 인원정보를 

                TASK_RESULT: "0",       // 과제백분율환산점수 - 리얼코딩은 무관?
                MID_EXAM_RESULT: "0",   // 형성평가 - 리얼코딩은 무관?
                DISCUSS_RESULT: "0",    // 토론점수 - 리얼은 무관?
            };

            RC.showLoading('dots');
            request(url, function(result){
                
                postExamLog(score, result, function(is){
                    RC.hideLoading();
                    if(fn) fn(true);
                });
                
                // RC.stat('lecture', 'exam', 'lotte-'+ (crs_code || "nocourse") +'-'+ chapter + '-' + (mid || 'nouser'));
            }, param, 'POST');
        };

        var postExamLog = function(score, lotteResult, fn){
            request('/cest/exam-lotte-post', function(result){
                result = JSON.parse(result);
                if(fn) {
                    fn(result.resultCode == 0, result);
                }
            }, {
                crs_code: crs_code,
                chapter: getLocationParameter('chapter') || '',
                lid: getLectureId() || '',
                mid: mid,
                score: score,
                vendorResponse: lotteResult
            }, 'POST');
        };

        getLotteExamResult(function(isSuccess, score){
            if(isSuccess && score >= 0) {
                if(fn) fn(false, {error: '이미 시험을 응시했습니다.'});
            }
            else {
                postExam();
            }
        });
    }
    /**
     * 퀴즈 최종 제출하기 버튼 클릭 이벤트 핸들러
     * @param {*} e 
     */
    function submitQuiz(e) {
        // 한번 확인 - 타이머 멈추기
        clearInterval(timer);
        $('.quizTimer')[0].style.animationPlayState = 'paused';
        let solve = userData.course[crs].quiz.solve? userData.course[crs].quiz.solve.detail : [];

        const restart = () => {
            let testTime = userData.course[crs].quiz.testTime;
            let minute = Math.floor(testTime / 60);
            let second = testTime % 60;
            startTimer(minute, second);
        };

        const finalSubmit = () => {
            let correct = solve.filter(o => o.correct).length; // 맞은 개수
            let incorrect = solve.length - correct; // 틀린갯수
            let score = 5 * correct;
            userData.course[crs].quiz.score = score;
            userData.course[crs].quiz.solve.correctCount = correct;
            userData.course[crs].quiz.solve.incorrectCount = incorrect;
            userData.course[crs].quiz.solve.time = Date.now();
            userUpdateDocument(`users/${mid}`, userData);
            //-- 
            // postExam();
            toastr.success('최종 제출되었습니다.');
            //update 데이터 , 버튼은 숨기고, 제출되었다 안내하고 모든 버튼 클릭 이벤트 없애고
            $(e.target).hide();
            $('.quizexamples').each(function(i, exp) {
                exp.onclick = 'disable';
            });
        };

        // 응시기간이 경과해 자동제출하는 경우, 묻지 않고 
        if(autoSubmit == true) {
            finalSubmit();
            return;
        }

        const isSubmit = confirm('최종 제출하시겠습니까?');
        if(isSubmit){
            if(solve.length > 0) {
                let unsolved = solve.filter(o => Object.keys(o).length == 0);
                if(unsolved.length > 0) { // 풀었지만 다 안푼거
                    toastr.error('풀지 않은 문제가 있습니다.<br>모든 문제를 푼 후, 다시 시도하세요.');
                    restart();
                }
                else { // 다 풀었네
                    finalSubmit();
                }
            } 
            else { //  푼게 없잖아
                toastr.error('문제를 풀고, 다시 시도하세요.');
                restart();
            }
        }
        else {
            restart();
        }
    }

    /**
     * 퀴즈 보기 문항 클릭 이벤트 핸들러 
     * @param {*} e 
     * @returns 
     */
    function checkedExample(e) {
        if(e.target != e.currentTarget){
            e.currentTarget.click();
            return;
        }
        $(e.target).addClass('checked');
        $(e.target).siblings().removeClass("checked");
        recordSolve(e.target);
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
                saveData[crs] = record;
                
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

            // if(!record[bookId]) {
            //     record[bookId] = {};
            // }
            const bookData = record.progress[bookId];

            if(!bookData[pageId]) { // 페이지 데이터가 없으면
                bookData[pageId] = {code : {}};
            }

            const inputCode = {};
            inputCode[codeId] = codeData; 

            bookData[pageId].code = inputCode;
            
            record.progress[bookId] = bookData;
            // console.log(record,'코드기록')
            // 데이터 업데이트 저장.
            updateProgressData(record);
        }

        editor.blur();
        clickedRunBtn = true;
        // editorUpdate();
    }

    /**
     * 퀴즈교재 페이지 데이터로 퀴즈 페이지 생성
     * @param {*} pageData 
     * @returns 
     */
    function quizBook(pageData) {
        const b = box();
        const book = pageData;
        
        const drawPage = function(contents) {
            const wrap = box().appendTo(b);
            for(let [idx, unit] of contents.entries()) {
                const created = createComponent(unit).appendTo(wrap);
                
                if(unit.comp == 'title') { //퀴즈는 페이지 아이디 감추기
                    $(created).find('> *')[0].style.display = 'none';
                }
                // 퀴즈교재는 간격 4줄로 고정
                for(var i=0; i<4; i++) {
                    BX.component(lesson.enter).appendTo(wrap);
                }
            }
        }

        for(let page=0; page<book.length; page++) {
            drawPage(Object.values(book[page])[0].content);
        }

        return b;
    }

    function recordSolve(target) {
        if(location.pathname.includes('makeBook')) return; // 교재편집 중은 제외

        let data = pageData[0];
        let pageKey = Object.keys(data)[0];
        let quest = data[pageKey].content; //배열
        
        const checkAnswer = (num) => {
            return quest[num].answer
        }

        let solveDetail = {};
        solveDetail.userInput = target.dataset.no;
        solveDetail.correct = checkAnswer(target.dataset.q) == target.dataset.no;
        solveDetail.question = quest[target.dataset.q].question;
        solveDetail.time = Date.now();
        //기록  보기를 선택할 때마다 
        if(!userData.course[crs].quiz.solve) userData.course[crs].quiz.solve = {};
        if(!userData.course[crs].quiz.solve.detail) userData.course[crs].quiz.solve.detail = new Array(20).fill({});
        userData.course[crs].quiz.solve.detail[target.dataset.q-1] = solveDetail;
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

    /**
     * 학습자 진도기록용 클릭이벤트 : 체크, 스크래치 박스 등 id를 가진 컨텐츠 v1
     * @param {*} target 
     */
    function saveUserData(target) {
        const pageid = $($(target).parents()[1]).find('.pageidtag')[0].innerText;
        const clickid = target.id;
        if(!clickid) return;
    
        const bookData = record.progress[bookId];
        if(!bookData[pageid]) {
            bookData[pageid] = {
                clicked : []
            };
        }
        if(!bookData[pageid].clicked) {
            bookData[pageid].clicked = [];
        }
        if(!bookData[pageid].clicked.includes(clickid)) {
            bookData[pageid].clicked.push(clickid);
            bookData[pageid].time = Date.now();
        }
        record.progress[bookId] = bookData;
        updateProgressData(record);
    }

    /**
     * 학습자 진도기록 업데이트
     * @param {*} record 
     */
    function updateProgressData(record) {
        // 교재 편집모드 에서는 update 제외
        if(new URLSearchParams(location.search).get('edit') == 'on') {
            return;
        } 
        if(!isTakingClass(crsStart)) { // 수강기간이 아니면 기록되지 않도록
            return;
        }
        
        userData.course[crs] = record;
        userUpdateDocument(`users/${mid}`, userData);
    }
    /**
     * 퀴즈교재 열람시 풀이기록이 있으면 표시하기
     * @returns 
     */
    function checkSolved(){
        if(!userData.course[crs].quiz.solve) return;

        const solved = userData.course[crs].quiz.solve.detail;
        $('.finalQuizExample').each(function(i, el){
            if(solved[i].userInput){
                const target = $(el).find(`[data-no=${solved[i].userInput}]`)[0];
                $(target).addClass('checked');
            }
        });
    }

    /**
     * 교재 열람시 학습자 진도기록에서 체크된 항목 표시해주기
     */
    function checkStudied() {
        const data = record.progress[bookId];

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
                    b.disabled = true;
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
    window.createComponent = createComponent;
})();


