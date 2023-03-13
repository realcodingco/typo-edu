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
    console.log(bgAudio.paused)
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
    b[0].scrollIntoView(true);
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

