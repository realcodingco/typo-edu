/**
 * 메인페이지에서 step 선택 후 열리는 학습 화면 : 교재, 에디터, 에뮬레이터
 */
var bookReady = false; // 학습기록 표시할 때 사운드가 재생되지 않도록
let typingCount = 0;
let typingStart = false;
let typingTime, record;
let clickedRunBtn = false;
(function() {
    initDatabase();
    let userData, emulator, editSection, pageData, timer;
    let courseData, lecBooks;
    let autoSubmit; // 퀴즈자동제출 여부.

    const setVh = () => { // 교재영역 접고 열때 화면위로 밀리는 현상 대응
        document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);
        document.documentElement.style.setProperty('--halfHeight', `-${window.innerHeight/2}px`);
    };
    window.addEventListener('resize', setVh);
    setVh();

    const decoded = atob(location.search.slice(4));
    const params = decoded.split('&');
    const searchParams = (arr, keyword) => {
        const exist = arr.filter(el => el.includes(keyword))[0];
        if(exist){
            return exist.split('=')[1];
        }
        else {
            return false;
        }
    };

    const crs = searchParams(params, 'p_cpsubj');
    const mid = searchParams(params, 'p_userid');
    const bookId = searchParams(params, 'book'); 
    const groupId = searchParams(params, 'bid'); 
    const page = searchParams(params, 'page');
    const quiz = searchParams(params, 'q');
    const crsStart = searchParams(params, 'edustart');

    window.crs = crs;
    window.mid = mid;
    window.crsStart = crsStart;
    window.bookId = bookId;

    getCrsBookData(crs, function(json) {
        courseData = json.courseData;
        lecBooks = json.bookData;
        init();
    });

    function init(){
        if(!mid) {
            toastr.error('접근 권한이 없습니다.');
            return;
        }
        getUserData({groupId:groupId, crsStart:crsStart, mid:mid}, function(data) {
            userData = data; 
            record = Object.keys(userData).length != 0 ? userData.course[crs] : null;
            if(!record) {
                toastr.error('잘못된 접근입니다.');
                return;
            }

            if(!record.progress) record.progress = {};
            if(!quiz && !record.progress[bookId]) record.progress[bookId] = {};
            
            if(quiz) {
                // window.addEventListener('beforeunload', (event) => {                     
                //     event.preventDefault();
                //     event.returnValue = '';
                // });
                const quizWindow = BX.component(learn.quizWindow).appendTo(topBox);
                quizWindow.find('.listbtn')[0].onclick = e => { // 돌아가기 버튼 클릭 : 남은 시간 저장.
                    if(!userData.course[crs].quiz.score) { //퀴즈 최종제출 이전일때만 기록
                        clearInterval(timer);
                        $('.quizTimer')[0].style.animationPlayState = 'paused';
                        let restTime = $('.timerDisplay')[0].innerText;
                        const ms = restTime.split(':');
                        restTime = (Number(ms[0]) * 60) + Number(ms[1]);
                        
                        userData.course[crs].quiz.testTime = restTime;
                        updateUserData({groupId: groupId, mid : mid, data: userData, crsStart: crsStart}, function(){
                            const queryStr = `p_cpsubj=${crs}&p_userid=${mid}&edustart=${crsStart}`;
                            location.href = `index.html?eq=${btoa(queryStr)}#`;
                        });
                    } 
                    else {
                        const queryStr = `p_cpsubj=${crs}&p_userid=${mid}&edustart=${crsStart}`;
                        location.href = `index.html?eq=${btoa(queryStr)}#`;
                    }
                };
                const quizGuide =BX.component(learn.quizGuide).appendTo(topBox);
                // 팝업 시작하기 버튼 클릭이벤트 
                quizGuide.find('button')[0].onclick = openQuiz;
                window.checkedExample = checkedExample;
                window.submitQuiz = submitQuiz;
            }
            else {
                BX.component(learnWindow.main).appendTo(topBox); // 에디터, 에뮬레이터
                editSection = $('.editSection');
                emulator = $('.emulator');
                emulator.find('.appWindow')[0].addEventListener('mousemove', mousemove);
                emulator.find('.appWindow')[0].addEventListener('mouseout', mouseout);
                const consoleDiv = $('.consolewindow');
                $('.editSection .fn-btn > :contains("play_arrow")')[0].onclick = runApp; //실행 버튼
                window.consoleDiv = consoleDiv;
                window.saveUserData = saveUserData;
                window.finishChapter = finishChapter;
                window.runApp = runApp;
                
                setTimeout(e => { //(타수-백스페이스*3) / 경과시간(초) * 60초
                    $('.aceEditor')[0].onkeypress = e => { //
                        if(!typingStart) {
                            typingTime = Date.now();
                            typingStart = true;
                        }
                        typingCount++;
                    }
                    $('.aceEditor')[0].onkeyup = e => { // 백스페이스 감지
                        if(e.key == 'Backspace') {
                            typingCount--;
                        }
                        let totalText = $('.ace_editor')[0].aceEditor.getValue().length; //입력된 전체 글자수
                        let duringtime = (Date.now() - typingTime) / 1000;
                        let typingResult = parseInt(typingCount/duringtime * 60);
                        if(!isNaN(typingResult) && typingResult > 0){
                            $('.typingCount')[0].innerHTML = `<font size=3><b>${typingResult}</b></font> 타/분`;
                        }
                    }
                }, 500);
                
                BX.component(learn.lessonWindow).appendTo(editSection[0]); // 교재페이지
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
                        lessonBook(pageData, json.title).appendTo($('.lessonBook')[0]);
                        setTimeout(checkStudied, 500);
                    }
                })
                .fail((xhr, status, error) => {});
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
        let recordSecond = 30;
        timer = setInterval(() => {
            $('.quizTimer')[0].style.animationPlayState = 'running';
            if(second == 0) second = 60;
            if(second == 60) minute--;
            second--;
            
            $('.timerDisplay')[0].textContent = `${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
            recordSecond--;
            
            userData.course[crs].quiz.testTime = (minute * 60) + second; //남은 시간 업데이트
            //남은 시간을 30초 단위로 기록
            if(recordSecond == 0) {
                recordSecond = 30;
                updateUserData({groupId: groupId, mid : mid, data: userData, crsStart: crsStart});
            }
            
            // 학습종료일 자정이 경과된 시점에 자동 제출
            const today = new Date();
            const deadline = new Date(today.getFullYear(), today.getMonth() + 1, 1).getTime();
            if(Date.now() >= deadline) { 
                autoSubmit = true;
                minute = 0;
                second = 0;
            }   

            if(minute == 0 && second == 0) { // 시간 종료. 제출하기 버튼 자동 클릭.
                autoSubmit = true;
                document.querySelector('.quizbutton').click(); 
            }
        }, 1000);
    }

    /**
     * 퀴즈 팝업 시작하기 버튼 클릭 이벤트 핸들러
     * @param {*} e 
     */
    function openQuiz(e) {
        let testTime = userData.course[crs].quiz.testTime; 
        if(!testTime){ // 응시시간 초기화 데이터 저장
            testTime = 3600;
            userData.course[crs].quiz.testTime = testTime;
            userData.course[crs].quiz.entrance = {time: Date.now(), count: 0};
        }
        // 입장기록 entrance time, counter
        let entrance = userData.course[crs].quiz.entrance.count;
        userData.course[crs].quiz.entrance.time = Date.now(); // 마지막 입장시점
        userData.course[crs].quiz.entrance.count = entrance + 1; //입장할때마다 카운트 기록
        updateUserData({groupId: groupId, mid : mid, data: userData, crsStart: crsStart});

        $('.quizGuidePop')[0].remove();
        let minute = Math.floor(testTime / 60);
        let second = testTime % 60;
        $('.timerDisplay')[0].textContent = `${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
        
        startTimer(minute, second);
    }

    /**
     * 퀴즈 최종 제출하기 버튼 클릭 이벤트 핸들러
     * @param {*} e 
     */
    function submitQuiz(e) {
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
            let score = 5 * correct; // 20문항 5점씩, 100점 만점
            userData.course[crs].quiz.score = score; // score 데이터가 있다면 최종 제출된 상태임
            userData.course[crs].quiz.solve.correctCount = correct;
            userData.course[crs].quiz.solve.incorrectCount = incorrect;
            userData.course[crs].quiz.solve.time = Date.now();
            updateUserData({groupId: groupId, mid : mid, data: userData, crsStart: crsStart}, function(){
                toastr.success('최종 제출되었습니다.');
                //버튼 숨기고, 제출되었다 안내하고 모든 버튼 클릭 이벤트 없앰
                $(e.target).hide();
                $('.quizexamples').each(function(i, exp) {
                    exp.onclick = 'disable';
                });
            });
        };

        // 응시시간이 경과해 자동제출하는 경우, 묻지 않고 
        if(autoSubmit == true) {
            finalSubmit();
            return;
        }
        
        setTimeout(()=>{
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
        }, 500);
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

    function editorUpdate() {
        const editor =  $('.ace_editor')[0].aceEditor;
        //높이 자동조절
        $('.ace_editor')[0].style.height = editor.getSession().getDocument().getLength() * editor.renderer.lineHeight + editor.renderer.scrollBar.getWidth() + 'px';
        editor.resize();
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
        // 교재모드인 경우, 코드기록 삭제, 배경코드 출력
        const editor =  $('.ace_editor')[0].aceEditor;
        const codeId = $('.appTitle')[0].id;
        const pageId = $('.appTitle')[0].getAttribute('data-pid');

        if(codeId) {
            const deletedTarget = record.progress[bookId] && record.progress[bookId][pageId].code[codeId];
            if(deletedTarget) {
                delete record.progress[bookId][pageId].code[codeId];
                userData.course[crs] = record;
        
                //merge의 경우, 없는(삭제) 데이터는 그대로 남으므로, update 아닌 write로 저장
                putUserData({groupId: groupId, mid : mid, data: userData, crsStart: crsStart}, (result) => {
                    toastr.success('코드 기록이 삭제되었습니다.');
                });
            }

            const data = pageData.filter(o => Object.keys(o)[0] == pageId)[0];
            const content = data[pageId].content;
            const compData = content.filter( o => o.codeId && o.codeId == codeId)[0];
    
            let bgCode;
            // practice direction의 경우, bgCode가 없으므로. 앱 컴포넌트 데이터에서 appCode 가져오기
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
        typingCount = 0;
        typingStart = false;
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

            const bookData = record.progress[bookId];

            if(!bookData[pageId]) { // 페이지 데이터가 없으면
                bookData[pageId] = {code : {}};
            }

            bookData[pageId].code[codeId] = codeData;
            record.progress[bookId] = bookData;
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
        document.title = 'Final Quiz';
        
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
    /**
     * 퀴즈 풀이 데이터 기록을 위한 userData 업데이트
     * @param {*} target - 클릭한 보기 문항요소
     * @returns 
     */
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
        solveDetail.time = Date.now(); // 보기 문항을 클릭한 시점
        //기록  보기를 선택할 때마다 
        if(!userData.course[crs].quiz.solve) userData.course[crs].quiz.solve = {};
        if(!userData.course[crs].quiz.solve.detail) userData.course[crs].quiz.solve.detail = new Array(20).fill({});
        userData.course[crs].quiz.solve.detail[target.dataset.q-1] = solveDetail;
    }

    /**
     * pageData로 교재 생성
     * @param {object} pageData 배열
     * @param {string} title - 교재제목
     * @returns 생성된 페이지 box
     */
    function lessonBook(pageData, title) {
        const b = box();
        const book = pageData;
        document.title = title;
        const appendNav = function () {
            const navBg = $('.bookNav'); 
            for(let pages of book) {
                const pageId = Object.keys(pages)[0];
                const btn = box().appendTo(navBg[0]).html(navBg.children().length);
                btn.attr('name', pageId);

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
                    else if(page == String(Object.keys(book).length)){ // 마지막 페이지의 다음 버튼
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
     * 학습자 진도기록용 클릭이벤트 : 체크, 스크래치 박스 등 id를 가진 컨텐츠
     * @param {*} target 클릭요소 
     * @param {boolean} justData - 데이터 업데이트(저장) 여부
     * @returns 
     */
    function saveUserData(target, justData) {
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

        if(!justData) { 
            updateProgressData(record);
        }
    }

    /**
     * 학습자 진도기록 업데이트
     * @param {*} record 
     */
    function updateProgressData(record) {
        // 교재편집을 위한 테스트 모드에서는 update 제외
        if(new URLSearchParams(location.search).get('edit') == 'on') {
            return;
        } 
        
        userData.course[crs] = record;
        updateUserData({groupId: groupId, mid : mid, data: userData, crsStart: crsStart});
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
        
        let lastEl = [];
        if(studied) {
            const hidebox = $('.hideb');
            hidebox.each(function(i, b) {
                const hideTarget = $(b).children()[0];
                if(studied.includes(hideTarget.id)) {
                    hideTarget.click();
                    lastEl.push(hideTarget);
                }
            });

            const checks = $('input.read_check');
            checks.each(function(i, b) {
                if(b.type == 'checkbox' && studied.includes(b.id)){
                    b.click();
                    b.disabled = true;
                    $($(b).parent()[0]).removeClass('clickRequired');
                    lastEl.push($(b).parent()[0]);
                }   
            });    
        }
        // 페이지 체크요소가 모두 완료된 상태가 아니면, 마지막 체크 요소 위치로 스크롤
        if(isReadAll().length != 0 && page && lastEl.length > 0) { 
            const position = lastEl.map(o => {
                return o.getBoundingClientRect().top;
            });

            const target = lastEl[position.indexOf(Math.max(...position))];
            target.scrollIntoView({block: 'start'});
        }

        bookReady = true;
    }

    /**
     * 이전 버튼 클릭이벤트
     */
    function movePrevPage() {
        const decoded = atob(location.search.slice(1).slice(3));
        const splited = decoded.split('&');
        const pageStr = splited.filter(o => o.includes('page'))[0];
        const idx = splited.indexOf(pageStr);
        splited[idx] = `page=${Number(page) - 1}`;
        const encoded = btoa(splited.join('&'));
        location.href = `makeroom.html?eq=${encoded}`;
    }

    /**
     * 다음 버튼 클릭이벤트
     */
    function moveNextPage(e) {
        const notReaded = isReadAll();
        
        if(notReaded.length != 0) {
            const position = notReaded.map(o => {
                const target = document.getElementById(o);
                return target.getBoundingClientRect().top;
            });
            const firstEl = notReaded[position.indexOf(Math.min(...position))];
            const target = document.getElementById(firstEl); 
            target.scrollIntoView({block:'start', behavior:'smooth'});
            toastr.error(`미확인 체크박스를 확인하고 다시 시도하세요.`);
            return;
        }
        
        const decoded = atob(location.search.slice(1).slice(3));
        const splited = decoded.split('&');
        const pageStr = splited.filter(o => o.includes('page'))[0];
        const idx = splited.indexOf(pageStr);
        splited[idx] = `page=${Number(page) + 1}`;
        const encoded = btoa(splited.join('&'));
        location.href = `makeroom.html?eq=${encoded}`;
    }

    /**
     * 학습완료 체크박스 클릭이벤트 핸들러
     * @param {*} e 
     * @returns 
     */
    function finishChapter(e) {
        if(location.pathname.includes('makeBook')) return; // 교재편집 페이지에서는 제외

        const finishCheckBox = e.target;
        //페이지의 모든 체크박스 확인 후, 중간진도 전송
        if(isReadAll().length != 0) {
            $(finishCheckBox).prop('checked', false); //체크해제
            toastr.error('아직 확인하지 않은 체크박스를 먼저 확인하고 다시 시도하세요.');
            return;
        }

        if ( bookReady && $(finishCheckBox).prop('checked') ) {
            const parent = $($(finishCheckBox).parent()[0]);
            parent.removeClass('clickRequired');
            saveUserData(finishCheckBox, true); //update 없이 데이터 정리만
            userData.course[crs] = record;

            calcProgress(courseData, lecBooks, crs, userData, function(result) { 
                //result는 전체 progress(%), 중간 진도 전송
                const progress = result; 
                postProgress(crsStart.substring(0, 4), record.courseCd, record.courseCsNo, mid, progress, function(done){
                    if(!done.ok) {
                        $(finishCheckBox).prop('checked', false);
                        toastr.error('진도기록에 실패했습니다. 다시 시도하세요.');
                        return;
                    }

                    playSound('choice'); console.log(done, 'response');
                    e.target.disabled = true;
                    userData.course[crs].totalProgress = progress; // 진도전송시마다 totalProgress 업데이트
                    updateUserData({groupId: groupId, mid : mid, data: userData, crsStart: crsStart});
                });
            });
        }
    }

    /**
     * 롯데 이지러닝 중간진도 전송
     * @param {*} year 
     * @param {*} courseCd 
     * @param {*} courseCsNo 
     * @param {*} mid 
     * @param {*} progress 
     * @param {*} fn 
     * @returns 
     */
    function postProgress(year, courseCd, courseCsNo, mid, progress, fn) {
        // 그룹이 롯데가 아니거나, 수강기간이 아니거나 테스트 기간에는 진도 전송되지 않도록
        if(groupId != 'lotte' || !isTakingClass(crsStart) || parseInt(crsStart) < 20230501) { 
            fn && fn({ok: true});
            return;
        }

        var url = "https://www.realcoding.co/cest/lotte-post-evaluate";
        var param = {
            year : year,
            courseCd : courseCd,
            courseCsNo : courseCsNo,
            userId : mid,
            progScore : progress
        };

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify(param),
        })
        .then((response) => fn && fn(response));
    }

    /**
     * 에디터 코드실행 ctrl + s 단축키 사용 키 이벤트
     */
    let isCtrl, isSkey;
    document.onkeyup = function(e) {
        if (e.key == 'Control')  isCtrl = false;
        if (e.key == 's')  isSkey = false;
    }
    document.onkeydown = function(e) {
        if(e.key == 'Control') isCtrl = true; 
        if(e.key == 's') isSkey = true; 
        if(isSkey && isCtrl) {
            $('.editSection .fn-btn > :contains("play_arrow")')[0].click();
            return false;
        }
    }
})();