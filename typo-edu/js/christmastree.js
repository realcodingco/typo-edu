//
const compData = {
    bx : christmasApp,
    category: '',
    user: 'zzin',
    desc: `소개 섹션 컴포넌트<br>
▼ scheme 데이터 key :<br>
resource`,
    basicCode: `BX.components.About.bx().appendTo(topBox);`,
    extendCode: `<font color=gray>// scheme 데이터 사용</font>
const scheme = {
    headTitle: '',
    desc : [
        {
            head: '',
            image : '이미지경로',
            text: '이미지별 문구'
        }
    ]
};
const bx = BX.components.About.bx(scheme);
bx.appendTo(topBox);`,
    appCode : `bgImage('christmasTree.gif');`,
    appTitle: '크리스마스 트리'
};
BX.regist('ChristmasApp', compData);
// let width = 35;
// attach(blueball, width, 168, 155);
// attach(redball, width, 117, 205);
// attach(goldball, width, 191, 234);
// attach(silverball, width, 93, 305);
// attach(greenball, width, 230, 357);
// attach(purpleball, width, 49, 438);
// attach(star, 70, 127, 80);
// attach(stick, 50, 139, 331);
// attach(cookie, 50, 121, 410);
// attach(bell, 50, 189, 404);
// attach(presents, 130, 185, 475);

function christmasApp(){
    const app = box().size('100%');
    app[0].className = 'app';
    // $('.appWindow').addClass('blink')
    return app;
}
let imgs = ['blueball', 'redball', 'goldball', 'silverball', 'greenball', 'purpleball', 'star', 'stick', 'cookie', 'bell', 'presents'];
let [blueball, redball, goldball, silverball, greenball, purpleball, star, stick, cookie, bell, presents] = imgs.map(e => createImgEl(e));

function createImgEl(name) {
    const img = document.createElement('img');
    let src = `./image/${name}.png`;
    img.src = src;
    img.style.width = 'auto';
    img.style.height = 'auto';
    img.style.padding = '5px';
    img.className = 'appEl animate__animated animate__bounceInDown';
    $(img).draggable({
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
        
    img.onclick = e => { //좌표정보 확인을 위한 가이드 점선
        $(e.target).toggleClass('attach');
    }
    

    return img;
}

