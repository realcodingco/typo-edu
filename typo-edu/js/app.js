toastr.options = {
    closeButton: true,
    progressBar: true,
    showMethod: 'slideDown',
    timeOut: 4000
};
const homepage = BX.component(main.bg).appendTo(topBox);
const bg = BX.component(main.pad).appendTo(homepage);
const padBg = $('.padBg');
const bottomBar = bg[0].lastChild;
const mid = new URLSearchParams(location.search).get('mid');

const menu = [
    { 
        text : 'home',
        fn : openCourse
    },
    { 
        text : 'apps',
        fn : getMyApps
    },
    { 
        text : 'school',
        fn : getMyCourse
    }
];
const courseData = getTotalCourseData();
const bookData = getBookData();
// [
//     {
//         title : 'Grammer',
//         steps : [
//             {
//                 title : '변수',
//                 icon : 'undraw_data_processing_yrrv.svg',
//                 book : '88a32a81'
//             },
//             {
//                 title : '데이터',
//                 icon : 'undraw_data_re_80ws.svg'
//             },
//             {
//                 title : '타입변환/체크',
//                 icon : 'undraw_completed_tasks_vs6q.svg'
//             },
//             {
//                 title : '연산자',
//                 icon : 'undraw_calculator_re_alsc.svg'
//             },
//             {
//                 title : '함수 1',
//                 icon : 'undraw_functions_re_alho.svg'
//             },
//             {
//                 title : '함수 2',
//                 icon : 'undraw_working_remotely_re_6b3a.svg'
//             },
//             {
//                 title : '조건문',
//                 icon : 'undraw_check_boxes_re_v40f.svg'
//             },
//             {
//                 title : '반복문',
//                 icon : 'undraw_accept_tasks_re_09mv.svg'
//             },
//             {
//                 title : '배열',
//                 icon : 'undraw_progress_indicator_re_4o4n.svg'
//             },
//             {
//                 title : '배열함수',
//                 icon : 'undraw_progress_overview_re_tvcl.svg'
//             },
//             {
//                 title : '프로미스',
//                 icon : 'undraw_reminder_re_fe15.svg'
//             },
//             {
//                 title : '이벤트 1',
//                 icon : 'undraw_server_status_re_n8ln.svg'
//             },
//             {
//                 title : '이벤트 2',
//                 icon : 'undraw_typewriter_re_u9i2.svg'
//             },
//             {
//                 title : '이벤트 3',
//                 icon : 'undraw_documents_re_isxv.svg'
//             },
//             {
//                 title : '이벤트 4',
//                 icon : 'undraw_fill_form_re_cwyf.svg'
//             },
//             {
//                 title : 'JSON',
//                 icon : 'undraw_version_control_re_mg66.svg'
//             },
//             {
//                 title : '클래스',
//                 icon : 'undraw_code_review_re_woeb.svg'
//             },
//             {
//                 title : '제너레이터 함수',
//                 icon : 'undraw_online_resume_re_ru7s.svg'
//             },
//             {
//                 title : 'MATH 함수',
//                 icon : 'undraw_mathematics_-4-otb.svg'
//             },
//             {
//                 title : 'DATE 함수',
//                 icon : 'undraw_calendar_re_ki49.svg'
//             },
//             {
//                 title : '문서 객체 모델',
//                 icon : 'undraw_elements_re_25t9.svg'
//             },
//             {
//                 title : '정규표현식',
//                 icon : 'undraw_code_typing_re_p8b9.svg'
//             },
//             {
//                 title : '상호작용과 모듈',
//                 icon : 'undraw_usability_testing_re_uu1g.svg'
//             },
//             {
//                 title : 'Number, String 객체',
//                 icon : 'undraw_font_re_efri.svg'
//             }
//         ]
//     },
//     // {}, {}
// ];
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
    openCourse();
}


/**
 * 교육과정 목록 생성 : 홈 아이콘 클릭이벤트
 */
function openCourse() {
    location.hash = '';
    padBg.empty();
    // for(var i=0; i<courseData.length; i++){
    Object.keys(courseData).forEach(function(cid){
        const courseTitle = courseData[cid].title; 
        const iconbox = BX.component(main.courseIcon).appendTo(padBg[0]).click( e => {
            openStepList(cid);
        });
        iconbox[0].lastChild.innerText = courseTitle;
        for(var j=0; j<7; j++) {
            const icon = bookData[courseData[cid].books[j]].icon;
            BX.component(main.stepIcon).appendTo(iconbox[0].firstChild).border('1px solid gray').background(`url(./image/${icon})`)
        }
    });
        
    // }
}

