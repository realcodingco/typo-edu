(function(){
    initDatabase();
    let padBg, courseData, userData, homepage, curProgress, diff, diffDay;
    let bookData = {};
    if(location.search.length < 5) {
        return;
    }

    if(!location.search.includes('eq')) { // 쿼리스트링 암호화되지 않은 경우
        const queryStr = location.search.slice(1); // '?' 이후 문자열
        const encoded = btoa(queryStr);
        location.search = 'eq=' + encoded;
    }

    const decoded = atob(location.search.slice(4)); //'?eq=' 이후 문자열
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

    // IE 접속의 경우 크롬접속 안내
    var agent = navigator.userAgent.toLowerCase();
    if ( (navigator.appName == 'Netscape' && navigator.userAgent.search('Trident') != -1) || (agent.indexOf("msie") != -1) ) {
        let iframe = document.createElement('iframe');
        iframe.src = './recommended.html';
        iframe.style.width = '100%';
        iframe.style.height = '100vh';
        document.querySelector('#mainapp').appendChild(iframe);
        toastr.error('지원하지 않는 브라우저 입니다.<br>크롬이나 엣지 브라우저에서 접속하세요.');
        return;
    }

    const mid = searchParams(params, 'p_userid');
    const crs = searchParams(params, 'p_cpsubj');
    let groupId = searchParams(params, 'bid');
    const crsStart = searchParams(params, 'edustart');

    // history.replaceState({}, null, location.pathname);
    diff = calcEndDate(crsStart) - new Date();
    diffDay = Math.floor(diff / (1000*60*60*24)) + 1;

    if(!groupId) { // bid 파라미터가 없으면 '롯데 이지러닝'
        groupId = 'lotte';
    }

    getUserData({groupId:groupId, crsStart:crsStart, mid:mid}, function(data) {
        userData = data;
        //입과 대상인지 확인
        getEnroll(groupId, function(result) { 
            if(result) {
                const courseData = Object.keys(userData).length != 0 ? userData.course[crs] : {};
                if(Object.keys(userData).length == 0) { //신규 
                    userData = {
                        groupId : groupId,
                        mid: mid,
                        name: result.userNm,
                        course : {}
                    };
                    userData.course[crs] = {
                        edustart: crsStart,
                        courseCd: result.courseCd,
                        courseCsNo : result.courseCsNo,
                        time: Date.now()
                    };
                }
                else if(courseData && courseData.edustart == crsStart){ //계속 학습
                    if(!courseData.courseCd || !courseData.courseCsNo) {
                        userData.course[crs].courseCd = result.courseCd;
                        userData.course[crs].courseCsNo = result.courseCsNo;
                        updateUserData({groupId: groupId, mid : mid, data: userData, crsStart: crsStart});
                    }   
                    init();
                    return;
                }
                else if(courseData && courseData.edustart != crsStart){ //재수강 있을 수 없음
                    const retake = confirm('재수강입니다. 학습을 시작하기 위해 이전 학습 기록이 삭제됩니다.');
                    if(retake){ // 재수강 기록삭제시. 결과전송 데이터도 삭제? 
                        userData.course[crs] = { //코스데이터 초기화
                            edustart: crsStart,
                            courseCd: result.courseCd,
                            courseCsNo : result.courseCsNo,
                            time: Date.now()
                        };
                        delete courseData.quiz;
                        updateUserData({groupId: groupId, mid : mid, data: userData, crsStart: crsStart});
                        init();
                    }
                    return;
                }
                else { // 같은 기간에 2개 과정 추가 수강
                    userData.course[crs] = {
                        edustart: crsStart,
                        courseCd: result.courseCd,
                        courseCsNo : result.courseCsNo,
                        time: Date.now()
                    };
                }
                putUserData({groupId: groupId, mid : mid, data: userData, crsStart: crsStart}, function() {
                    init();
                });
            }
            else { //입과리스트에 없는
                toastr.error('잘못된 접근입니다.');
            }
        });
    });

    window.mid = mid;
    window.crsStart = crsStart;
    window.crs = crs;
    
    /**
     * 페이지 초기화
     */
    function init() {
        getCrsBookData(crs, function(json) {
            courseData = json.courseData;
            bookData = json.bookData;
            calcProgress(courseData, bookData, crs, userData, function(result){
                curProgress = result;
                homepage = BX.component(main.bg).appendTo(topBox);
                const bg = BX.component(main.pad).appendTo(homepage);
                padBg = $('.padBg');
                const bottomBar = bg[0].lastChild;
                const menu = [
                    { 
                        text : 'home',
                        fn : openCourse
                    },
                    { 
                        text : 'apps',
                        fn : openStepList 
                    },
                    { 
                        text : 'school',
                        fn : getMyCourse
                    }
                ];
                for(let i in menu) {
                    const one = BX.component(main.menuBtn).appendTo(bottomBar).click(menu[i].fn);
                    one[0].firstChild.innerText = menu[i].text;
                    one[0].firstChild.onclick = e => {
                        $('.padBtn').each((i, item)  => {
                            $(item).removeClass('clicked');
                        });
                    
                        $(e.target).parent().addClass('clicked');
                    }
                }
                
                if(location.hash == '#list') {
                    calcProgress(courseData, bookData, crs, userData, (result) => {
                        curProgress = result;
                        openStepList();
                    });
                } 
                else {
                    $('.padBtn').find('span')[0].click(); // 홈버튼 클릭
                }
            });

            if(diffDay > 0 && diffDay < 4) { //종료일 3일 전 메시지 띄우기
                toastr.info(`학습종료일이 얼마 남지 않았습니다.<br>
                학습을 마무리하고 퀴즈에 응시하세요.`,'알림', {timeOut: 0, positionClass: 'toast-top-left',progressBar: false});
            }
        });
    }

    /**
         * 롯데이지러닝 입과일 기준 입과리스트 가져오기
         * @param {*} crsStart - yyyymmdd
         * @param {*} crsEnd - null이면 crsStart기준 말일로 자동 설정
         * @param {*} fn 
         */
    function getLotteEntrance(crsStart, crsEnd, fn) {
        if(!crsEnd) crsEnd = YYYYMMDD(calcEndDate(crsStart));
        $.getJSON(`https://www.realcoding.co/cest/lotte-enrollment-list?start=${crsStart}&end=${crsEnd}`, function (result) {
            result = result.data.enrollment;
            fn(result);
        });
    }

    /**
     * 교육과정 목록 생성 : 홈 아이콘 클릭이벤트
     */
    function openCourse() {
        location.hash = '';
        padBg.empty();
        
        const course  = courseData[crs];
        const courseTitle = course.title; 
        userData.course[crs].title = courseTitle;
        document.title = courseTitle;
        const iconbox = BX.component(main.courseIcon).appendTo(padBg[0]);
        iconbox.children()[0].innerHTML = `반갑습니다. <b>${userData.name}</b> 학습자님.`;
        iconbox.children()[2].innerText = course.completed;

        const quizRecord = userData.course[crs].quiz || {};
        const quizButton = iconbox.find('.finalQuizBtn')[0];
        
        // Final Quiz 버튼 클릭 이벤트 핸들러 : 퀴즈 응시페이지 열기
        const enterQuiz = e => {
            const shuffle = (array) => {
                array.sort(() => Math.random() - 0.5);
            }
            const openQuizPage = (qid, type) => {
                window.location.hash = '';
                const queryStr = `p_cpsubj=${crs}&bid=${groupId}&p_userid=${mid}&edustart=${crsStart}&book=${qid}&q=${type}&page=`;
                window.location.href = `makeroom.html?eq=${btoa(queryStr)}`;
            }

            if(Object.keys(quizRecord).length == 0) { // 퀴즈 응시조건 체크
                const numbers = [0, 1, 0, 0, 1, 1, 0, 1];
                shuffle(numbers);
                quizRecord.type = numbers[0];
                userData.course[crs].quiz = quizRecord;
                updateUserData({groupId: groupId, mid : mid, data: userData, crsStart: crsStart}, function() {
                    let qid = course.quiz[quizRecord.type];
                    openQuizPage(qid, quizRecord.type);
                });
            } 
            else { // 퀴즈페이지 이동 기록이 있는 경우
                let qid = course.quiz[quizRecord.type];
                openQuizPage(qid, quizRecord.type);
            }
        }
        // 결과보기 버튼 클릭 이벤트 핸들러 : 퀴즈가 최종 제출된 경우 수료여부와 오답확인 팝업생성
        const showQuizResult = e => {
            const quizData = userData.course[crs].quiz
            const score = quizData.score;
            const pop = BX.component(main.quizResultPop).appendTo(homepage);
            $("#popup").css('display','flex').hide().fadeIn();

            const header = $(pop).find('.head-title')[0];
            header.innerText = `${score}점 / ${score >= 60 ? '수료' : '미수료'}`;
            let target = $(pop).find('.body-content')[0];
            getSolve(target, crs, quizData);
        }

        if(quizRecord.score) { //최종 제출된 상태
            quizButton.innerText = '결과 보기';
            quizButton.onclick = showQuizResult;
        } 
        else if(!isTakingClass(crsStart)) { // 수강 기간이 아니면 버튼 접근제한
            quizButton.onclick = e => {
                toastr.error('수강기간이 아니므로 응시할 수 없습니다.');
            }
        }
        else if(curProgress >= 80) {//진도 80% 이상일때만 입장
            quizButton.onclick = enterQuiz;
        }
        else {
            quizButton.onclick = e => {
                toastr.error('학습진도율 80% 미만입니다.');
            }
        }
    }
    
    /**
     * 학사모 아이콘 클릭이벤트 - 내 강의 목록 생성 : 진도확인
     */
    function getMyCourse() {
        if(!mid) {
            toastr.error('등록된 수강생이 아니거나 잘못된 접근입니다.');
            return;
        }

        padBg.empty();
        const head = BX.component(myPage.header).appendTo(padBg);
        head.find('h2')[0].innerHTML = `<font size=4>${userData.name} 님의</font> 학습 현황`;
        if(groupId == 'lotte') {
            $('.lecNotice')[0].innerText = '학습기간 종료 후 1~5일 내에 롯데 이지러닝 진도연동이 이뤄집니다.';
        }
        const bottom = BX.component(myPage.courseListBox).appendTo(padBg);
        const appendCourseList = function() {
            const cid = crs;
            const coursebox = BX.component(myPage.courseBox).appendTo(bottom);
            $(coursebox).find('.courseTitleText')[0].innerText = courseData[cid].title;
            const stepList = $(coursebox).find('.stepList')[0];
            
            const books = courseData[cid].books; //전체 교재 데이터 배열
            let bookList = [...books];
            let bookCount = 0;
            let lastCompeleteChapter;
            let totalProgress = 0;
            const appendLine = () => {
                let book = bookList.shift();
                const line = BX.component(myPage.stepBox).appendTo(stepList);
                const createLine = (json) => {
                    const bid = json.id;
                    let lastPage = null; // 마지막 학습위치 찾기
                    let progress = 0;
                    if(userData) {
                        // 진도 계산
                        const pageData = bookData[bid].pages; // 배열
                        let totalRequired = 0;
                        let studied = 0;
                        let pageDone = 0;
                        for(var i=0; i<pageData.length; i++) {
                            let pid = Object.keys(pageData[i])[0];
                            totalRequired += getContentsId(bookData, bid, pid).length;

                            const userBookData = userData && userData.course[cid] && userData.course[cid].progress ? userData.course[cid].progress[bid] : null;
                            const studyData = userBookData && userBookData[pid] ? 
                                userBookData[pid].clicked : [];
                            
                            if(studyData){
                                studied += studyData.length;
                            }
                            
                            const checkResult = isAllChecked(cid, bid, i+1); //페이지 학습이 완료된 상태
                            if(lastPage == null && !checkResult) {
                                lastPage = i+1;
                            }

                            if(checkResult) {
                                pageDone++;
                            }
                        }
                        
                        progress = (studied / totalRequired) * 100;
                        if(isNaN(progress)) {
                            progress = 0;
                        } else if(progress > 0) {
                            progress = progress.toFixed(1);
                        }  

                        totalProgress += Number(progress);
                        if(bookCount == books.length-1) {
                            const percent = totalProgress / books.length;
                            const total = parseFloat(percent.toFixed(total >= 100 ? 0 : 1));
                            $(coursebox).find('.totalProgress')[0].innerText = `학습진도 ${total}%`;
                            $(coursebox).find('.totalProgress')[0].style.background = `linear-gradient(to right, #004D80 ${total}%, #7192AC ${total}%)`;
                        }
                        
                        if(pageData.length == pageDone) lastPage = ''; // 모든 페이지 학습이 완료, 스크롤 모드로 열기
                    }
                    else if(bookCount == books.length-1){
                        $(coursebox).find('.totalProgress')[0].innerText = `학습진도 0%`;
                    }

                    if(lastPage == null) lastPage = 1; //완료한 페이지가 없는 경우
                    //순차적인 학습을 위한 교재 열람조건 체크
                    let chapCompeleteProgress = (((bookCount + 1) / 24) * 100).toFixed(2);
                    
                    const queryStr = `p_cpsubj=${crs}&bid=${groupId}&p_userid=${mid}&edustart=${crsStart}&course=${cid}&book=${bid}&page=${lastPage}`;
                    const encoded = `makeroom.html?eq=${btoa(queryStr)}`;
                    if(curProgress == 100) { //
                        $(line).find('a')[0].href = encoded;
                    }
                    else if(lastCompeleteChapter && curProgress < chapCompeleteProgress){
                        $(line).find('a')[0].href = 'javascript:toastr.error("이전 학습을 완료한 후 진행하세요.")';
                    }
                    else if(lastCompeleteChapter == undefined && curProgress < chapCompeleteProgress) {
                        lastCompeleteChapter = bookCount;
                        $(line).find('a')[0].href = encoded;
                    } 
                    else if(curProgress >= chapCompeleteProgress){
                        $(line).find('a')[0].href = encoded;
                    }
                    else {
                        $(line).find('a')[0].href = 'javascript:toastr.error("이전 학습을 완료한 후 진행하세요.")';
                    }
                    
                    $(line).find('p')[0].innerText = book.title;
                    $(line).find('.progressNumber')[0].innerText = `${parseFloat(progress)} %`;
                    $(line).find('.progress')[0].style.width = `${progress}%`;

                    if(progress == 100) { // 완료된 학습의 버튼 텍스트 '복습하기'로 변경
                        $(line).find('.studyBtn')[0].innerText = '복습하기';
                    }

                    if(bookList.length != 0) {
                        bookCount++;
                        appendLine();
                    }
                }
                createLine(bookData[book.id]);
            }
            appendLine();
        }
    
        appendCourseList();
        
        // 남은 수강일 D-day 표시   
        $('.deadline')[0].innerText = `D${diffDay < 0 ? '+' : '-'}${Math.abs(diffDay)}`;
    }

    /**
     * 코스 아이콘 클릭 이벤트 함수 : 전체 step 목록 생성
     * @param {*} courseTitle 
     */
    function openStepList() {
        const courseId = crs;
        location.hash = 'list';
        padBg.empty();
        const stepList = [...courseData[courseId].books];
        const courseTitle = courseData[courseId].title;
        BX.component(main.stepListTitle).appendTo(padBg).text(courseTitle + ` (${stepList.length} steps)`);
        const listBg = BX.component(main.stepStore).appendTo(padBg);
    
        let lastCompeleteChapter; // 학습진도가 100%인 최종챕터
        let bookCount = 0; 
        let appendIcon = () => {
            let book = stepList.shift();
            const bid = book.id;
            const createIcon = (json) => {
                bookData[bid] = json; 
                const icon = json.icon;
                const app = BX.component(main.stepBook).appendTo(listBg).background(`url(./lecture/icons/${icon})`);
                if(!mid) {
                    app.find('a')[0].onclick = e => {
                        toastr.error('등록된 수강생이 아니거나 잘못된 접근입니다.');
                    }
                }
                else {
                    let openPgaeNo = 1;
                    if(bid && userData) {
                        const totalpage = json.pages.length;
                        for(var no = 0; no < totalpage; no++) {
                            if(!isAllChecked(courseId, bid, no+1)) {
                                openPgaeNo = no+1;
                                break;
                            }
                            if(no == totalpage-1) { //페이지학습완료
                                openPgaeNo = '';
                            }
                        }
                    }
                    
                    let chapCompeleteProgress = (((bookCount+1) / 24) * 100).toFixed(2);
                    const queryStr = `p_cpsubj=${crs}&bid=${groupId}&p_userid=${mid}&edustart=${crsStart}&course=${courseId}&book=${bid}&page=${openPgaeNo}`;
                    const encoded = `makeroom.html?eq=${btoa(queryStr)}`;
                    if(curProgress == 100) {
                        app.find('a')[0].href = encoded;
                    }
                    else if(lastCompeleteChapter && curProgress < chapCompeleteProgress){
                        app.find('a')[0].href = 'javascript:toastr.error("이전 학습을 완료한 후 진행하세요.")';
                    }
                    else if(lastCompeleteChapter == undefined && curProgress < chapCompeleteProgress) {
                        lastCompeleteChapter = bookCount;
                        app.find('a')[0].href = encoded;
                    } 
                    else if(curProgress >= chapCompeleteProgress){
                        app.find('a')[0].href = encoded;
                    }
                    else {
                        app.find('a')[0].href = 'javascript:toastr.error("이전 학습을 완료한 후 진행하세요.")';
                    }

                    if(curProgress >= chapCompeleteProgress) {
                        $(app).addClass('studiedStepBook');
                    }
                }
                app.find('a')[0].innerText = json.title;
                if(stepList.length != 0) { // 남은 교재가 없을 때까지
                    bookCount++;
                    appendIcon();
                } 
            }

            if(!Object.keys(bookData).includes(bid)){
                getBook(courseId, bid, json => {
                    createIcon(json);
                });
            }
            else {
                createIcon(bookData[bid]);
            }
        }
        appendIcon();
    }

    /**
     * 페이지 번호로 페이지 아이디 가져오기
     * @param {*} bookid 
     * @param {*} pageNumber 
     * @returns 
     */
    function pageIdByNumber(bookid, pageNumber) {
        return Object.keys(bookData[bookid].pages[pageNumber-1])[0];
    }

    /**
     * 페이지의 모든 체크 요소 학습 여부 
     * @param {string} bookid 
     * @param {number} page 
     * @returns {boolean} 
     */
    function isAllChecked(courseId, bookid, page) { 
        const pageid = pageIdByNumber(bookid, page);
        const userBookData = userData && userData.course[courseId].progress ? userData.course[courseId].progress[bookid] : null;
        const studyData = userBookData && userBookData[pageid] ? 
            userBookData[pageid].clicked : [];
        const compare = getContentsId(bookData, bookid, pageid); //교재에 포함된 id 목록 : 클릭되어야 할 요소
        
        let point;
        for(let id of compare) {
            if(!studyData || !studyData.includes(id)) {
                point = id;
                break;
            }
        }
        
        return point == undefined;
    }

    /**
     * 수강기간별 입과리스트에서 일치하는 학습자 데이터 전달
     * @param {*} groupId 
     * @param {*} fn 
     */
    function getEnroll(groupId, fn) {
        if(groupId == 'lotte'){ 
            if(crsStart == '20230401') { //입과일 4월은 테스트 진행
                const testData = [
                    {
                        cpCourseCd : 'L018761',
                        userNm : '김하나',
                        userId: 'test',
                        courseCd : 'E187611',
                        courseCsNo : '04'
                    },
                    {
                        cpCourseCd : 'L018761',
                        userNm : '김철수',
                        userId: 'test1',
                        courseCd : 'E187611',
                        courseCsNo : '04',
                    },
                    {
                        cpCourseCd : 'L018761',
                        userNm : '이호',
                        userId: 'test2',
                        courseCd : 'E187611',
                        courseCsNo : '03'
                    }
                ];
                const target = testData.filter(o => o.userId == mid && o.cpCourseCd == crs);
                if(target.length == 1) {
                    fn(target[0]);
                } else {
                    fn(null);
                }
            }
            else {
                const crsEnd = YYYYMMDD(calcEndDate(crsStart));
                getLotteEntrance(crsStart, crsEnd, function(result) {
                    const target = result.filter(o => o.userId == mid && o.cpCourseCd == crs);
                    if(target.length == 1) {
                        fn(target[0]);
                    } 
                    else {
                        fn(null);
                    }
                });
            }
        }
    }
})();