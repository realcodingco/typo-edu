toastr.options = {
    closeButton: true,
    progressBar: true,
    showMethod: 'slideDown',
    timeOut: 3000,
    zIndex: 12
};

var bgAudio = new Audio();

/**
 * 
 * @param {object} el 
 * @param {number} w 
 * @param {number} x 
 * @param {number} y 
 */
function attach(el, w, x, y) {
    if(w) {
        el.style.width = w + 'px';
    }
    $('.app')[0].appendChild(el);

    if(x || y) {
        el.style.position = 'absolute';
        el.style.left = x + 1 + 'px'; 
        el.style.top = y + 1 + 'px';
    } else {
        el.style.position = 'static'
    }
    
    $(el).draggable({
        start: e => { 
            $(e.target).addClass('attach');

        },
        drag: e => {
            $(e.target).position('absolute')
            $(e.target).offset({left : e.offsetX - 2 + 'px', top: e.offsetY -2 + 'px'})
            
        },
        stop: e => {
            $(e.target).removeClass('attach');
        }
    });

    return el;
}

/**
 * img 요소를 붙여줍니다.
 * @param {*} src 이미지 경로
 * @param {number} w 이미지 너비 - optional, 미사용시 100%
 * @param {number} h 이미지 높이 - optional, 미사용시 100%
 * @returns 이미지 요소
 */
function appendImage(src, w, h){
    let b = box().textAlign('center');
    let img = document.createElement('img');
    img.src = src;
    img.style.width = w ? `${w}px` : '100%';
    img.style.height = h ? `${h}px` : '100%';
    img.style.border = '1px solid lightgray';
    b[0].appendChild(img);
    $('.appWindow')[0].appendChild(b[0]);
    return img;
} 

function app(){
    return $('.appWindow')[0];
}

/**
 * button 요소를 붙여줍니다.
 * @param {*} txt 버튼 텍스트
 * @param {*} w 버튼 너비 - optional, 미사용시 auto
 * @param {*} h 버튼 높이 - optional, 미사용시 auto
 * @returns 버튼 요소
 */
function appendButton(txt, w, h){
    let b = box().textAlign('center');
    let button = document.createElement('button');
    button.type = 'button';
    button.style.width = w ? `${w}px` : 'auto';
    button.style.height = h ? `${h}px` : 'auto';
    button.style.margin = '10px';
    button.textContent = txt;
    b[0].appendChild(button);
    $('.appWindow')[0].appendChild(b[0]);

    return button;
}

/**
 * image 폴더 내 리소스 이미지를 사용해 앱 배경 이미지 설정
 * @param {*} name 폴더 내 이미지 파일명
 */
function bgImage(name) {
    let src = `url('./image/${name}')`;
    if(name.startsWith('https')) {
        src = "url('" +  name + "')";
    }
    $('.appWindow')[0].style.background = src;
    $('.appWindow')[0].style.backgroundSize = 'cover';
    $('.appWindow')[0].style.backgroundRepeat = 'no-repeat';
}

/**
 * 사운드 재생
 * @param {string} name - 사운드 이름
 */
function playSound(name) {
    bgAudio.pause();
    bgAudio.currentTime = 0;
    let src = `./sound/${name}.mp3`;
    bgAudio.src = src;
    bgAudio.muted = true;
    setTimeout(()=> {
        bgAudio.play();
        bgAudio.muted = false
    }, 150);   
}

/**
 * 하단콘솔창에 출력 명령어
 */
const print = function() {
    const b = box();
    b[0].innerHTML = '>>>'; 
    
    Array.from(arguments).forEach(el => {
        b[0].innerHTML += " "
        const insertValue = typeof el === "object" ? JSON.stringify(el) : el
        b[0].innerHTML += insertValue  
    });
    b[0].innerHTML += "\n";
    b.appendTo($('.consolewindow'));
    b[0].scrollIntoView(true);
}

const randomId = (length = 8) => {
    return Math.random().toString(16).substr(2, length);
};

function getBookData() {
    let total = JSON.parse(localStorage.getItem("book"));
    return total;
}

function getTotalCourseData() {
    const data = JSON.parse(localStorage.getItem('course'));
    return data || {};
}
/**
 * 교재 생성 데이터 가져오기
 * @param {*} cid - 코스id
 * @param {*} bid - book id
 * @param {*} fn 
 */
