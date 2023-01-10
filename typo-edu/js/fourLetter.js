const compData = {
    bx : fourletterApp,
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
    appCode : `title('사자성어');
word('유유상종', '類類相從');
word('속전속결', '速戰速決');`,
    appTitle: '사자성어',
    bgCode : ``
};
BX.regist('FourletterApp', compData);
let title, word;
function fourletterApp() {
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
                        if(letters[i]) letters[i].innerText = txt2[i];
                        letterPack.next().text(hint);
                    }
                } else {
                    for(var i=0; i<txt1.length; i++) {
                        if(letters[i]) letters[i].innerText = txt1[i];
                        letterPack.next().text('');
                    }
                }
            });
        }
        hintBox = box().appendTo(line).size('90%', 'auto').textColor('gold');

        line.bgImage = (src) => {
            line[0].style.background = `url('${src}')`;
        }

        return line;
    }


    const bg = box().size('100%');
    const titleBox = box().appendTo(bg).size('100%', 40).text('단어장').fontSize(20).align('center').padding(7);
    const note = box().appendTo(bg).size('100%', 'calc(100% - 40px').align('center').overflow('auto');
    note[0].style.backgroundColor = '#3d220c';
    note[0].style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 28' width='56' height='28'%3E%3Cpath fill='%23febb2e' fill-opacity='0.19' d='M56 26v2h-7.75c2.3-1.27 4.94-2 7.75-2zm-26 2a2 2 0 1 0-4 0h-4.09A25.98 25.98 0 0 0 0 16v-2c.67 0 1.34.02 2 .07V14a2 2 0 0 0-2-2v-2a4 4 0 0 1 3.98 3.6 28.09 28.09 0 0 1 2.8-3.86A8 8 0 0 0 0 6V4a9.99 9.99 0 0 1 8.17 4.23c.94-.95 1.96-1.83 3.03-2.63A13.98 13.98 0 0 0 0 0h7.75c2 1.1 3.73 2.63 5.1 4.45 1.12-.72 2.3-1.37 3.53-1.93A20.1 20.1 0 0 0 14.28 0h2.7c.45.56.88 1.14 1.29 1.74 1.3-.48 2.63-.87 4-1.15-.11-.2-.23-.4-.36-.59H26v.07a28.4 28.4 0 0 1 4 0V0h4.09l-.37.59c1.38.28 2.72.67 4.01 1.15.4-.6.84-1.18 1.3-1.74h2.69a20.1 20.1 0 0 0-2.1 2.52c1.23.56 2.41 1.2 3.54 1.93A16.08 16.08 0 0 1 48.25 0H56c-4.58 0-8.65 2.2-11.2 5.6 1.07.8 2.09 1.68 3.03 2.63A9.99 9.99 0 0 1 56 4v2a8 8 0 0 0-6.77 3.74c1.03 1.2 1.97 2.5 2.79 3.86A4 4 0 0 1 56 10v2a2 2 0 0 0-2 2.07 28.4 28.4 0 0 1 2-.07v2c-9.2 0-17.3 4.78-21.91 12H30zM7.75 28H0v-2c2.81 0 5.46.73 7.75 2zM56 20v2c-5.6 0-10.65 2.3-14.28 6h-2.7c4.04-4.89 10.15-8 16.98-8zm-39.03 8h-2.69C10.65 24.3 5.6 22 0 22v-2c6.83 0 12.94 3.11 16.97 8zm15.01-.4a28.09 28.09 0 0 1 2.8-3.86 8 8 0 0 0-13.55 0c1.03 1.2 1.97 2.5 2.79 3.86a4 4 0 0 1 7.96 0zm14.29-11.86c1.3-.48 2.63-.87 4-1.15a25.99 25.99 0 0 0-44.55 0c1.38.28 2.72.67 4.01 1.15a21.98 21.98 0 0 1 36.54 0zm-5.43 2.71c1.13-.72 2.3-1.37 3.54-1.93a19.98 19.98 0 0 0-32.76 0c1.23.56 2.41 1.2 3.54 1.93a15.98 15.98 0 0 1 25.68 0zm-4.67 3.78c.94-.95 1.96-1.83 3.03-2.63a13.98 13.98 0 0 0-22.4 0c1.07.8 2.09 1.68 3.03 2.63a9.99 9.99 0 0 1 16.34 0z'%3E%3C/path%3E%3C/svg%3E")`;

    return bg;
}

