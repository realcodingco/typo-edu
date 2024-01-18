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
    let userData, emulator, editSection, pageData, timer, bookType;
    let courseData, lecBooks;
    let autoSubmit; // 퀴즈자동제출 여부.
    
    const setVh = () => { // 교재영역 접고 열때 화면위로 밀리는 현상 대응
        document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);
        document.documentElement.style.setProperty('--halfHeight', `-${window.innerHeight/2}px`);
        if(bookType == 'card' && window.innerWidth > 1200) {
            $('.lessonWindow').css('left', 'calc(50% - 600px)'); //교재가 한 가운데 오도록
        }
        else {
            $('.lessonWindow').css('left', '0px');
        }
    };
    setVh();

    let allowPage = 0; //*** 진도체크 후, 열람가능 페이지 설정
    const swiper = new Swiper('.swiper', {
        init: false,
        initialSlide: 0,
        speed: 1000,
        freeMode : false, 
        // grabCursor: true,
        allowSlideNext: false, // 기본적으로 오른쪽 스와이프는 제한, 페이지가 열린 후 부터 가능. 
        effect: "creative",
        activeIndex: allowPage,
        observer: true,	// 추가
        observeParents: true,
        keyboard: {
            enabled: true,
            // onlyInViewport: true 
        },
        creativeEffect: { //3
            prev: {
              shadow: true,
              translate: ["-20%", 0, -1],
            },
            next: {
              translate: ["100%", 0, 0],
            },
        },
        pagination: {
            el: ".swiper-pagination",
            type: "progressbar",
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
    });
    swiper.on('init', console.log('start'));
    swiper.on('slideChange', onSlideChange); //슬라이드 변경 이벤트
    swiper.on('activeIndexChange', onSliderFirstMove); // 다음 페이지 넘어가기 제어 sliderFirstMove
    swiper.on('keyPress', (swiper, keyCode) => { // 키사용시에도 슬라이드 변경 이벤트 적용
        switch(keyCode) {
            case 37:
            case 39:
                onSlideChange();
        }
    });
    window.swiper = swiper;

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
    window.groupId = groupId;
    window.resultByCodebtn = resultByCodebtn;
    window.backSpaceCode = backSpaceCode;
    window.resetTabEditor = resetTabEditor;
    window.onSelectCodeBlock = onSelectCodeBlock;
    window.onConsoleFromChild = onConsoleFromChild;
    window.toggleSwipeLock = toggleSwipeLock;
    window.showPythonResult = showPythonResult;

    getCrsBookData(crs, function(json) {
        courseData = json.courseData;
        lecBooks = json.bookData;
        bookType = courseData[crs].type;
        if(bookType == 'card') {
            document.documentElement.style.setProperty("--fontSize", '16px');
        }
        document.documentElement.style.setProperty("--font", courseData[crs].font); //교재 폰트 설정 
        document.documentElement.style.setProperty("--fontColor", courseData[crs].fontColor); //교재 폰트색 설정 
        document.documentElement.style.setProperty("--bgColor", courseData[crs].page_bgColor); //배경색 설정
        if(courseData[crs].page_bgImage) document.documentElement.style.setProperty("--bgimage", courseData[crs].page_bgImage);

        // if(bookType != 'card') 
        window.addEventListener('resize', setVh);
        init();
    });

    /**
     * 코드박스 제목영역 클릭이벤트 : swiper 잠금 토글기능. 
     * @param {*} e 
     */
    function toggleSwipeLock(e) {
        const title = $(e.target); 
        if(title.prop('tagName') == 'SPAN') return;
        if(title.hasClass('lock')) { //해제
            toastr.options.closeButton = true;
            toastr.options.extendedTimeOut = 60;
            toastr.options.timeOut = 3000;
            toastr.remove();
            $(e.target).removeClass('lock');
            swiper.enable();
        }
        else { //잠금
            toastr.error('해제시 제목영역 클릭', '페이지 이동 잠금 활성화', {   
                closeButton : false, //닫기버튼 없애기
                extendedTimeOut : 0,
                timeOut : 0,//창 계속 플러팅
                positionClass: "toast-bottom-center",
            });
            $(e.target).addClass('lock');
            swiper.disable();
        }
        
    }

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
                        let quizTestTimeData = {}; //퀴즈 남은시간 firestore 저장
                        quizTestTimeData[`course.${crs}.quiz.testTime`] = restTime;
                        updateUserData({groupId: groupId, mid : mid, data: quizTestTimeData, crsStart: crsStart}, function(){
                            const queryStr = `p_cpsubj=${crs}&p_userid=${mid}&edustart=${crsStart}&bid=${groupId}`;
                            location.href = `index.html?eq=${btoa(queryStr)}#`;
                        });
                    } 
                    else {
                        const queryStr = `p_cpsubj=${crs}&p_userid=${mid}&edustart=${crsStart}&bid=${groupId}`;
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
                window.finishChapter = finishChapter;
                window.completeChapter = completeChapter;
                window.runApp = runApp;
                window.saveUserData = saveUserData;
                
                setTimeout(e => { //(타수-백스페이스*3) / 경과시간(초) * 60초
                    $('.editSection .aceEditor')[0].onkeypress = e => { //
                        if(!typingStart) {
                            typingTime = Date.now();
                            typingStart = true;
                        }
                        typingCount++;
                    }
                    $('.editSection .aceEditor')[0].onkeyup = e => { // 백스페이스 감지
                        if(e.key == 'Backspace') {
                            typingCount--;
                        }
                        let totalText = $('.editSection .ace_editor')[0].aceEditor.getValue().length; //입력된 전체 글자수
                        let duringtime = (Date.now() - typingTime) / 1000;
                        let typingResult = parseInt(typingCount/duringtime * 60);
                        if(!isNaN(typingResult) && typingResult > 0){
                            $('.typingCount')[0].innerHTML = `<font size=2><b>${typingResult}</b></font> 타/분`;
                        }
                    }
                }, 500);
                
                BX.component(learn.lessonWindow).appendTo(editSection[0]); // 교재페이지
                if(bookType == 'card') { //파이썬 초급인경우
                    if(window.innerWidth > 1200) { //pc인 경우,
                        $('.lessonWindow').css('left', 'calc(50% - 600px)');
                        $('.lessonWindow').css('max-width', '1200px');
                    }

                    $('.lessonWindow > span:nth-child(1)').hide(); // js에디터 확대/축소 아이콘 숨기기
                    $('.roomBg').css('height', 'var(--vh)');
                    $('.pageTopBtn').hide();

                    //불필요한 요소 감추기
                    $('.editSection > :not(:last-child)').hide();
                    $('.consolewindow').hide();
                }
                else {
                    if(window.innerWidth > 1200) {
                        $('.lessonBook').css('max-width', '1200px');
                    }
                    if(window.innerWidth < 720) {
                        // $('.editSection').css('zoom', '0.8');
                    }
                }
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
                        
                        setTimeout(() => {
                            swiper.init();
                            checkStudied();
                            //if(bookType == 'card' && window.innerWidth > 900) $('.lessonWindow').addClass('card');
                        }, 500);
                        

                        $('.cardBook_pageNextBtn > div').on('click', e => { // 계속하기 버튼 동작시 다음슬라이드로 넘기기
                            // 진도기록. 
                            if(location.pathname.includes('makeBook')) return;
                            if ( bookReady ) {
                                saveUserData(e.target);
                            }

                            swiper.allowSlideNext = true;
                            swiper.slideNext();
                            allowPage = swiper.snapIndex;
                            swiper.activeIndex = allowPage;
                            swiper.allowSlideNext = false;
                            $(e.target).parent().remove();
                            $(swiper.clickedSlide).find('>:nth-child(1)').css('height', '100%');
                        });

                        $('.cardBook_confirmBtn > div').on('click', e => { // 확인 버튼 동작 : 카드교재 퀴즈 정답 확인 후, 슬라이드 넘기기
                            // 진도기록. 
                            if(location.pathname.includes('makeBook')) return;  
                            
                            const target = $(swiper.clickedSlide).find('.cardQuizExpBox').parent();
                            const submited = localStorage.getItem('cardQuizSubmit');
                            if(!submited) {
                                const msg = box().appendTo($(swiper.clickedSlide).children()[0]).fontSize(10).textColor('red').textAlign('center').text('정답을 클릭하고 진행하세요');
                                setTimeout(function(){$(msg).remove();}, 1200);
                                return;
                            }
                            if(target[0].dataset.a == submited) { //정답확인
                                playSound('choice');
                                swiper.allowSlideNext = true;
                                swiper.slideNext(); 

                                let studiedPage = JSON.parse(localStorage.getItem('study_done'));
                                if ( bookReady && !studiedPage.includes(swiper.snapIndex) ) { 
                                    saveUserData(e.target);
                                    studiedPage.push(swiper.snapIndex);
                                    localStorage.setItem('study_done', JSON.stringify(studiedPage));

                                    if(swiper.snapIndex > allowPage) {
                                        allowPage = swiper.snapIndex;
                                        swiper.activeIndex = allowPage;
                                        swiper.allowSlideNext = false;
                                    }
                                }
                            }
                            else {
                                const msg = box().appendTo($(swiper.clickedSlide).children()[0]).fontSize(10).textColor('aqua').textAlign('center').text('다시 생각해보세요');
                                setTimeout(function(){$(msg).remove();}, 1200);
                            }
                            
                            // $(e.target).parent().remove();
                        });
                    }
                })
                .fail((xhr, status, error) => {});
            } 
            else { // 에디터 모드
                $('.appTitle')[0].innerText = 'New App';
                $('.lessonWindow').addClass('play');
                $('.editSection > :first-child').addClass('play');
                $('.editSection .aceEditor').addClass('play');
                $('.emulator').addClass('play');
            }

            if(!quiz){
                const targetApp = location.hash.slice(1);
                setTimeout(() => {
                    const editor =  $('.editSection .ace_editor')[0].aceEditor;
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
     * 탭에디터 코드블록 리셋 버튼 클릭이벤트
     * @param {*} e 
     */
    function resetTabEditor(e) {
        const codeBlock = $(swiper.clickedSlide).find('.codeBlock');
        for(let i=0; i<codeBlock.length; i++) {
            codeBlock[i].innerText = '';
        }
        $(swiper.clickedSlide).find('.codebtn').removeClass('clicked');
        $(swiper.clickedSlide).find('.codebtn').removeAttr('data-idx');
        const initCode = $(swiper.clickedSlide).find('.lessonTabEditor')[0].dataset.code;//localStorage.getItem('editor_initial_code', initCode);
        $(swiper.clickedSlide).find('.ace_editor')[0].aceEditor.setValue(initCode);
    }

    /**
     * 탭에디터 코드블록 하나씩 지우기 버튼 클릭이벤트
     * @param {*} e 
     */
    function backSpaceCode(e) {
        const codeBlocks = $(swiper.clickedSlide).find('.codeBlock');
        const initCode = $(swiper.clickedSlide).find('.lessonTabEditor')[0].dataset.code; //초기코드
        
        const resetEditorValue = function(idx) {
            $(codeBlocks[idx]).text('');
            $(`.codebtn[data-idx="${idx}"]`).removeClass('clicked');
            $(`.codebtn[data-idx="${idx}"]`).removeAttr('data-idx');
            
            //에디터 코드에 적용 : 
            let modifyCode = initCode;
            let count = 0;
            let buffer = 0;
            for(let j=0; j<initCode.length; j++) {
                if(initCode[j] == '^') { //선택된 텍스트로 바꿔주기.
                    const targetBtn = $(`.codebtn[data-idx="${count}"]`)[0];
                    const txt = targetBtn ? targetBtn.innerText : '^';
                    modifyCode = modifyCode.replaceAt(j + buffer, txt);
                    buffer = txt.length > 1 ? buffer + txt.length - 1 : buffer;
                    count++;
                }
            } 
            $(swiper.clickedSlide).find('.ace_editor')[0].aceEditor.setValue(modifyCode);  
        }
        
        for(let i=0; i<codeBlocks.length; i++) { //마지막 블록 : 차례대로 순회하다가 글자가 없는 블록을 만나면..
            const code = $(codeBlocks[i]).text();
            if(!code) { 
                resetEditorValue(i-1);
                break;
            }

            if(i == codeBlocks.length-1) { //모두 채워진 상태라면
                resetEditorValue(i); 
            }
        }
    }

    /**
     * 파이썬 코드 실행
     */
    function runPythonCode(codeText, mode) {
        localStorage.setItem('_local_preview_src_', codeText);
        const iframeSrc = './pyrunner.html?console_target=onConsoleFromChild&p=_local_once_code_&code_lang=python312&code_name=_local_preview_src_';
        
        if(mode == 'spreadsheet') { // 스프레드시트 실행모드인 경우,
            const runBox = BX.component(lesson.spreadsheetRunBox).appendTo($('.swiper-slide-active > :nth-child(1)')[0]);
            $(runBox).find('iframe')[0].src = iframeSrc;

            setTimeout(()=> { 
                const tableHeight = $(runBox).find('iframe').contents().find('#view div > div').height();
                $(runBox).find('iframe')[0].height = tableHeight;
                $(runBox).css('opacity', 1);
                $('.swiper-slide-active > :nth-child(1)').animate({
                    scrollTop: $('.swiper-slide-active > :nth-child(1)')[0].scrollHeight
                }, 400);

                if(window.innerWidth < 900) { // 셀 박스 편집되지 않도록 : 모바일에서 키보드자판 생성 
                    const cellbox = $(runBox).find('iframe').contents().find('#view div > div > span[contenteditable=true]');
                    // $(cellbox).attr('contenteditable', 'false');
                }
                
            }, 500);
            
            
        }
        else {
            const runBox = BX.component(lesson.defaultRunBox).appendTo($('.swiper-slide-active > :nth-child(1)')[0]);
            $(runBox).find('iframe')[0].src = iframeSrc;
            $(runBox).find('iframe')[0].height = 0;
        }
       
    }

    /**
     * 코드블록을 선택했을 때 클릭이벤트
     * @param {*} e 
     * @returns 
     */
    function onSelectCodeBlock(e){
        const selectedCode = e.target.innerText;
        if($(e.target).hasClass('clicked')) { //이미 클릭된 버튼은 미작동
            return;
        }

        //codeBlock에 텍스트 넣기. 클릭된 박스는 클릭 disable 글자 감추기
        const target = $(swiper.clickedSlide).find('.codeBlock');
        for(let i=0; i<target.length; i++) {
            if(!$(target[i]).text()) { // 첫번째 빈 블록에 텍스트 채우기, 차례대로
                $(target[i]).text(selectedCode);
                $(e.target).addClass('clicked');
                e.target.dataset.idx = i;
                break;
            }
        }
        //에디터 코드도 변경 : 클릭한 코드만 ^ 위치로..replace
        const arr = $('.swiper-slide-active .playCodeBox').children();
        let totalCodeText = '';
        for(let line=0; line<arr.length; line++) {
            totalCodeText += arr[line].innerText + '\n';
        }
        let prevTxt = $(swiper.clickedSlide).find('.ace_editor')[0].aceEditor.getValue();
        prevTxt = prevTxt.replace("^", selectedCode);
        $(swiper.clickedSlide).find('.ace_editor')[0].aceEditor.setValue(prevTxt);
        
    }

    /**
     * 탭 에디터 코드블록 조합 후 실행 버튼 클릭이벤트
     * @param {*} e 
     * @returns 
     */
    function resultByCodebtn(e){
        //다음 슬라이드 넘기기
        const target = $(swiper.clickedSlide).find('.codeBlock');
        let incorrect = 0;
        let empty = 0;
        for(let i=0; i<target.length; i++) {
            if(target[i].innerText != target[i].dataset.a){ 
                incorrect++;
            }
            if(target[i].innerText == '') empty++;
        }
        
        if(empty > 0) {
            const msg = box().appendTo($(swiper.clickedSlide).children()[0]).fontSize(10).textColor('aqua').textAlign('center').text('코드블록을 완성하고 다시 시도하세요.');
            setTimeout(function(){$(msg).remove();}, 1200);
            return;
        }

        if(incorrect > 0) { //틀림
            const msg = box().appendTo($(swiper.clickedSlide).children()[0]).fontSize(10).textColor('aqua').textAlign('center').text('다시 생각해보세요');
            setTimeout(function(){$(msg).remove();}, 1200);
        }
        else {// 정답임. 결과 보여주고, 계속하기 버튼 노출
            if(e.target.dataset.run == 'true') { 
                const runMode = e.target.dataset.mode;
                const curSlide = $('.swiper-slide-active > :nth-child(1)')[0];
                const outputWin = $(curSlide).find('.outputWindow').length == 0 ? BX.component(lesson.outputWindow).appendTo(curSlide) : $('.outputWindow');
                $(outputWin).children()[0].dataset.mode = runMode;
                //배경코드가 있으면 합치기
                const bgcode = $(swiper.clickedSlide).find('.playCodeBox')[0].dataset.bgcode;
                let codeText = $(swiper.clickedSlide).find('.ace_editor')[0].aceEditor.getValue();
                
                const finalcode = bgcode ? bgcode + codeText : codeText;
                runPythonCode(finalcode, runMode);
            }
            playSound('choice');
            switchBtn();
        }
    }

    function showPythonResult(e) { //재실행이므로.. 기존 결과는 초기화
        $(swiper.clickedSlide).find('.outputWindow :nth-child(2)').empty();
        $(swiper.clickedSlide).find('.spreadsheetRun').remove();
        //배경코드가 있으면 합치기
        const bgcode = $(swiper.clickedSlide).find('.playCodeBox')[0].dataset.bgcode;
        let codeText = $(swiper.clickedSlide).find('.ace_editor')[0].aceEditor.getValue();
        
        const mode = $(swiper.clickedSlide).find('.outputWindow :nth-child(1)')[0].dataset.mode;
        
        const finalcode = bgcode ? bgcode + codeText : codeText;
        runPythonCode(finalcode, mode);
        playSound('choice');
    }

    /**
     * 계속하기 버튼 숨기기
     * @param {*} target 
     */
    function hideContinueBtn(target) {
        const continuebtn = $(target).find('.cardBook_pageNextBtn');
        continuebtn.hide();
        $(swiper.slides[swiper.snapIndex]).find('>:nth-child(1)').css('height', '100%');
    }

    /**
     * 계속하기 버튼 노출, 코드블록버튼 상자 숨기기
     */
    function switchBtn() {
        const continuebtn = $(swiper.clickedSlide).find('.cardBook_pageNextBtn');
        continuebtn.show();
        $(swiper.slides[swiper.snapIndex]).find('>:nth-child(1)').css('height', 'calc(100% - 70px)');
        $(swiper.clickedSlide).find('.codeBtnBox').addClass('off');
    }

    /**
     * 슬라이드 넘어갈때 넘기기 허용 설정
     */
    function onSliderFirstMove() {  
        if(swiper.snapIndex < allowPage) {
            swiper.allowSlideNext = true; 
        }
        else {
            swiper.allowSlideNext = false; 
        }
    }

    /**
     * 교재 슬라이드가 바뀔때마다 실행되는 이벤트 
     */
    function onSlideChange() { 
        const iframe = $(swiper.clickedSlide).find('iframe');
        if(iframe.length != 0) {  //교재 내 타이머 clearTimer를 위한.
            iframe[0].remove();
        }

        const afterChangeSlide = $(swiper.slides[swiper.snapIndex]);
        //playSound('swipebook');
        localStorage.removeItem('cardQuizSubmit');
        $('.cardQuizExpBox').removeClass('selected');

        const targetEditor = afterChangeSlide.find('.ace_editor')[0]; 
        if(targetEditor){
            const initCode = targetEditor.aceEditor.getValue();
            localStorage.setItem('editor_initial_code', initCode);
        }
        
        // 페이지 선택상자도 같이..
        $('.slidePagenation')[0].options[swiper.snapIndex].selected = true;
        
        const codebtnBox = afterChangeSlide.find('.codeBtnBox'); 
        if(codebtnBox.length > 0 && !codebtnBox.hasClass('off')) hideContinueBtn(swiper.slides[swiper.snapIndex]);

        //넘겨진 페이지의 재생중인 동영상은 정지
        const studyVideo = $(swiper.clickedSlide).find('.video-js')[0];
        if($(studyVideo).hasClass('vjs-playing')) {
            videojs.getPlayer(studyVideo.id).pause();
        }
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

                let intermediateData = {};//userData.course[crs].quiz.solve.detail 퀴즈 풀이내용, 남은 시간 저장
                intermediateData[`course.${crs}.quiz.solve.detail`] = userData.course[crs].quiz.solve.detail;
                intermediateData[`course.${crs}.quiz.testTime`] = userData.course[crs].quiz.testTime;
                updateUserData({groupId: groupId, mid : mid, data: intermediateData, crsStart: crsStart});
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

        let quizEntranceData = {}; // firestore 입장 시간, 횟수 저장
        quizEntranceData[`course.${crs}.quiz.entrance.time`] = userData.course[crs].quiz.entrance.time;
        quizEntranceData[`course.${crs}.quiz.entrance.count`] = firebase.firestore.FieldValue.increment(1);
        updateUserData({groupId: groupId, mid : mid, data: quizEntranceData, crsStart: crsStart});

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

            let lastsubmitData = {};
            lastsubmitData[`course.${crs}.quiz.score`] = score;
            lastsubmitData[`course.${crs}.quiz.solve.detail`] = solve; //풀이기록도 저장...
            lastsubmitData[`course.${crs}.quiz.solve.correctCount`] = correct;
            lastsubmitData[`course.${crs}.quiz.solve.incorrectCount`] = incorrect;
            lastsubmitData[`course.${crs}.quiz.solve.time`] = userData.course[crs].quiz.solve.time;
            updateUserData({groupId: groupId, mid : mid, data: lastsubmitData, crsStart: crsStart}, function(){
                toastr.success('최종 제출되었습니다.', '제출 완료');
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
                    toastr.error('제출할 내용이 없습니다.<br>모든 문제를 풀고 다시 시도하세요.');
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

    String.prototype.replaceAt = function(index, replacement) {
        if (index >= this.length) {
            return this.valueOf();
        }
     
        var chars = this.split('');
        chars[index] = replacement;
        return chars.join('');
    }

    /**
     * 에디터 리셋 버큰 클릭 이벤트
     * @param {*} e 
     */
    function refreshApp(e) {
        // 교재모드인 경우, 코드기록 삭제, 배경코드 출력
        const editor =  $('.editSection .ace_editor')[0].aceEditor;
        const codeId = $('.appTitle')[0].id;
        const pageId = $('.appTitle')[0].getAttribute('data-pid');

        if(codeId) {
            const deletedTarget = record.progress[bookId] && record.progress[bookId][pageId].code[codeId];
            if(deletedTarget) {
                delete record.progress[bookId][pageId].code[codeId];
                userData.course[crs] = record;

                let delData = {};
                delData[`course.${crs}.progress.${bookId}.${pageId}.code.${codeId}`] = firebase.firestore.FieldValue.delete();

                updateUserData({groupId: groupId, mid : mid, data: delData, crsStart: crsStart}, (result) => {
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
        const editor =  $('.editSection .ace_editor')[0].aceEditor;
        const targetApp = location.hash.slice(1);
        let code = editor.getValue();
        if(targetApp && targetApp != 'free') {
            BX.components[targetApp].practice().appendTo($('.appWindow')[0]);
        } 
        
        if(e && window.innerWidth < 900 && $('.emulator').hasClass('active')) { 
            $('.emulator').show();
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

            let bookData = record.progress[bookId];

            if(!bookData[pageId]) { // 페이지 데이터가 없으면
                bookData[pageId] = {code : {}};
            }
            
            if(!bookData[pageId].code) {
                bookData[pageId].code = {};
            }
            bookData[pageId].code[codeId] = codeData;
            record.progress[bookId] = bookData;
            // 데이터 업데이트 저장.
            userData.course[crs] = record;
            updateProgressData(`course.${crs}.progress.${bookId}.${pageId}.code.${codeId}`, codeData);
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
    
    let wheeltab = 0;
    function wheelUpDown(e) {
        if($('.lessonBook').is(":animated")) return;
        const curScrollPosition = $('.lessonBook').scrollTop();
        let section = ((curScrollPosition/window.innerHeight) / 1).toFixed(1);

        if(Math.trunc(section)+1 != wheeltab) {
            wheeltab = Math.trunc(section);
        }

        if(e.target.id == 'tabDOWN' ) {
            // if(page == 4) return;
            wheeltab++;
        } else if(e.target.id == 'tabUP') {
            // if(page == 1) return;
            wheeltab--;
        }
        var posTop = (window.innerHeight - 80) * wheeltab;
        $('.lessonBook').animate({scrollTop : posTop}, 'fast');
    
        
    }
    /**
     * pageData로 교재 생성
     * @param {object} pageData 배열
     * @param {string} title - 교재제목
     * @returns 생성된 페이지 box
     */
    function lessonBook(pageData, title) {
        const b = box().paddingTop(4);
        const book = pageData;
        const lessonBook = $('.lessonBook');
        document.title = title;

        // 상단에 페이지 내비게이션 표시 : 모던자바스크립트
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

        // 상단에 slide 넘기기 : 나데사초급3.12
        const appendSlidePagenation = function() {
            const navBg = $('.bookNav'); 
            const selectBox = BX.component(lesson.slidePagenation).appendTo(navBg[0]);
            
            let count = 0;
            for(let pages of book) { //선택상자 옵션
                const pageId = Object.keys(pages)[0];
                const pageTitle = count > 0 ? `p${count}. ` + pages[pageId].title : pages[pageId].title;
                const opt = new Option(pageTitle, count);
                selectBox[0].appendChild(opt);
                count++;
            }
            // 페이지 선택상자 이벤트
            $(selectBox).change(function() { 
                const page = this.value * 1;
                //swiper.slideTo(0);
                swiper.slideTo(page);
                if(!swiper.enabled) {
                    toastr.error('페이지 잠금상태입니다.');
                    selectBox[0].options[swiper.snapIndex].selected = true;
                }
                else if(swiper.snapIndex != page) { //유효하지 않은 페이지 넘김의 경우, 학습진행으로 열리지 않은 페이지
                    toastr.info('학습진행이 되지 않은 페이지로 바로가기 할 수 없습니다.');
                    //선택옵션을 현재 슬라이드에 맞게 
                    selectBox[0].options[swiper.snapIndex].selected = true;
                }
            });
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
            
            const wrap = box().appendTo(b).size('100%');
            if(bookType == 'card') wrap.background($('.lessonWindow').color());
            const contentBox = box().appendTo(wrap).height('calc(100% - 70px)').overflow('auto').paddingBottom(100);
            for(let [idx, unit] of contents.entries()) { 
                const created = createComponent(unit).appendTo(['quizConfirmBtn', 'nextBtn'].includes(unit.comp) ? wrap : contentBox);
                if(unit.comp == 'title') { //페이지 아이디 붙이기 
                    $(created).find('.pageidtag')[0].innerHTML = pageId;
                }

                unit.enter = Number(unit.enter);
                if(unit.enter) { //줄내림
                    for(var i=0; i<unit.enter; i++) {
                        BX.component(lesson.enter).appendTo(contentBox);
                    }
                }
                
                if(bookType && bookType == 'card') { //card type이면 필요없음. 
                    continue;
                }

                if(!scroll && idx == contents.length-1) { // 페이지 넘김 버튼 영역 
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
            else if(bookType == 'card') { //scroll(전체페이지를 열거하는..)인 경우, card type은 모두 scroll로 열리도록 
                $('.lessonBook').addClass('swiper');
                $(b).addClass('swiper-wrapper');
                $(wrap).addClass('swiper-slide');
                box().appendTo(b)[0].className = 'swiper-pagination';
            }
        }

        //location parameter page 유무에 따라 페이지 OR 스크롤 모드 분기 
        if(!page || bookType == 'card') {
            const loading = BX.component(learn.loading).appendTo($('.lessonWindow')[0]);
            for(let page=0; page<book.length; page++) {
                drawPage(Object.values(book[page])[0].content, Object.keys(book[page])[0], true);

                if(page == book.length-1) { //마지막 페이지까지 생성 후, 교재 노출
                    setTimeout( () => {
                        loading.remove();
                        $('.lessonBook')[0].style.opacity = 1;
                    }, 2000);
                }
            }
            if(bookType == 'card') appendSlidePagenation();
        }
        else {
            appendNav(); 
            openPage(page);
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
    
        let bookData = record.progress[bookId];
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
        userData.course[crs] = record; 

        if(!justData) {  //해당 페이지의 내용만..
            updateProgressData(`course.${crs}.progress.${bookId}.${pageid}`, bookData[pageid]);
        }
    }

    /**
     * 학습자 진도기록 업데이트
     * '23. 10. 매개변수 path, data로 변경
     * @param {*} path - update path 점표기법으로 구분된
     * @param {*} data - 기록할 데이터
     */
    function updateProgressData(path, data) {
        // 교재편집을 위한 테스트 모드에서는 update 제외
        if(new URLSearchParams(location.search).get('edit') == 'on') {
            return;
        } 

        const updateData = {};
        updateData[path] = data;
        updateUserData({groupId: groupId, mid : mid, data: updateData, crsStart: crsStart});
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
        if(bookType != 'card' && page) { //페이지 모드
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
            if(bookType == 'card') { // 카드형(모바일) 교재 진도체크 요소들
                // allowPage를 최종 페이지로 결정하고, 해당 슬라이드로 열어주기.. 학습이 완료된 상태이면.. 
                //$('.cardBook_pageNextBtn > div') 모든 슬라이드에서..
                let studiedPage = []; 
                const totalSlides = $('.swiper-slide').length;
                
                $('.swiper-slide').each(function(idx, el){
                    const nextBtn = $(el).find('.cardBook_pageNextBtn > div');
                    const confirmBtn = $(el).find('.cardBook_confirmBtn > div');

                    if(nextBtn.length > 0 && studied.includes(nextBtn[0].id)) {
                        studiedPage.push(idx);
                        $(nextBtn).parent().remove();
                        $(el).find('>:nth-child(1)').css('height', '100%');
                    }
                    if(confirmBtn.length > 0 && studied.includes(confirmBtn[0].id)) {
                        studiedPage.push(idx);
                    }
                });
                const completeChapBtn = $('.cardBook_completeBtn > div');
                
                if(studied.includes(completeChapBtn[0].id)) { //챕터 완료면..
                    studiedPage.push(totalSlides-1);
                    $(completeChapBtn).parent().remove();
                }
                
                let skip = 0;
                for(var i=0; i<studiedPage.length; i++) {
                    if(studiedPage[i] != i) {
                        skip = i;
                        break;
                    }
                }
                localStorage.setItem('study_done', JSON.stringify(studiedPage));
                
                let finalPageIdx;
                if(studiedPage.length == 0 ){ //학습기록이 없으면 첫페이지에서 시작.
                    finalPageIdx = 0;
                }
                else if(skip != 0) {
                    finalPageIdx = skip;
                }
                else {
                    finalPageIdx = Math.max(...studiedPage) + 1;
                }
                
                allowPage = studiedPage.length != 0 ? Math.max(...studiedPage) + 1 : 0; //열람가능한 페이지 설정
                swiper.activeIndex = allowPage;
                
                if(totalSlides != finalPageIdx) { //학습이 완료되지 않은 상태.
                    swiper.slideTo(0);
                    swiper.slideTo(finalPageIdx);
                    $('.slidePagenation')[0].options[finalPageIdx].selected = true;
                    const codebtnBox = $(swiper.slides[finalPageIdx]).find('.codeBtnBox'); 
                    if(codebtnBox.length > 0 && !codebtnBox.hasClass('off')) hideContinueBtn(swiper.slides[swiper.snapIndex]);
                }
            }
            else { //모던자바 진도체크 요소들
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
        }

        if(bookType == 'card') {

        }
        else {
            // 페이지 체크요소가 모두 완료된 상태가 아니면, 마지막 체크 요소 위치로 스크롤
            if(isReadAll().length != 0 && page && lastEl.length > 0) { 
                const position = lastEl.map(o => {
                    return o.getBoundingClientRect().top;
                });

                const target = lastEl[position.indexOf(Math.max(...position))];
                target.scrollIntoView({block: 'start'});
            }
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
            saveUserData(finishCheckBox); //update 없이 데이터 정리만
            // userData.course[crs] = record;

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
                    const refData = {};
                    refData[`course.${crs}.totalProgress`] = progress;
                    updateUserData({groupId: groupId, mid : mid, data: refData, crsStart: crsStart});
                });
            });
        }
    }

    /**
     * bookType 'card'인 교재의 챕터 완료 버튼 클릭이벤트
     * @param {*} e 
     * @returns 
     */
    function completeChapter(e) {
        if(location.pathname.includes('makeBook')) return; // 교재편집 페이지에서는 제외
        
        saveUserData(e.target);
        calcProgress(courseData, lecBooks, crs, userData, function(result) { 
            const progress = result; 

            //중간진도 전송
            postProgress(crsStart.substring(0, 4), record.courseCd, record.courseCsNo, mid, progress, function(done){
                if(!done.ok) {
                    $(finishCheckBox).prop('checked', false);
                    toastr.error('진도기록에 실패했습니다. 다시 시도하세요.');
                    return;
                }

                console.log(done, 'response');
                userData.course[crs].totalProgress = progress; // 진도전송시마다 totalProgress 업데이트
                const refData = {};
                refData[`course.${crs}.totalProgress`] = progress;
                updateUserData({groupId: groupId, mid : mid, data: refData, crsStart: crsStart});
                
                toastr.success('잠시 후, 메인페이지로 이동합니다.', '학습완료 확인');
                setTimeout(()=> {
                    const queryStr = `p_cpsubj=${crs}&p_userid=${mid}&edustart=${crsStart}&bid=${groupId}`;
                    location.href = `index.html?eq=${btoa(queryStr)}#list`;
                }, 3000);
            });
        });
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

    var errorLineGap = 1;
    function onConsoleFromChild(msg) { 
        if(msg.includes('Error:')) {
            if(msg.includes('NameError:')) {
                msg = '에러: 정의되지 않은 변수 또는 함수<br/>' + msg;
            }
            else if(msg.includes('SyntaxError:')) {
                msg = '문법 에러: ' + msg;
            }
            else if(msg.includes('IndentationError:')) {
                msg = '들여쓰기 에러: ' + msg;
            }
            else if(msg.includes('TypeError:')) {
                msg= '데이터 유형 에러: ' + msg;
            }
            else {
                msg = '에러: ' + msg;
            }
            
            var token = '__main__", line ';
            var idx = msg.indexOf(token);
            if(idx > -1) {
                var idx2 = msg.indexOf('\n', idx);
                var line = msg.substring(idx+token.length, idx2);
                line = parseInt(line) - errorLineGap;
                // msg = msg.substring(0, idx+token.length) + line + msg.substring(idx2);
                msg = msg.substring(0, idx) + line + '라인을 확인하세요.' + msg.substring(idx2);
            }
        }
        
        if(msg.includes('일시적으로 실시간 환율정보를 불러올 수 없습니다.')) {
            return;
        }

        if(typeof msg == 'string' && msg.length > 0 && msg[msg.length-1] != '\n') {
            msg += '<br/>';
        }
        msg = msg.replaceAll(' ', '&nbsp;');
        msg = msg.replaceAll('\n', '<br/>');

        //outputWindow 노출..
        const curSlide = $('.swiper-slide-active > :nth-child(1)')[0]; 
        const outputWin = $(curSlide).find('.outputWindow').length == 0 ? BX.component(lesson.outputWindow).appendTo(curSlide) : $(curSlide).find('.outputWindow');
        const printBox = $(outputWin).find('>:nth-child(2)');

        const result = box().appendTo(printBox[0]).html(msg).textColor(msg.includes('에러')?'#e65800':'white').borderBottom('0.7px dashed gray').padding('5px 0px');
        if(msg.startsWith('<')) {
            msg = msg.replaceAll('<br/>', '\n');
            msg = msg.replaceAll('&nbsp;', ' ');
            result.text(msg);
        }
        else {
            result.html(msg);
        }
        

        $('.swiper-slide-active > :nth-child(1)').animate({
            scrollTop: $('.swiper-slide-active > :nth-child(1)')[0].scrollHeight
        }, 400);

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