/**
 * 학사모 아이콘 클릭이벤트 - 내 강의 목록 생성 : 진도확인
 */
function getMyCourse() {
    padBg.empty();
    BX.component(myPage.header).appendTo(padBg);
    console.log(getUserData())
    // courseData.steps book 데이터만 빼기 //  mid로 수강 코스 가져오기 
    
    const coursebox = BX.component(myPage.courseBox).appendTo(padBg);
    const stepList = $(coursebox).find('.stepList')[0];
    const books = getBookData();
    Object.keys(books).forEach(function(o){
        const line = BX.component(myPage.stepBox).appendTo(stepList);
        $(line).find('p')[0].innerText = books[o].title;
    })
}

/**
 * 학습자 생성 앱 목록 생성
 */
function getMyApps() {
    padBg.empty();
}

/**
 * 코스 아이콘 클릭 이벤트 함수 : 전체 step 목록 생성
 * @param {*} courseTitle 
 */
function openStepList(courseId) {
    location.hash = courseId;
    padBg.empty();
    const stepList = courseData[courseId].books;
    const courseTitle = courseData[courseId].title;
    BX.component(main.stepListTitle).appendTo(padBg).text(courseTitle + ` (${stepList.length} steps)`);
    const listBg = BX.component(main.stepStore).appendTo(padBg);
    for(var i=0; i<stepList.length; i++) {
        const icon = bookData[stepList[i]].icon;
        const app = BX.component(main.stepBook).appendTo(listBg).background(`url(./image/${icon})`);
        if(!mid) {
            app.find('a')[0].onclick = e => {
                toastr.error('등록된 수강생이 아니거나 잘못된 접근입니다.');
            }
        }
        else {
            const bookid = stepList[i];
            let openPgaeNo = 1;
            if(bookid && getUserData()) {
                const totalpage = getBookData()[bookid].pages.length;
                for(var no=0; no<totalpage; no++) {
                    if(!isAllChecked(bookid, no+1)) {
                        openPgaeNo = no+1;
                        break;
                    }
                    if(no == totalpage-1) { //페이지학습완료
                        openPgaeNo = '';
                    }
                }
            }
            app.find('a')[0].href = `makeroom.html?mid=${mid}&course=${courseId}&book=${bookid}&page=${openPgaeNo}`;
        }
        app.find('a')[0].innerText = bookData[stepList[i]].title;
    }
}

function getUserData() {
    const data = localStorage.getItem(mid);
    
    return JSON.parse(data);
}

function updateUserData(data) {
    // localStorage.setItem(mid, data);
}

/**
 * 페이지별 id가 부여된 컨텐츠 id 목록 가져오기
 * @param {string} bookid 
 * @param {string} pageid 
 * @returns {object} id배열
 */
function getContentsId(bookid, pageid) { 
    const totalPages = getBookData()[bookid].pages;
    const targetPage = totalPages.filter( o => Object.keys(o)[0] == pageid)[0];
    const content = targetPage[pageid].content;
    
    let idList = content.filter(o => o.id);
    idList = idList.map( o => o.id)
    
    return idList;
}

/**
 * 페이지 번호로 페이지 아이디 가져오기
 * @param {*} bookid 
 * @param {*} pageNumber 
 * @returns 
 */
function pageIdByNumber(bookid, pageNumber) {
    return Object.keys(getBookData()[bookid].pages[pageNumber-1])[0];
}

/**
 * 페이지의 모든 체크 요소 학습 여부 
 * @param {string} bookid 
 * @param {number} page 
 * @returns {boolean} 
 */
function isAllChecked(bookid, page) {
    const pageid = pageIdByNumber(bookid, page);
    const studyData = getUserData()[bookid][pageid] ? 
        getUserData()[bookid][pageid].clicked : [];
    const compare = getContentsId(bookid, pageid);
    let point = undefined;
    for(let id of compare) {
        if(!studyData.includes(id)) {
            point = id;
            break;
        }
    }

    return point == undefined;
}
// getContentsId('88a32a81', '40c937fd');