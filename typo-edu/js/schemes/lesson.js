/**
 * 교재 생성을 위한 컨텐츠 컴포넌트 
 */
const lesson = {
    enter : {
        kind : 'br'
    },
    title : {
        kind : 'h2',
        children: [
            {
                kind: 'box',
                style: {
                    display: 'flex',
                    width: 'auto',
                    float:'right',
                    marginRight: 40,
                    opacity: 0.7
                },
                children: [
                    {
                        kind: 'span',
                        className: 'material-symbols-outlined',
                        text: 'help',
                        style : {
                            color: '#005925',
                            fontSize: 12,
                            margin: 2
                        }
                    },
                    {
                        kind: 'sup',
                        className: 'pageidtag',
                        style: {
                            display: 'block',
                            fontFamily: 'IBM Plex Mono',
                            fontWeight: 300,
                            fontSize: 8,
                            marginTop: 12,
                            color: '#005925',
                            verticalAlign: 'bottom'
                        }
                    },
                    
                ]
            }
            
        ]
    },
    video : {
        kind: 'video',
        className: 'recovideo',
        controls : '',
        width: '100%',
        preload: "metadata"
    },
    videojs: {
        kind: 'video',
        class: 'video-js vjs-big-play-centered'
    },
    text : {
        kind : ''
    },
    check : {
        kind : 'box',
        className: 'clickRequired',
        onClick: e => {
            if(e.target.tagName == 'INPUT') {
                return;
            }
            else if(e.target.tagName != 'DIV') {
                $(e.target).parent().click();
                return;
            }
            $(e.target).find('input')[0].click();
        },
        children : [
            { 
                kind : 'text',
            },
            {
                kind : 'input',
                className: 'read_check',
                type : 'checkbox',
                onClick: (e) => {
                    if(location.pathname.includes('makeBook')) return;
                    
                    if ( bookReady && $(e.target).prop('checked') ) {
                        saveUserData(e.target);
                        playSound('choice');
                        e.target.disabled = true;
                        $($(e.target).parent()[0]).removeClass('clickRequired');
                    }
                },
                style : {
                    zoom : 1.8,
                    marginLeft: 5
                }
            }
        ]
    },
    par : {
        kind: 'box'
    },
    codeBox : {
        kind: 'iframe',
        sandbox : 'allow-scripts allow-same-origin',
        style : {
            width : '100%',
            border : 0,
            marginTop: 10,
            padding: 0,
            overflow: 'hidden'
        }
    },
    postit: {
        kind: 'box',
        className: 'rgyPostIt'
    },
    direction : {
        kind: 'box',
        children: [
            {
                kind : 'text'
            },
            {
                kind : 'input',
                type: 'submit',
                // name : 'read_check',
                value: '에디터 열기',
                style : {
                    fontSize:14,
                    background: '#e8af06',
                    color:'white',
                    border: 0, 
                    borderRadius:5,
                    marginLeft: 5
                }
            }
        ]
    },
    practiceDirection : {
        kind: 'box',
        children: [
            {
                kind : 'text'
            },
            {
                kind : 'input',
                type: 'submit',
                // name : 'read_check',
                value: '에디터 열기',
                style : {
                    fontSize:14,
                    background: '#FF7098',
                    color:'white',
                    border: 0, 
                    borderRadius:5,
                    marginLeft: 5
                }
            }
        ]
    },
    table : {
        kind : 'box',
        style : {
            display: 'grid',
            width : '80%',
            border: '0.5px solid lightgray',
        }
    },
    link : {
        kind: 'box',
        style: {
            textAlign: 'center'
        },
        children: [
            {
                kind : 'a',
                target : '_blank'
            }
        ]
    },
    cardQuiz :  { // 카드타입교재 퀴즈 보기 선택
        kind: 'box',
        className: 'cardQuizExpBox',
        onClick: e => {
            $('.cardQuizExpBox').removeClass('selected');
            $(e.target).addClass('selected');
            const selected = $(e.target).index() + 1; //보기 번호
            localStorage.setItem('cardQuizSubmit', selected);
        }
    },
    quizQuestion : { // 퀴즈응시 문제영역
        kind: 'box',
        style: {
            display: 'flex'
        },
        children: [
            {
                kind: 'box', // 문제 번호
                style: {
                    fontSize: 30,
                    width: 55
                }
            },
            {
                kind: 'box', // 문제 내용 텍스트
                style: {
                    width: 'calc(100% - 55px)',
                    fontSize: 20,
                    marginTop: 5
                }
            }
        ]
    }, 
    finalQuizExample : { //퀴즈응시 보기 리스트 박스
        kind: 'box',
        className: 'finalQuizExample',
        style: {
            fontSize: 18,
            marginTop: 15
        },
    },
    finalExp: { // 보기문항 개별 요소
        kind: 'box',
        className: 'quizexamples'
    },
    finalQuizSubmit : { // 퀴즈응시 최종 결과제출 버튼 영역
        kind : 'box',
        style: {
            textAlign: 'center'
        },
        children: [
            {
                kind : 'button',
                className: 'quizbutton',
                text : '제출하기'
            }
        ]
    },
    tableFixedHeader: {
        kind : 'box',
        className: 'tableFH',
        children: [
            {
                kind: 'box',
                className: 'tblHeader',
                children: [
                    {
                        kind: 'table',
                        children: [
                            {
                                kind: 'thead',
                                children: [
                                    {
                                        kind: 'tr'
                                    }
                                ]  //tr, th
                            }
                        ]
                    }
                ]
            },
            {
                kind: 'box',
                className: 'tblContent',
                children: [
                    {
                        kind: 'table',
                        children: [
                            {
                                kind: 'tbody'  //tr, td
                            }
                        ]
                    }
                ]
            }
        ]
    },
    tableHorizontalVerticalHighlight : {
        kind : 'box',
        className: 'tableHVH',
        style: {
            marginTop: 10
        },
        children: [
            {
                kind : 'table',
                children: [
                    {
                        kind: 'thead' //tr
                    },
                    {
                        kind: 'tbody' //tr
                    }
                ]
            }
        ]
    },
    appBtn : {
        kind : 'input',
        type : 'submit',
        style : {
            fontSize: 14,
            background:'#3800A0',
            color:'white',
            border:0,
            borderRadius:5
        }
    },
    sub : {
        kind: 'sub'
    },
    sup : {
        kind: 'sup',
    },
    ending : {
        kind: 'box',
        style: {
            width: '100%',
            textAlign: 'center'
        },
        children: [
            {
                kind: 'box',
                className :"finishPattern",
                text : '수고하셨습니다.'
            }
        ]
    },
    cardBookCompleteBtn: {
        kind: 'box',
        className: 'cardBook_completeBtn',
        children: [
            {
                kind: 'box',
                text: '학습완료',
            },
            {
                kind: 'p',
                text: '* 버튼 클릭시, 학습완료로 체크되며, 메인페이지로 이동합니다.',
                style: {
                    marginTop: 5,
                    fontSize: 10,
                    color: 'aqua'
                }
            }
        ]
    },
    cardQuizConfirmBtn: {
        kind: 'box',
        className: 'cardBook_confirmBtn',
        children: [
            {
                kind: 'box',
                text: '확인',
            }
        ]
    },
    cardBookNextBtn : {
        kind : 'box',
        className: 'cardBook_pageNextBtn',
        children: [
            {
                kind: 'box',
                text: '계속하기',
            }
        ]
    },
    completeBtn : { //챕터학습완료 문구, 체크박스
        kind: 'box',
        className: 'clickRequired',
        onClick: e => {
            if(e.target.tagName == 'INPUT') {
                return;
            }
            else if(e.target.tagName != 'DIV') {
                $(e.target).parent().click();
                return;
            }
            $(e.target).find('input')[0].click();
            // if(location.pathname.includes('makeBook')) return;
        },
        children : [
            { 
                kind : 'text',
                text : '교재 학습이 완료되었습니다.',
                style: {
                    fontSize: 20,
                    color: 'gray'
                }
            },
            {
                kind : 'input',
                className: 'complete_check read_check',
                type : 'checkbox',
                style : {
                    zoom : 1.8,
                    marginLeft: 5
                }
            }
        ]
    },
    nextBtn : {
        kind: 'box',
        style: {
            width: '100%',
            padding: '0px 25px'
        },
        children: [
            {
                kind: 'button',
                className: 'pageMoveBtn',
                text: '< 이전',
                style: {
                    float: 'left',
                }
            },
            {
                kind: 'button',
                className: 'pageMoveBtn',
                text: '다음 >',
                style: {
                    float: 'right',
                }
            }
        ]
    },
    hideBox : {
        kind : 'box',
        className: 'hideb',
        children : [
            {
                kind: 'box',
                onClick: e => {
                    $(e.target).color('transparent');
                    $(e.target).addClass('checked');
                    if(bookReady) {
                        saveUserData(e.target);
                    }
                },
                style: {
                    width: 'auto',
                    background: '#001054',
                    color : '#001054',
                    margin: 10,
                    borderRadius: 10
                }
            }
        ]
    },
    imageBox : {
        kind: 'box',
        style: {
            width: '100%',
            textAlign: 'center',
            overflow: 'auto'
        },
        children: [
            {
                kind : 'img',
                className: 'lessonCompImg',
                style: {
                    height: 'auto'
                }
            }
        ]
    },
    slidePagenation : {
        kind: 'select',
        className: 'slidePagenation'
    },
    spreadsheetRunBox: {
        kind:'box',
        className: 'spreadsheetRun',
        children : [
            {
                kind: 'iframe',
                width: '100%',
            }
        ]
    },
    defaultRunBox: {
        kind: 'box',
        children: [
            {
                kind: 'iframe'
            }
        ]
    },
    outputWindow: {
        kind: 'box',
        className: 'outputWindow',
        children: [
            {
                kind: 'box',
                text: 'output',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                },
                children: [
                    {
                        kind:'span',
                        className: 'material-symbols-outlined',
                        text: 'replay',
                        style: {
                            color: 'white',
                            fontSize: 15,
                            margin: '3px 5px'
                        }
                    }
                ],
                onClick: 'showPythonResult' //재실행 버튼 
            },
            {
                kind: 'box',
                style: {
                    background: '#0D2A36',
                    color:'white',
                    padding: '0px 8px',
                    fontSize: 11,
                    fontFamily: 'monospace'
                }
            }
        ]
    },
    tabEditor : {
        kind : 'box',
        className:'lessonTabEditor',
        style: {
            width: '100%',
            marginTop: 10
        },
        children: [
            {
                kind: 'box', //제목영역
                onClick: 'toggleSwipeLock',
                children: [
                    {
                        kind:'span',
                        className: 'material-symbols-outlined',
                        text: 'lock',
                        style: {
                            color: '#648375',
                            float: 'right',
                            fontSize: 18,
                            margin: 3
                        }
                    }
                ]
            },
            {
                kind: 'AceEditor',
                className: 'tabEditor',
                options: {
                    theme: 'solarized_dark',//'mono_industrial',
                    fontFamily: 'Source Code Pro',
                    mode: 'python',
                    fontsize: 14,
                    selectionStyle: 'none',
                    maxLines: Infinity,
                },
                style: {
                    height: '100%',
                }
            },
            {
                kind: 'box',
                className: 'playCodeBox',
                children: [
                    {
                        kind: 'box', //gutter
                        style: {
                            width: 45,
                            height: '100%',
                            lineHeight: '20px',
                            textAlign: 'right',
                            paddingRight: 8,
                            background: '#11303D',
                            color: '#CCE2ED',
                            fontSize: 14
                        }
                    },
                    {
                        kind: 'box', // content
                        className:'playCode_content',
                    }
                ]
            }, 
            {
                kind : 'box',
                className: 'codeBtnBox off', //기본값은 감추기
                children: [
                    {
                        kind: 'box', //기능버튼
                        children: [
                            {
                                kind: 'span',
                                className: "material-symbols-outlined",
                                text: 'restart_alt',
                                onClick: 'resetTabEditor'
                            },
                            {
                                kind: 'span',
                                className: "material-symbols-outlined",
                                text: 'backspace',
                                onClick : 'backSpaceCode'
                            },
                            {
                                kind: 'span',
                                className: "material-symbols-outlined runCodeBlockBtn",
                                text: 'play_arrow',
                                onClick: 'resultByCodebtn'
                            }
                        ]
                    },
                    {
                        kind: 'box', //코드버튼
                    }
                ]
            }
        ]
    },
    codeBlock: {
        kind: 'box',
        className: 'codeBlock'
    },
    codeBtn:  {
        kind: 'box',
        className: 'codebtn',
        onClick : 'onSelectCodeBlock'
    },
    aceEditor : {
        kind : 'box',
        className:'lessonCompEditor',
        style: {
            width: '100%',
            height: '100%',//300,
            // borderRadius: 6,
            // overflow: 'hidden',
            padding: '10px 0px',
            background: '#282A35',
            marginTop: 10
        },
        children: [
            {
                kind: 'AceEditor',
                className: 'bookEditor',
                options: {
                    theme: 'dracula',
                    fontFamily: 'IBM Plex Mono',
                    mode: 'javascript',
                    fontsize: 20,
                    readOnly: true,
                    selectionStyle: 'none',
                    highlightActiveLine: 'false',
                    highlightSelectedWord: false,
                    highlightGutterLine: false
                },
                style: {
                    height: '100%',
                    padding: 10
                }
            },
            {
                kind: 'box',
                style: {
                    position: 'absolute',
                    // top: $('.bookEditor').top() + 30,
                    bottom : '-33px',
                    right: 5,
                    width: 96,
                    fontSize: 22
                },
                children: [
                    {
                        kind: 'box',
                        className: 'scaleBtn',
                        text: 'A',
                        onClick : e => { 
                            const curSize = $(e.target).parent().prev()[0].aceEditor.getFontSize();
                            $(e.target).parent().prev()[0].aceEditor.setFontSize(curSize+1);
                        }
                    },
                    {
                        kind: 'box',
                        text: 'A',
                        style: {fontSize: 15, paddingTop: 8},
                        className: 'scaleBtn',
                        onClick : e => { 
                            const curSize = $(e.target).parent().prev()[0].aceEditor.getFontSize();
                            $(e.target).parent().prev()[0].aceEditor.setFontSize(curSize-1);
                        }
                    }
                ]
            }
        ]
    },
    quizExample : { //보기 문항 클릭으로 체크.
        kind: 'box',
        className: 'quizExample',
        onClick: e => {
            if(e.target != e.currentTarget){
                e.currentTarget.click();
                return;
            }
            $(e.target).addClass('checked');
            $('.quizExample').not($(e.target)).removeClass("checked");
        },
        children: [
            {
                kind: 'box',
                style: {
                    width: 70
                }
            },
            {
                kind: 'box',
                style : {
                    width: 'calc(100% - 70px)',
                    textAlign: 'left',
                    color:'white',
                    wordBreak: 'keep-all'
                }
            }
        ]
    },
    quizResult: { //퀴즈 팝업에서 정답확인 표시창
        kind: 'box',
        children: [
            {
                kind: 'span',
                className: 'material-symbols-outlined',
                style: {
                    fontSize: 130,
                    paddingTop: 20,
                    fontWeight: 400
                }
            }
        ],
        style: {
            width: '100%',
            height: 200,
            position: 'absolute',
            left: 0,
            bottom: 0,
            textAlign: 'center',
            color: 'white',
            opacity: 0.7
        }
    },
    quiz : {
        kind: 'box',
        style: {
            height: 100,
            textAlign: 'center'
        },
        children: [
            {
                kind: 'button',
                className: 'quizbutton',
                text : 'Quiz', 
            },
            {
                kind: 'box',
                className : 'quizPopup',
                children: [
                    
                    {
                        kind: 'box',
                        className: 'quizpaper',
                        children: [
                            {
                                kind: 'box',
                                text : '1 / 6',
                                style: {
                                    width: 'auto',
                                    color: 'gray',
                                    display: 'block',
                                    textAlign: 'left'
                                }
                            },
                            {
                                kind: 'box', //문제
                                className: 'quizQuestion',
                                text : '문제는 무엇입니다. ',
                            },
                            {
                                kind: 'box', //객관식 보기문항
                                className: 'quizExamples',
                            },
                            {
                                kind: 'input', //주관식 입력
                                placeholder : '정답 입력',
                                style: {
                                    width: '80%',
                                    padding: 10,
                                    margin: 5,
                                    outline: 'none',
                                    fontSize: 30,
                                    textAlign: 'center'
                                }
                            },
                            {
                                kind: 'box',
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    height: 90
                                },
                                children: [
                                    {
                                        kind : 'button',
                                        className: 'quizCloseBtn',
                                        text : '닫기',
                                        onClick : e => {
                                            $('.quizPopup').removeClass('on');
                                            $('.lessonWindow')[0].style.paddingTop = '45px';
                                        },
                                    },
                                    {
                                        kind : 'button',
                                        className: 'quizSubmitBtn',
                                        text : '제출'
                                    },
                                    
                                ]
                            }
                            
                        ]
                    },
                    // {
                    //     kind: 'span',
                    //     className: 'material-symbols-outlined',
                    //     text: 'close',
                    //     onClick : e => {
                    //         $('.quizPopup').removeClass('on');
                    //         $('.lessonWindow')[0].style.paddingTop = '45px';
                    //     },
                    //     style: {
                    //         position: 'absolute',
                    //         right: 10,
                    //         fontSize: 40,
                    //         zIndex: 50,
                    //         cursor: 'pointer'
                    //     }
                    // },
                ]
            }
        ]
    }
}

