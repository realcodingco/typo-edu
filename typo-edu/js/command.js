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
 * 하단콘솔창에 출력
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
    b.appendTo(consoleDiv);
}

const randomId = (length = 8) => {
    return Math.random().toString(16).substr(2, length);
};

function getBookData() {
    let total = JSON.parse(localStorage.getItem("book"));
    // console.log(localStorage.getItem("book"))
    return total;
}

function getTotalCourseData() {
    const data = JSON.parse(localStorage.getItem('course'));
    return data || {};
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
    else if(component == 'text' || component == 'sub') { //텍스트
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
    else if(component == 'codeBox') { //코드상자
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
        const targetLine = unit.targetLine;
        const bg = BX.component(lesson.direction);
        bg.children()[0].innerHTML = unit.text;
        bg.children()[1].onclick = e => {
            //에디터 열어주기.
            if(e.target.value == '에디터 열기') {
                if(bgCode || bgCode == 'clear') {
                    const editor =  $('.ace_editor')[0].aceEditor;
                    editor.setValue(bgCode);
                    if(targetLine) editor.gotoLine(targetLine);
                }
                $('.lessonWindow').toggleClass('half');
                e.target.scrollIntoView({block:'start'}); //, inline:'end'
                setTimeout(() => {
                    $('.lessonBook')[0].style.overflowY = 'hidden';
                    e.target.value = 'DONE';
                }, 500);
            }
            else {
                $('.lessonWindow').toggleClass('half');
                setTimeout(() => {
                    $('.lessonBook')[0].style.overflow = 'auto';
                    e.target.scrollIntoView({block:'start'});
                    e.target.value = '에디터 열기';
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
        const targetLine = unit.targetLine;
        const bg = BX.component(lesson.practiceDirection);
        bg.children()[0].innerHTML = unit.text;
        bg.children()[1].onclick = e => {
            if(e.target.value == '에디터 열기') {
                location.hash = targetApp;
                openPractice(targetApp);
                const editor =  $('.ace_editor')[0].aceEditor;
                if(targetLine) editor.gotoLine(targetLine);
    
                $('.lessonWindow').toggleClass('half');
                e.target.scrollIntoView({block:'start', inline:'end'});
                
                setTimeout(() => {
                    $('.lessonBook')[0].style.overflow = 'hidden';
                    e.target.value = 'DONE';
                }, 500);
            }
            else {
                $('.lessonWindow').toggleClass('half');
                $('.lessonBook')[0].style.overflow = 'auto';
                setTimeout(() => {
                    e.target.scrollIntoView({block:'start', inline:'end'});
                    e.target.value = '에디터 열기';
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