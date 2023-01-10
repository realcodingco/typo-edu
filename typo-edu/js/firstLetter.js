const compData = {
    bx : firstletterApp,
    category: '',
    user: 'zzin',
    desc: `교육용 앱 컴포넌트<br>
▼ scheme 데이터 key :<br>
resource`,
    basicCode: `BX.components.FirstLetterApp.bx().appendTo(topBox);`,
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
const bx = BX.components.FirstLetterApp.bx(scheme);
bx.appendTo(topBox);`,
    lessonBook: lessonPlan,
    appCode : '',
    appTitle: '초성 단어장',
    bgCode : `title('단어장');
word('ㅂㄴㄴ', '바나나');
word('ㅇㅍㅁㄱ', '애플망고');`
};
BX.regist('FirstletterApp', compData);
let title, word;
function firstletterApp() {
    title = function(text) {
        titleBox.text(text);
        return titleBox;
    }
    let hintBox;
    word = function(txt1, txt2, hint) {
        const line = box().appendTo(note).size('95%', 'auto').borderBottom('1px dashed lightgray').align('center').padding(10)
       
        const letterPack = box().appendTo(line);
        for(var i=0; i<txt1.length; i++) {
            box().appendTo(letterPack).size(50).color('white').text(txt1[i]).fontSize(50).borderRadius(10).paddingLeft(3).lineHeight('51px').margin(5).click(e => {
                const letters = letterPack.children(); 
                if(letters[0].innerText == txt1[0]) {
                    for(var i=0; i<txt2.length; i++) {
                        if(letters[i]) letters[i].innerText = txt2[i]
                    }
                } else {
                    for(var i=0; i<txt1.length; i++) {
                        if(letters[i]) letters[i].innerText = txt1[i]
                    }
                }
            });
        }
        hintBox = box().appendTo(line).size('90%', 'auto').textColor('gold').text(hint);

        line.bgImage = (src) => {
            line[0].style.background = `url('${src}')`;
        }

        return line;
    }


    const bg = box().size('100%');
    const titleBox = box().appendTo(bg).size('100%', 40).text('단어장').fontSize(20).align('center').padding(7);
    const note = box().appendTo(bg).size('100%', 'calc(100% - 40px').align('center').overflow('auto');
    note[0].style.backgroundColor = '#626165';
    note[0].style.backgroundImage =  `url("data:image/svg+xml,%3Csvg width='24' height='40' viewBox='0 0 24 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40c5.523 0 10-4.477 10-10V0C4.477 0 0 4.477 0 10v30zm22 0c-5.523 0-10-4.477-10-10V0c5.523 0 10 4.477 10 10v30z' fill='%23aaa9aa' fill-opacity='0.19' fill-rule='evenodd'/%3E%3C/svg%3E")`;
    

    return bg;
}

function lessonPlan(){ //교안.
    const b = box().width('95%').align('left');
    const script = `<br>이번 시간에는 간단한 명령어를 사용해 <span style="background-color:pink;">초성 단어장 앱</span>을 만들어 보겠습니다.<br><br><br><br>
초성은 <span style="background-color:gray; color:white;"><단어를 이루는 음절의 처음 소리에 해당하는 자음></span>을 말합니다.<br><br><br>
예를 들어, 단어 "코딩"의 초성은 "ㅋㄷ"으로 볼 수 있습니다. <br><br><br><br>
 
그럼, 시작해볼까요?<br><br><br><br><br><br>

<span style="background-color:green; color:white; font-size:30px;">title</span>은 "제목"을 의미하는 영단어 입니다.<br><br><br><br>
에디터에 다음의 코드를 따라서 타이핑하고 <font color=#0076BA>실행</font>해보세요.<br>
<sup style="color:#0076BA;font-size:12px;">실행버튼은 에디터 상단 오른쪽에 있습니다.</sup>
<iframe
  src="https://carbon.now.sh/embed?bg=rgba%28171%2C184%2C195%2C0%29&t=blackboard&wt=sharp&l=javascript&width=550&ds=false&dsyoff=7px&dsblur=57px&wc=true&wa=false&pv=27px&ph=31px&ln=false&fl=1&fm=Cascadia+Code&fs=18px&lh=131%25&si=false&es=2x&wm=false&code=title('초성단어장');"
  style="width: 100%; height: auto; border:0; padding:0; transform: scale(1); overflow:hidden;"
  sandbox="allow-scripts allow-same-origin">
</iframe>
<br><br><br><br><br><br>
코드 실행결과, 앱의 제목이 변경되었나요?<br><br><br><br><br>
첫 명령어의 사용에 성공한 거에요. ^^<br><br><br><br><br><br>
<span style="background-color:blue; color:white; font-size:30px;">word</span>는 "단어"를 의미하는 영단어 입니다. <br><br><br><br>
에디터에 다음의 코드를 따라서 타이핑하고 <font color=#0076BA>실행</font>해보세요.<br>
<iframe
  src="https://carbon.now.sh/embed?bg=rgba%28171%2C184%2C195%2C0%29&t=blackboard&wt=sharp&l=javascript&width=500&ds=false&dsyoff=7px&dsblur=57px&wc=true&wa=false&pv=27px&ph=31px&ln=false&fl=1&fm=Cascadia+Code&fs=18px&lh=131%25&si=false&es=2x&wm=false&code=word('ㅂㄴㄴ', '바나나');"
  style="width: 100%; height: auto; border:0; padding:0; transform: scale(1); overflow:hidden;"
  sandbox="allow-scripts allow-same-origin">
</iframe><br><br><br><br>

단어장에 단어가 추가되었나요? <br><br><br><br>
앱 화면에서 추가된 초성 단어를 <span class="material-symbols-outlined" style="color:purple;">mouse</span><font color=purple>클릭</font>해보세요. <br><br><br><br><br>
'ㅂㄴㄴ'은 '바나나'를 의미하는 초성단어임을 확인할 수 있습니다. ^^ <br><br><br><br><br><br><br>

이번 시간 학습한 명령어는 <code>title</code>과 <code>word</code> 입니다. <br><br><br><br>

명령어 사용에 기억해야 할 점은 <br><br>
하나. 명령어는 소괄호<font color=red>()</font> 기호를 함께 사용한다는 것과<br><br>
두울. 세미콜론 <font color=red>;</font>을 문장의 마침표처럼 사용해야 한다는 것입니다.<br><br><br><br><br>
이제 2가지 명령어를 사용해서 나만의 초성단어장을 완성해보세요. <br><br>
<div style="text-align: center;">.<br>.<br>.<br></div><br><br>
<div class="finishCont">
완성된 앱은 가족과 친구에게 공유해 <br>내가 만든 앱에 대해 피드백 받아보세요.</div><br>`;
    b.html(script);

    return b;
}