function lessonPlan(){ //교안.
    $('.lessonWindow')[0].style.backgroundColor = '#d9f3f5';
    $('.lessonWindow')[0].style.backgroundImage = `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10h10v10H0V10zM10 0h10v10H10V0z' fill='%239fdbe2' fill-opacity='0.19' fill-rule='evenodd'/%3E%3C/svg%3E")`;


    const b = box().width('95%').align('left');
    const script = `<br>이번 시간에는 <span style="background-color:lightskyblue;">사자성어 앱</span>을 만들어 보겠습니다.<br><br><br><br>
사자성어는 <span style="background-color:gray; color:white;"><4 글자로 이루어진 관용구></span>를 말합니다.<br><br><br>
이는 고사에서 유래된 한자어 관용어로 사용되고 있습니다.<br><br><br><br>

초성단어 앱 코드에서 시작해 볼까요?<br><br><br><br><br><br>

<span style="background-color:green; color:white; font-size:30px;">color</span>는 "색"을 의미하는 영단어 입니다.<br><br><br><br>
에디터에 다음의 코드를 추가하고 <font color=#0076BA>실행</font>해보세요.<br>
<sup style="color:#0076BA;font-size:12px;">실행버튼은 에디터 상단 오른쪽에 있습니다.</sup>
<iframe
  src="https://carbon.now.sh/embed?bg=rgba%28171%2C184%2C195%2C0%29&t=blackboard&wt=sharp&l=javascript&width=800&ds=false&dsyoff=7px&dsblur=57px&wc=true&wa=false&pv=27px&ph=31px&ln=false&fl=1&fm=Cascadia+Code&fs=15px&lh=131%25&si=false&es=2x&wm=false&code=title('사자성어').textColor('white').color('sienna');"
  style="width: 100%; height: auto; border:0; margin: 0; padding:0; transform: scale(1); overflow:hidden;"
  sandbox="allow-scripts allow-same-origin">
</iframe>
<br><br><br><br>
<span style="background-color:hotpink; color:white; font-size:30px;">textColor</span>로 글자색이,<br>
<span style="background-color:green; color:white; font-size:30px;">color</span>로 앱 제목의 배경색이 변경되었습니다.<br><br><br><br><br>

이번에는 <span style="background-color:blue; color:white; font-size:30px;">word</span>에 텍스트를 추가해 사자성어의 뜻을 출력해보겠습니다. <br><br><br><br>
에디터에 다음의 코드를 따라서 타이핑하고 <font color=#0076BA>실행</font>해보세요.<br>
<iframe
  src="https://carbon.now.sh/embed?bg=rgba%28171%2C184%2C195%2C0%29&t=blackboard&wt=sharp&l=javascript&width=500&ds=false&dsyoff=7px&dsblur=57px&wc=true&wa=false&pv=27px&ph=31px&ln=false&fl=1&fm=Cascadia+Code&fs=15px&lh=131%25&si=false&es=2x&wm=false&code=word('유유상종', '類類相從', '비슷한 것들끼리 무리를 이룸');"
  style="width: 100%; height: auto; border:0; padding:0; transform: scale(1); overflow:hidden;"
  sandbox="allow-scripts allow-same-origin">
</iframe><br><br><br><br>

사자성어의 뜻을 의미하는 텍스트가 사용되었습니다. <br><br><br><br>
앱 화면에서 사자성어를 <span class="material-symbols-outlined" style="color:purple;">mouse</span><font color=purple>클릭</font>해보세요. <br><br><br><br><br>
'유유상종'의 한자어와 뜻을 확인할 수 있습니다. ^^ <br><br><br><br><br><br><br>

속전속결의 뜻은 무엇일까요? <br><br><br><br><br><br>
<span style="background-color:yellowgreen; color:white;">"어떤 일을 빨리 진행하여 빨리 끝냄"</span> 입니다. <br><br>
3라인의 코드에 사용해보세요. <br><br><br><br><br><br>


이번 시간 학습한 명령어는 <code>textColor</code>와 <code>color</code> 입니다.<br><br><br>
이제 자유롭게 사자성어를 추가해 나만의 사자성어 앱을 완성해보세요. <br><br>
<div style="text-align: center;">.<br>.<br>.<br></div><br><br>
<div class="finishCont">
완성된 앱은 가족과 친구에게 공유해 <br>내가 만든 앱에 대해 피드백 받아보세요.</div><br>`;
    b.html(script);

    return b;
}