function getBook(cid, bid, fn) {
    $.ajax({url: `./lecture/${cid}/${bid}/${bid}.json`, dataType: "json"})
    .done((json) => {
        if(fn) fn(json);
    })
    .fail((xhr, status, error) => {})
}
/**
 * josn 파일 읽기
 * @param {*} src 
 * @param {*} fn 
 */
function getJsonData(src, fn) {
    $.ajax({url: src, dataType: "json"})
    .done((json) => {
        if(fn) fn(json);
    })
    .fail((xhr, status, error) => {});
}

function getCrsBookData(crs, fn) {
    let data = {};
    getJsonData('./lecture/course.json', json => {
        data.courseData = json;
        const books = json[crs].books;
        const ids = books.map(o => o.id);
        let bookData = {};
        for(var id of ids) {
            getBook(crs, id, function(data) {
                bookData[id] = data;
            });
        }
        data.bookData = bookData;
        if(fn) fn(data);
    });
}
/**
     * 학습기간별 데이터에서 학습자 데이터 가져오기
     * @param {*} data - groupId, crsStart, mid 값을 필수로 가지는 json
     * @param {*} fn 
     * @returns 
     */
function getUserData(data, fn) {
    if(!data.mid) {
        if(fn) fn(null);
        return;
    }

    const read = (callback) => {
        BX.db.firestore().collection('lecture').doc(data.groupId)
                        .collection('monthly').doc(data.crsStart.substring(0, 6))
                        .collection('members').doc(data.mid)
                        .get()
                        .then(callback)
                        .catch((error) => {
                            toastr.error('일시적인 네트워크 오류입니다. 새로고침 후, 다시 시도하세요.');
                            throw new Error('일시적인 네트워크 오류');
                        });
    };
    
    read(function(doc) {
        if(fn && doc.exists) fn(doc.data());
        else fn({});
    });
}
/**
 * 학습자 데이터 저장
 * @param {*} data - groupId, crsStart, mid, data 값을 필수로 가지는 json
 * @param {*} fn 
 */
function putUserData(data, fn) {
    const write = (callback) => {
        BX.db.firestore().collection('lecture').doc(data.groupId)
                        .collection('monthly').doc(data.crsStart.substring(0, 6))
                        .collection('members').doc(data.mid)
                        .set(data.data)
                        .then(callback)
                        .catch(callback);
    };
    write(function(result) {
        if(fn) fn(result);
    });
}
/**
 * 학습자 데이터 업데이트
 * @param {*} data - groupId, crsStart, mid, data 값을 필수로 가지는 json
 * @param {*} fn 
 */
function updateUserData(data, fn) {
    const update = (callback) => {
        BX.db.firestore().collection('lecture').doc(data.groupId)
                        .collection('monthly').doc(data.crsStart.substring(0, 6))
                        .collection('members').doc(data.mid)
                        .update(data.data)
                        .then(callback)
                        .catch(callback);
    }
    update(function(result) {
        if(fn) fn(result);
    });
}

/**
 * 현재 시점이 수강기간에 해당하는지 체크
 * @param {string} yyyymmdd - edustart
 * @returns - true or false
 */
