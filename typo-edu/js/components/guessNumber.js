//숫자 맞추기 게임 : 변수 step 실습앱
const guessNumgerScheme = {
    app : {
        kind: 'box',
        style : {
            textAlign: 'center',
            height: '100%',
            fontSize: 40,
            overflow: 'hidden'
        },
        children: [
            {
                kind: 'box',
                text: 'Guess Number',
                style: {
                    width: '100%',
                    height: 50,
                    
                }
            },
            {
                kind: 'box',
                style: {
                    width: '100%',
                    height: 'calc(70% - 50px)',
                    background: 'gray',
                    paddingTop: 10,
                    lineHeight: 0,
                    textAlign: 'left'
                }
            },
            {
                kind: 'box',
                text : '크다',
                className: 'bigger',
                style: {
                    width: '50%',
                    height: '30%',                    
                }
            },
            {
                kind: 'box',
                text: '작다',
                className: 'smaller',
                style: {
                    width: '50%',
                    height: '30%',                    
                }
            }
        ]
    },
    correctbox: {
        kind: 'box',
        style: {
            width: '80%', 
            height: 'auto',
            background: 'rgba(24,50,178,0.8)',
            color :'white',
            borderRadius: 10,
            padding :5,
            position : 'absolute',
            zIndex :3,
            left :'10%',
            top:'35%',
            lineHeight:'100%'
        }
    }
};
var appTitle, appendNumberButton, getResult, getRandomNumber;//실습에 사용할 함수들.
(function(){
    function previewApp() {
        const randomNumber = Math.floor(Math.random() * 50) + 1;
        const b = box().size('100%');
        const app = BX.component(guessNumgerScheme.app).appendTo(b);
        const titleBox = app.children()[0];
        const bg = app.children()[1];
        let clickCount = 0;
        for(let i=1; i<51; i++) {
            const num = box().appendTo(bg).size('18%', '8%').text(i).align('center').fontSize(18).color('white').margin(3).borderRadius(8).lineHeight('18px');
        
            num.on('click', e => {
                playSound('click');
                clickCount++;
                const clickedNumber = e.target.innerText;
                
                if(clickedNumber == randomNumber) {
                    playSound('good');
                    e.target.style.background = 'red';
                    BX.component(guessNumgerScheme.correctbox).appendTo(app).html(`${clickCount} 번 만에<br>맞췄습니다.`);
                } 
                else if(clickedNumber > randomNumber) {
                    //작다 버튼 활성
                    e.target.style.opacity = '0';
                    $(e.target).off('click');
                    $('.smaller')[0].style.background = 'yellow';
                    $('.smaller')[0].innerText = `${clickedNumber} 보다\n작다`;
                    $('.bigger')[0].style.background = 'white';
                    $(e.target).nextAll().each(function(i, el) {
                        el.style.opacity = '0';
                        $(el).off('click');
                    });
                } 
                else {
                    e.target.style.opacity = '0';
                    $(e.target).off('click');
                    $('.smaller')[0].style.background = 'white';
                    $('.bigger')[0].style.background = 'yellow';
                    $('.bigger')[0].innerText = `${clickedNumber} 보다\n크다`;
                    $(e.target).prevAll().each(function(i, el) {
                        el.style.opacity = '0';
                        $(el).off('click');
                    });
                }
            });
        }
        const title = function(text) {
            $(titleBox).text(text);
            return titleBox;
        }
    
        return b;
    }
    
    function practiceApp() {
        const b = box().size('100%');
        const app = BX.component(guessNumgerScheme.app).appendTo(b);
        const titleBox = app.children()[0];
        const bg = app.children()[1];
        
        getRandomNumber = function(start, end) {
            return Math.floor(Math.random() * end) + start;
        }
    
        appTitle = function(text) {
            $(titleBox).text(text);
            return titleBox;
        }
    
        appendNumberButton = function(fn) {
            for(let i=1; i<51; i++) {
                const num = box().appendTo(bg).size('18%', '8%').text(i).align('center').fontSize(18).color('white').margin(3).borderRadius(8).lineHeight('18px');
                num[0].text = function() {
                    return num[0].innerText;
                }
                num.on('click', fn);
            }
        }
    
        getResult = function(clickCount, target, randomNumber) {
            const clickedNumber = target.innerText;
            if(clickedNumber == randomNumber) {
                playSound('good');
                target.style.background = 'red';
                BX.component(guessNumgerScheme.correctbox).appendTo(app).html(`${clickCount} 번 만에<br>맞췄습니다.`);
            } 
            else if(clickedNumber > randomNumber) {
                //작다 버튼 활성
                target.style.opacity = '0';
                $(target).off('click');
                $('.smaller')[0].style.background = 'yellow';
                $('.smaller')[0].innerText = `${clickedNumber} 보다\n작다`;
                $('.bigger')[0].style.background = 'white';
                $(target).nextAll().each(function(i, el) {
                    el.style.opacity = '0';
                    $(el).off('click');
                });
            } 
            else {
                target.style.opacity = '0';
                $(target).off('click');
                $('.smaller')[0].style.background = 'white';
                $('.bigger')[0].style.background = 'yellow';
                $('.bigger')[0].innerText = `${clickedNumber} 보다\n크다`;
                $(target).prevAll().each(function(i, el) {
                    el.style.opacity = '0';
                    $(el).off('click');
                });
            }
        }
        
        return b;
    }
    window.practiceApp = practiceApp;
    window.previewApp = previewApp;
})();

const compData = {
    bx : previewApp,
    practice: practiceApp,
    category: '',
    user: 'zzin',
    desc: `교육용 앱 컴포넌트<br>
▼ scheme 데이터 key :<br>
resource`,
    basicCode: `BX.components.GuessNumber.bx().appendTo(topBox);`,
    lessonBook: '',
    appCode : `


appTitle('Guess Number');
appendNumberButton(clickNumberButton);
function clickNumberButton(e) {
    clickCount++;
    
    getResult(clickCount, clickNumber, randomNumber);
}`,
    appTitle: '숫자 맞추기',
    bgCode : `appTitle('Guess Number');`
};
BX.regist('GuessNumber', compData);

