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
    text : {
        kind : ''
    },
    check : {
        kind : 'box',
        onClick: e => {
            if(e.target.tagName == 'INPUT') {
                return;
            }
            else if(e.target.tagName != 'DIV') {
                $(e.target).parent().click();
                return;
            }
            $(e.target).find('input')[0].click();
            if(location.pathname.includes('makeBook')) return;
            if($(e.target).find('input').prop('checked') && bookReady){ 
                playSound('choice');
            }
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
                    }
                    else {

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
        kind: 'sup'
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
    nextBtn : {
        kind: 'box',
        style: {
            width: '100%',
            padding: '0px 45px'
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
                    saveUserData(e.target);
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
            widht: '100%',
            textAlign: 'center'
        },
        children: [
            {
                kind : 'img',
                style: {
                    height: 'auto'
                }
            }
        ]
    },
    aceEditor : {
        kind : 'box',
        style: {
            width: '95%',
            height: 300,
            borderRadius: 6,
            overflow: 'hidden',
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
                    fontSize: 30,
                    color:'white'
                }
            }
        ]
    },
    quizResult: { //정답제출 결과
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
                        kind: 'span',
                        className: 'material-symbols-outlined',
                        text: 'close',
                        onClick : e => {
                            $(e.target).parent().removeClass('on');
                        },
                        style: {
                            position: 'absolute',
                            right: 20,
                            margin: 10,
                            fontSize: 40,
                            zIndex: 11,
                            cursor: 'pointer'
                        }
                    },
                    {
                        kind: 'box',
                        className: 'quizpaper',
                        style: {
                            width: '100%',
                            height: '100%',
                            padding: 20,
                            textAlign: 'center',
                            fontFamily: 'IBM Plex Mono',
                            overflow: 'auto'
                        },
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
                                style: {
                                    width: '90%',
                                    padding: 20,
                                    color: 'white',
                                    fontSize: 35,
                                    textAlign: 'left'
                                }
                            },
                            {
                                kind: 'box', //객관식 보기문항
                                className: 'quizExamples',
                                style: {
                                    width: '80%',
                                    padding: 20,
                                    color: 'white',
                                    fontSize: 30,
                                    textAlign: 'left'
                                },
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
                                kind : 'button',
                                className: 'quizSubmitBtn',
                                text : '제출'
                            }
                        ]
                    }
                ]
            }
        ]
    }
}