function isTakingClass(yyyymmdd) {
    const today = new Date();
    const thisDay = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2, '0')}01`
    return yyyymmdd == thisDay;
}
/**
 * yyyymm 형식의 수강시작일 문자열로 해당월 마지말 날로 종료일 반환
 * @param {*} crsStart 
 * @returns 
 */
function calcEndDate(crsStart) {
    if(!crsStart) {
        return;
    }

    const eduStart = new Date(crsStart.substring(0,4), crsStart.substring(4, 6) - 1, 1);
    return new Date(eduStart.getFullYear(), eduStart.getMonth()+1, 0); 
}
/**
 * 전체 학습진도율 계산
 * @param {*} courses - 코스 데이터 json
 * @param {*} lecBooks - 교재 데이터 json
 * @param {*} crs - 과정코드
 * @param {*} userData - 학습자 데이터
 * @param {*} fn 
 */
function calcProgress(courses, lecBooks, crs, userData, fn) {
    const books = courses[crs].books;
    let totalProgress = 0;
    let count = 0;
    //교재별 진도 계산
    const calc = (json, o) => { 
        count++;
        const bid = json.id;
        lecBooks[bid] = json; 
        let progress = 0;
        const pageData = lecBooks[bid].pages; // 배열 - 교재별 페이지 데이터
        let totalRequired = 0;
        let studied = 0;
        
        for(var i=0; i<pageData.length; i++) {
            let pid = Object.keys(pageData[i])[0];
            totalRequired += getContentsId(lecBooks, bid, pid).length;

            const userBookData = userData && userData.course[crs] && userData.course[crs].progress ? userData.course[crs].progress[bid] : null;
            const studyData = userBookData && userBookData[pid] ? 
                userBookData[pid].clicked : [];
            
            if(studyData){
                studied += studyData.length;
            }                    
        }
        
        progress = (studied / totalRequired) * 100;
        if(isNaN(progress)) {
            progress = 0;
        } else if(progress > 0) {
            progress = progress.toFixed(1);
        }  
        
        totalProgress += Number(progress);
        if(Object.keys(books).length == count) { 
            const percent = totalProgress / books.length;
            const total = parseFloat(percent.toFixed(2));
            if(fn) fn(total); //전체 진도율 전달
        }
    }
    Object.keys(books).forEach(function(o){
        const targetId = books[o].id;
        if(!Object.keys(lecBooks).includes(targetId)){
            getBook(crs, targetId, json => {
                calc(json, o);
            });
        }
        else {
            calc(lecBooks[targetId], o);
        }
    });
}
/**
 * 페이지별 id가 부여된 컨텐츠 id 목록 가져오기
 * @param {string} bookData
 * @param {string} bookid 
 * @param {string} pageid 
 * @returns {object} id배열
 */
function getContentsId(bookData, bookid, pageid) { 
    const totalPages = bookData[bookid].pages;
    const targetPage = totalPages.filter( o => Object.keys(o)[0] == pageid)[0];
    const content = targetPage[pageid].content;
    
    let idList = content.filter(o => o.id);
    idList = idList.map(o => o.id);
    
    return idList;
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
    else if(component == 'completeBtn') { // 교재 마지막 페이지 학습완료 버튼 컴포넌트
        result = BX.component(lesson.completeBtn);
        if(unit.id) {
            result.children()[1].id = unit.id;
        }
        if(!location.pathname.includes('makeBook')) result.find('.complete_check')[0].onclick = finishChapter;
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
        result = BX.component(lesson.aceEditor).height(unit.height);
        const drawCode = (result, unit) => {
            let code = unit.text;
            const editor = result.children()[0].aceEditor;
            editor.setValue(code); 
            editor.clearSelection();
            editor.setReadOnly(true);
            editor.renderer.$cursorLayer.element.style.opacity = 0; //커서 감추기
            if(unit.start) editor.setOption("firstLineNumber", unit.start * 1);
        }
        setTimeout(() => {
            drawCode(result, unit);
        }, 500);
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
                typingCount = 0;
                typingStart = false;
                $('.lessonBook').next().hide();
                // location.hash = '';
                const editor =  $('.ace_editor')[0].aceEditor;
                if(bgCode || bgCode == 'clear') {
                    editor.setValue(bgCode);
                    if(targetLine) editor.gotoLine(targetLine);
                } else {
                    editor.setValue('');
                    editor.gotoLine(1);
                }
                
                if(title) { // 에디터 제목 삽입
                    $('.appTitle')[0].innerText = title;
                }

                if(codeId) {
                    $('.appTitle')[0].id = codeId;
                    // pageId 전달
                    const pageId = $($(e.target).parents()[1]).find('.pageidtag')[0].innerText;
                    $('.appTitle')[0].dataset.pid = pageId;
                    // bookId 파라미터 값 makeroom.js 전역변수
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
                    editor.focus();
                    adjustScroll(e.target);
                }, 500);
            }
            else {
                $('.typingCount')[0].innerText = '';
                $('.lessonWindow').removeClass('half');
                $('.lessonBook')[0].style.overflowY = 'auto';
                $('.consolewindow').removeClass('open'); // 콘솔창 닫기
                setTimeout(() => {
                    $('.lessonBook').next().show();
                    
                    e.target.scrollIntoView({block:'start'});
                    e.target.value = '에디터 열기';
                    $('.consolewindow').empty();
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
                typingCount = 0;
                typingStart = false;
                $('.lessonBook').next().hide();
                location.hash = targetApp;
                openPractice(targetApp, unit.title, unit.bgCode);
                const editor =  $('.ace_editor')[0].aceEditor;
                if(targetLine) editor.gotoLine(targetLine);

                if(codeId) {
                    $('.appTitle')[0].id = codeId;
                    // pageId 전달
                    const pageId = $($(e.target).parents()[1]).find('.pageidtag')[0].innerText;
                    $('.appTitle')[0].dataset.pid = pageId;
                    // bookId 파라미터 값 makeroom.js 전역변수
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
                    e.target.value = 'DONE';
                    editor.focus();
                    $('.lessonBook')[0].style.overflowY = 'hidden';
                    adjustScroll(e.target);
                }, 500);
            }
            else {
                $('.typingCount')[0].innerText = '';
                $('.lessonWindow').removeClass('half');
                $('.lessonBook')[0].style.overflowY = 'auto';
                $('.consolewindow').removeClass('open'); // 콘솔창 닫기
                setTimeout(() => {
                    $('.lessonBook').next().show();
                    e.target.scrollIntoView({block:'start'});
                    e.target.value = '에디터 열기';
                    $('.consolewindow').empty();
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
    else if(component == 'quiz') { // 교재내 퀴즈팝업
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
                if(num < unit.quiz.length) {
                    toastr.success('2초 뒤에 다음 문제가 출제됩니다.', '', {timeOut: 2000});
                } else {
                    toastr.success('마지막 문항입니다.<br>곧 창이 닫힙니다.');
                    setTimeout(()=>{$('.quizPopup').removeClass('on');}, 3000);
                }
                // 학습페이지 퀴즈 풀이 학습기록 하지 않음
                setTimeout(() => { //정답,오답 알림 제거 후 다음 문제 생성
                    resultSheet.remove();
                    if(num >= unit.quiz.length) {
                        num = 1;
                    }
                    else {
                        num++;
                        showQuiz();
                    }
                }, 2000);
            }
            $('.quizpaper').scrollTop(0);
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
            if(!location.pathname.includes('makeBook')) bogi[0].onclick = checkedExample;
        }

        result = bg;
    }
    else if(component == 'finalQuizSubmit'){ // 응시용 퀴즈 제출하기 버튼
        result = BX.component(lesson.finalQuizSubmit);
        if(!location.pathname.includes('makeBook')) result.find('.quizbutton')[0].onclick = submitQuiz;
    }
    
    return result;
}
/**
 * 교재 내에서 practice direction의 에디터 열기 버튼을 클릭한 경우
 * @param {*} targetApp 실행앱 컴포넌트명
 * @param {*} title 코드제목
 * @param {*} bgCode 배경코드
 */
function openPractice(targetApp, title, bgCode) {
    const editor =  $('.ace_editor')[0].aceEditor;
    $('.emulator').show(); 

    if(targetApp != 'free') {
        const app = BX.components[targetApp];
        const code = app.appCode || bgCode;
        $('.editSection').find('.appTitle')[0].innerText = app.appTitle;
        $('.appWindow').empty();
        app.practice().appendTo($('.appWindow')[0]); 
        editor.setValue(code, 1);
        editor.focus();
        
        // editorUpdate();
        // eval(app.bgCode);
        runApp();
    } else {
        $('.editSection').find('.appTitle')[0].innerText = title;
        editor.setValue(bgCode, 1);
        editor.focus();
    }
    //배경코드 실행
    // editor.getSession().on('change', editorUpdate);
    $(editor).on('focus', e => {
        clickedRunBtn = false;
    });
}

/**
 * scrollintoview 처리 후, 버튼이 뷰포트 바깥으로 밀리는 경우 스크롤 조정
 * @param {*} item - 감시할 대상요소
 */
function adjustScroll(item) {
    const io = new IntersectionObserver((entry) => {
        if (!entry[0].isIntersecting) {
            $('.lessonBook')[0].scrollBy(0, -40); // 강제이동
        } 
        io.disconnect(); //관찰 해제
    });
    // 옵저버할 대상 DOM을 선택하여 관찰을 시작합니다.
    io.observe(item);
}

/**
 * 학습자 입력요소 체크 여부 확인
 * @returns 체크되지 않은 요소의 id 배열
 */
function isReadAll() { //페이지의 체크박스를 모두 체크하였는지 확인
    const checks = $('input.read_check');
    let notReaded = [];
    checks.each(function(i, b) {
        if(b.type == 'checkbox'){
            if(!b.checked) { //미체크 항목
                notReaded.push(b.id); 
            }
        } 
    });
    
    const hidebox = $('.hideb');
    hidebox.each(function(i, b) {
        const hideTarget = $(b).children()[0];
        if(!$(hideTarget).hasClass('checked')) {
            notReaded.push(hideTarget.id); 
        }
    });
    
    return notReaded;
}
/**
 * 학습자 퀴즈풀이 데이터로 오답시트 생성하기
 * @param {bx} target 오답시트를 붙여줄 대상
 * @param {string} crs 과정코드
 * @param {*} quizData 학습자 quiz 데이터
 */
function getSolve(target, crs, quizData){
    let totalCourse;
    const solve = quizData.solve; 
    const printEntrance = () => {
        const entranceTime = `마지막 입장시간 : ${new Date(quizData.entrance.time).toLocaleString()} / 열람횟수: ${quizData.entrance.count}`;
        box().appendTo(target).text(entranceTime).textColor('white').padding(5).textAlign('left');
    }

    const getBookData = (crs, bookid, fn) => {
        $.ajax({url: `./lecture/${crs}/${bookid}/${bookid}.json`, dataType: "json"})
        .done((json) => {
            if(fn) fn(json);
        })
        .fail((xhr, status, error) => {});
    };

    const printSheet = (quizId) => { 
        getBookData(crs, quizId, function(result) { //퀴즈교재 보기문항 가져오기
            const quizPage = result.pages[0];
            const questionData = Object.values(quizPage)[0].content;
            
            for(var i=0; i<solve.detail.length; i++){ //correct, question, userInput
                let quiz = BX.component(admin.solveUnit).appendTo(target);
                quiz.children()[0].innerText = i+1;
                quiz.find('.previewQuestion').children()[0].innerHTML = `${questionData[i+1].question}<br>`;
                const examples = questionData[i+1].example;
                const circleNumber = ['➀','➁','➂','➃'];
                const bogiBox = quiz.find('.previewQuestion').children()[1];
                let bogiTxt = '';
                for(let j=0; j<examples.length; j++) { //보기출력, 정답은 파란색으로
                    bogiTxt += `${questionData[i+1].answer == j+1 ? '<font color=blue>' : ''}${circleNumber[j]} ${examples[j]}${questionData[i+1].answer == j+1 ? '</font>' : ''} <br>`;
                }
                bogiBox.innerHTML = bogiTxt;
                if(solve.detail[i].userInput){
                    if(!solve.detail[i].correct) $(quiz.children()[0]).addClass('incorrect');
                    quiz.children()[2].innerText = solve.detail[i].userInput;
                }
                else {//풀지 않은 문항은 틀린것으로 
                    $(quiz.children()[0]).addClass('incorrect');
                }
            }
            printEntrance(); //입장기록 출력
        });
    }
    if(solve) {
        if(solve.time){
            const solveTime = `제출일 : ${new Date(solve.time).toLocaleString()}`;
            box().appendTo(target).text(solveTime).textColor('white').padding(5).textAlign('left');
        }

        if(!totalCourse) {
            getCourseData(function(totalcourse) {
                totalCourse = totalcourse;
                const quizId = totalCourse[crs].quiz[quizData.type];
                printSheet(quizId);
            });
        }
        else {
            const quizId = totalCourse[crs].quiz[quizData.type];
            printSheet(quizId);
        }
    } 
}
/**
 * 전체 코스 데이터 가져오기
 * @param {*} fn 
 */
function getCourseData(fn){
    $.ajax({url: "./lecture/course.json", dataType: "json"})
    .done((json) => {
        if(fn) fn(json);
    })
    .fail((xhr, status, error) => {});
}
/**
 * 날짜 데이터를 YYYYMMDD 형태로 출력
 * @param {*} date 
 * @returns 
 */
function YYYYMMDD(date) {
    const pad = (number, length) => {
        var str = '' + number;
        while (str.length < length) {
            str = '0' + str;
        }
        return str;
    }
    var yyyy = date.getFullYear().toString();
    var mm = pad(date.getMonth() + 1, 2);
    var dd = pad(date.getDate(), 2);
   
    return yyyy + mm + dd;
};