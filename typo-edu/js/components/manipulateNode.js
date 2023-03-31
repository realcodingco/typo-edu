// 문서객체모델 교재 실습앱
(function(){
    const scheme = {
        parent : {
            kind: 'box',
            className: 'market',
            style : {
                background : 'white',
                fontFamily : 'IBM Plex Mono',
                display : 'flex',
                justifyContent : 'center'
            },
            children: [
                {
                    kind: 'box',
                    style: {
                        margin : 10
                    },
                    text : '식료품',
                    children: [
                        {
                            kind : 'br'
                        },
                        {
                            kind : 'img',
                            src : './lecture/L018761/2eb7100f/grocery.png'
                        }
                    ]
                },
                {
                    kind: 'box',
                    style: {
                        margin : 10
                    },
                    text : '의류',
                    children: [
                        {
                            kind : 'br'
                        },
                        {
                            kind : 'img',
                            src : './lecture/L018761/2eb7100f/cloths.png'
                        }
                    ]
                },
                {
                    kind: 'box',
                    style: {
                        margin : 10
                    },
                    text : '가구',
                    children: [
                        {
                            kind : 'br'
                        },
                        {
                            kind : 'img',
                            src : './lecture/L018761/2eb7100f/furniture.png'
                        }
                    ]
                }
            ]
        }
    }
    function bx21(){
        const b = box();
        BX.component(scheme.parent).appendTo(b);
        return b;
    }
    window.bx21 = bx21;
})();

const compData = {
    bx : bx21,
    practice: bx21,
    category: '',
    user: 'zzin',
    desc: `교육용 앱 컴포넌트<br>
▼ scheme 데이터 key :<br>
resource`,
    basicCode: `BX.components.ManipulateNode.bx().appendTo(topBox);`,
    lessonBook: '',
    appCode : ``,
    appTitle: 'DOM 조작',
    bgCode : ``
};
BX.regist('ManipulateNode', compData);