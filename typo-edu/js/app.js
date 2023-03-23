toastr.options = {
    closeButton: true,
    progressBar: true,
    showMethod: 'slideDown',
    timeOut: 4000,
    positionClass: "toast-top-full-width"
};
(function(){
    initDatabase();
    let padBg, courseData, bookData, userData;
    
    const mid = new URLSearchParams(location.search).get('p_userid');
    const crsStart = new URLSearchParams(location.search).get('edustart');

    if(location.pathname.includes('index')) { // index 페이지에서만 화면생성
        getUserData(function(data) {
            userData = data;
            console.log(userData)
            init();
        });
    }

    window.getUserData = getUserData;
    window.mid = mid;
    window.crsStart = crsStart;

    /**
     * 페이지 초기화
     */
    function init() {
        getJsonData("./lecture/course.json", json => {
            courseData = json;
            // console.log(courseData, 'courseData');
            const homepage = BX.component(main.bg).appendTo(topBox);
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
                    fn : () => {openStepList('9627cb42');} //openAppStore
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
                    $('.padBtn').each((idx, item)  => {
                        $(item).removeClass('clicked');
                    });
                
                    $(e.target).parent().addClass('clicked');
                }
            }
            
            if(location.hash) {
                openStepList(location.hash.slice(1));
            } 
            else {
                $('.padBtn').find('span')[0].click(); // 홈버튼 클릭
            }
        });
    }

    function getBook(cid, bid, fn) {
        $.ajax({url: `./lecture/${cid}/${bid}/${bid}.json`, dataType: "json"})
        .done((json) => {
            if(fn) fn(json);
        })
        .fail((xhr, status, error) => {})
    }

    function getJsonData(src, fn) {
        $.ajax({url: src, dataType: "json"})
        .done((json) => {
            if(fn) fn(json);
        })
        .fail((xhr, status, error) => {})
    }

    /**
     * 교육과정 목록 생성 : 홈 아이콘 클릭이벤트
     */
    function openCourse() {
        location.hash = '';
        padBg.empty();

        Object.keys(courseData).forEach(function(cid){
            const course  = courseData[cid];
            const courseTitle = course.title; 
            const iconbox = BX.component(main.courseIcon).appendTo(padBg[0]);
            // .click( e => {
            //     openStepList(cid);
            // });
            iconbox.children()[2].innerText = '학습진도 80% 이상, 퀴즈 60점 이상 수료'//courseTitle;

            // for(var j=0; j<7; j++) { // 7개만 아이콘 생성
            //     const icon = courseData[cid].books[j].icon;
            //     BX.component(main.stepIcon).appendTo(iconbox[0].firstChild).border('1px solid gray').background(`url(./lecture/icons/${icon})`)
            // }
        });
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
        BX.component(myPage.header).appendTo(padBg);
        const bottom = BX.component(myPage.courseListBox).appendTo(padBg);

        const appendCourseList = function(cid) {
            const coursebox = BX.component(myPage.courseBox).appendTo(bottom);
            $(coursebox).find('.courseTitleText')[0].innerText = courseData[cid].title;
            const stepList = $(coursebox).find('.stepList')[0];
            const books = courseData[cid].books; //전체 교재 데이터
            let totalProgress = 0;
            Object.keys(books).forEach(function(o){
                bookData = {};
                const line = BX.component(myPage.stepBox).appendTo(stepList);
                getBook(cid, books[o].id, json => {
                    const bid = json.id;
                    bookData[bid] = json; 
                    let lastPage = null;
                    let progress = 0;
                    
                    if(userData) {
                        // 진도 계산
                        const pageData = bookData[bid].pages; // 배열
                        let totalRequired = 0;
                        let studied = 0;
                        let pageDone = 0;
                        for(var i=0; i<pageData.length; i++) {
                            let pid = Object.keys(pageData[i])[0];
                            totalRequired += getContentsId(bid, pid).length;

                            const userBookData = userData[cid][bid];
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
                        if(o == books.length-1) {
                            const percent = totalProgress / books.length;
                            const total = parseFloat(percent.toFixed(1));
                            $(coursebox).find('.totalProgress')[0].innerText = `진행율 ${total}%`;
                            $(coursebox).find('.totalProgress')[0].style.background = `linear-gradient(to right, #004D80 ${total}%, #7192AC ${total}%)`;
                        }
                        
                        if(pageData.length == pageDone) lastPage = ''; // 모든 페이지 학습이 완료, 스크롤 모드로 열기
                    }
                    else if(o == books.length-1){
                        $(coursebox).find('.totalProgress')[0].innerText = `진행율 0%`;
                    }
                    

                    if(lastPage == null) lastPage = 1; //완료한 페이지가 없는 경우
                    $(line).find('a')[0].href = `makeroom.html?mid=${mid}&course=${cid}&book=${bid}&page=${lastPage}`;
                    $(line).find('p')[0].innerText = books[o].title;
                    $(line).find('.progressNumber')[0].innerText = `${parseFloat(progress)} %`;
                    $(line).find('.progress')[0].style.width = `${progress}%`;

                });
                
            })
            
            
            
        }
        //mid별 수강 코스 가져오기 
        // toastr.success('mid별 수강목록 가져오기가 필요합니다.<br> 지금은 그래머과정을 공통으로 가져옵니다.')
        appendCourseList('9627cb42');
        
        // 남은 수강일 표시   
        const eduStart = new Date(crsStart.substring(0,4), crsStart.substring(4, 6) - 1, 1);
        const eduEnd = new Date(eduStart.getFullYear(), eduStart.getMonth()+1, 0);
        const diff = eduEnd - new Date();
        const diffDay = Math.floor(diff / (1000*60*60*24));
        $('.deadline')[0].innerText = `D - ${diffDay + 1}`
    }

    /**
     * 학습자 생성 앱 목록 생성 (pending)
     */
    function openAppStore() {
        padBg.empty();
        box().size(70,70).margin(20).borderRadius(6).border('2px solid #6F1ED8').fontSize(35).lineHeight('90%').textAlign('center').color('#E2D6FF').padding(3)
            .text('교재\n제작').textColor('#6F1ED8').appendTo(padBg[0]).click( e => {
                window.open(window.location.origin + '/typo-edu/makeBook.html');
            });
        box().size(70,70).margin(20).borderRadius(6).border('2px solid #1178D8').fontSize(35).lineHeight('90%').textAlign('center').color('#C6E9FF').padding(3)
            .text('자유\n코딩').textColor('#1178D8').appendTo(padBg[0]).click( e => {
                if(!mid) {
                    toastr.error('수강 등록 후 사용가능합니다.');
                    return;
                }
                window.location.hash = '';
                window.location.href = 'makeroom.html?mid=' + mid;
            });

    }

    /**
     * 코스 아이콘 클릭 이벤트 함수 : 전체 step 목록 생성
     * @param {*} courseTitle 
     */
    function openStepList(courseId) {
        location.hash = courseId;
        padBg.empty();
        const stepList = [...courseData[courseId].books];
        const courseTitle = courseData[courseId].title;
        BX.component(main.stepListTitle).appendTo(padBg).text(courseTitle + ` (${stepList.length} steps)`);
        const listBg = BX.component(main.stepStore).appendTo(padBg);
        bookData = {}; //교재데이터 담기 위해 초기화

        let appendIcon = () => {
            let book = stepList.shift();
            let bookid = book.id;
            getBook(courseId, bookid, json => {
                const bid = json.id;
                bookData[bid] = json; //초기 1회 교재의 모든 교재 데이터 생성
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
                    app.find('a')[0].href = `makeroom.html?mid=${mid}&course=${courseId}&book=${bid}&page=${openPgaeNo}`;
                }
                app.find('a')[0].innerText = json.title;
                if(stepList.length != 0) {
                    appendIcon();
                } else {
                    // console.log(courseData) 
                }
            });
        }
        appendIcon();
    }

    function getUserData(fn) {
        if(!mid) {
            if(fn) fn(null);
            return;
        }

        userReadDocument(`users/${mid}`, (doc)=>{ 
            if(fn) fn(doc.data());
        });
        // const data = localStorage.getItem(mid);
        // return JSON.parse(data);
    }

    /**
     * 페이지별 id가 부여된 컨텐츠 id 목록 가져오기
     * @param {string} bookid 
     * @param {string} pageid 
     * @returns {object} id배열
     */
    function getContentsId(bookid, pageid) { 
        const totalPages = bookData[bookid].pages;
        const targetPage = totalPages.filter( o => Object.keys(o)[0] == pageid)[0];
        const content = targetPage[pageid].content;
        
        let idList = content.filter(o => o.id);
        idList = idList.map( o => o.id);
        
        return idList;
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
        const userBookData = userData[courseId][bookid];
        const studyData = userBookData && userBookData[pageid] ? 
            userBookData[pageid].clicked : [];
        const compare = getContentsId(bookid, pageid); //교재에 포함된 id 목록 : 클릭되어야 할 요소들
        // console.log(compare)
        let point;
        for(let id of compare) {
            if(!studyData || !studyData.includes(id)) {
                point = id;
                break;
            }
        }

        return point == undefined;
    }


})();


