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

    const mid = new URLSearchParams(location.search).get('mid');
    const params = new URLSearchParams(location.search);
    const bookId = params.get('book'); 
    const page = params.get('page');
    let record = getUserData(); //학습자 데이터를 가져오고, 없으면 새로운 데이터로 시작.
    console.log(record)
    if(!record[bookId]) record[bookId] = {};

    BX.component(learnWindow.main).appendTo(topBox);
    const editSection = $('.editSection');
    BX.component(learn.lessonWindow).appendTo(editSection[0]);
    const emulator = $('.emulator');
    const consoleDiv = $('.consolewindow');
    $('.editSection .fn-btn :nth-child(3)')[0].onclick = runApp;

    window.consoleDiv = consoleDiv;
    window.mid = mid;
    window.saveUserData = saveUserData;
    window.createContent = createComponent;

    //교재 붙이기
    if(bookId) {
        const pageData = getBookData()[bookId].pages;
        lessonBook(pageData).appendTo($('.lessonBook')[0]);
        checkStudied();
    } 
    else {
        $('.appTitle')[0].innerText = 'New App';
        $('.lessonWindow').addClass('play');
        $('.editSection > :first-child').addClass('play');
        $('.aceEditor').addClass('play');
        $('.emulator').addClass('play');
    }

    const targetApp = location.hash.slice(1);
    setTimeout(() => {
        const editor =  $('.ace_editor')[0].aceEditor;
        if(targetApp) {
            $('.emulator').show(); 
            const app = BX.components[targetApp];
            const code = app.appCode;
            editSection.find('.appTitle')[0].innerText = app.appTitle;
            app.practice().appendTo($('.appWindow')[0]);
            editor.session.setMode("ace/mode/javascript");
            editor.setValue(code, 1);
            editor.focus();
            runApp();
        }
        // editor.getSession().on('change', editorUpdate);
        $(editor).on('focus', e => {
            clickedRunBtn = false;
        });
    }, 500);

    /**
     * 
     * @param {*} targetApp 
     */
    function openPractice(targetApp) {
        const editor =  $('.ace_editor')[0].aceEditor;
        
        $('.emulator').show(); 
        const app = BX.components[targetApp];
        const code = app.appCode;
        editSection.find('.appTitle')[0].innerText = app.appTitle;
        app.practice().appendTo($('.appWindow')[0]);
        
        editor.setValue(code, 1);
        editor.focus();
        // editorUpdate();
        runApp();
        // eval(app.bgCode); //???
        
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
    emulator.find('.appWindow')[0].addEventListener('mousemove', mousemove);
    emulator.find('.appWindow')[0].addEventListener('mouseout', mouseout);

    /**
     * 코드 실행 버튼 클릭 이벤트
     */
    function runApp() {
        $('.appWindow').empty();
        const targetApp = location.hash.slice(1);
        if(targetApp)
        BX.components[targetApp].practice().appendTo($('.appWindow')[0]);
        const editor =  $('.ace_editor')[0].aceEditor;
        const code = editor.getValue();
        playSound('effectsound1');
        consoleDiv.empty();

        try {
            eval(code);
        } catch(error) {
            print(`<font color=red>[ERROR] ${error.message}</font>`);
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
                const btn = box().appendTo(navBg[0]).html('<span class="material-symbols-outlined">lock</span>');
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

    function getUserData() {
        const result = JSON.parse(localStorage.getItem(mid));
        return result || {};
    }
    /**
     * 학습자 진도기록용 클릭이벤트 : 체크, 스크래치 박스 등 id를 가진 컨텐츠
     * @param {*} target 
     */
    function saveUserData(target) {
        const pageid = $($(target).parents()[1]).find('.pageidtag')[0].innerText;
        const clickid = target.id
        if(!clickid) return;

        if(!record[bookId][pageid]) {
            record[bookId][pageid] = {
                clicked : []
            };
        }
        if(!record[bookId][pageid].clicked.includes(clickid)) {
            record[bookId][pageid].clicked.push(clickid);
            record[bookId][pageid].time = Date.now();
        }
        // 기록
        localStorage.setItem(mid, JSON.stringify(record));
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
            runApp();
            return false;
        }
    }
})();


