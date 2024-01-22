/**
 * 메인 화면 구성
 */
const learn = {
    consolewindow: {
        kind: 'box',
        id: 'console',
        className: 'consolewindow',
        onClick: e => {
            $(e.currentTarget).toggleClass('open');
        },
        text: '>>'
    },
    emulator : {
        kind: 'box',
        className: 'emulator',
        children: [
            {
                kind: 'box',
                children: [
                    {
                        kind: 'box',
                        className: 'appWindow',
                    },
                    {
                        kind: 'box',
                        className: 'nav-x',
                        style: {
                            display: 'none',
                            width: 1,
                            height: 10,
                            border: '0.6px solid red',
                            position: 'absolute',
                            left : 0,
                            top : -24
                        },
                        children: [
                            {
                                kind: 'box',
                                text: 'x : 0',
                                style: {
                                    width : 40,
                                    left: '-20px',
                                    top: '-20px',
                                    fontSize: 14,
                                    textAlign:'center'
                                }
                            }
                        ]
                    },
                    {
                        kind: 'box',
                        className: 'nav-y',
                        style: {
                            display: 'none',
                            width: 10,
                            height: 1,
                            border: '0.6px solid red',
                            position: 'absolute',
                            left : -24,
                            top : 0
                        },
                        children: [
                            {
                                kind: 'box',
                                text: 'y : 0',
                                style: {
                                    width : 40,
                                    left: '-30px',
                                    top: '-20px',
                                    fontSize: 14,
                                    textAlign:'center'
                                }
                            }
                        ]
                    },
                    
                ]
            },
            {
                kind: 'button',
                text: 'Back',
                onClick: e => {
                    if(e.target == e.currentTarget) {
                        $('.emulator').hide();
                    }
                },
            }
        ]
    },
    editor : {
        kind: 'box',
        className: 'editSection',
        children: [
            {
                kind:'box', //top
                children: [
                    {
                        kind:'span',
                        text: 'other_houses',
                        className: 'material-symbols-outlined homeicon',
                        onClick: e => {
                            const queryStr = `p_cpsubj=${crs}&p_userid=${mid}&edustart=${crsStart}&bid=${groupId}`;
                            location.href = `index.html?eq=${btoa(queryStr)}`;
                        }
                    },
                    {
                        kind: 'box',
                        className: 'appTitle',
                        contenteditable : 'true',
                        spellCheck: 'false',
                        text: 'no title',
                        style: {
                            width: 'auto',
                            height: 'auto',
                            color: 'white',
                            fontSize: 25,
                            marginTop: 5
                        }
                    },
                    { //
                        kind: 'box',
                        className:'typingCount',
                        style: {
                            width:'auto',
                            marginLeft: 13,
                            marginTop: 8,
                            fontSize: 8,
                            color: '#FFF899',
                            padding: '2px 10px',
                            borderRadius: 8,
                            fontFamily: "'GmarketSans', sans-serif",
                            fontWeight: 100
                        }
                    },
                    {
                        kind: 'box',
                        className: 'fn-btn',
                        children: [
                            {
                                kind: 'box',
                                style: {display: 'none'},
                                children: [
                                    {
                                        kind: 'span',
                                        className: 'material-symbols-outlined',
                                        text: 'restart_alt'
                                    },
                                    {
                                        kind: 'p',
                                        text: '리셋'
                                    }
                                ]
                            },
                            {
                                kind: 'box',
                                // onClick: 'runApp',
                                children: [
                                    {
                                        kind: 'span',
                                        className: 'material-symbols-outlined',
                                        text: 'play_arrow',
                                    },
                                    {
                                        kind: 'p',
                                        text: '실행'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                kind: 'AceEditor',
                className: 'aceEditor',
                options: {
                    theme: 'chaos',//'dracula',
                    fontFamily : 'IBM Plex Mono',//'PT mono',
                    fontsize: 20,
                    cursorStyle: 'smooth',
                    maxLines: Infinity,
                }
            },
            {
                kind: 'box',
                style: {
                    position: 'absolute',
                    top: $('.aceEditor').top() + 30,
                    right: 0,
                    width: 96,
                    fontSize: 22
                },
                children: [
                    {
                        kind: 'box',
                        className: 'scaleBtn',
                        text: 'A',
                        onClick : e => {
                            const curSize = $('.aceEditor')[0].aceEditor.getFontSize();
                            $('.aceEditor')[0].aceEditor.setFontSize(curSize+1);
                        }
                    },
                    {
                        kind: 'box',
                        html: '<font size=3>A</font>',
                        className: 'scaleBtn',
                        onClick : e => {
                            const curSize = $('.aceEditor')[0].aceEditor.getFontSize();
                            $('.aceEditor')[0].aceEditor.setFontSize(curSize-1);
                        }
                    }
                ]
            },
            {
                kind: 'button',
                className: 'autoCodeBtn',
                text: 'Auto',
                style: {
                    position: 'absolute',
                    right: 10,
                    bottom: 10
                },
                onClick : e => { //오토코드 입력 기능
                    const targetId = e.target.dataset.id;
                    if(targetId) {
                        const autoCode = JSON.parse(localStorage.getItem('autos'))[targetId];
                        $('.editSection .aceEditor')[0].aceEditor.setValue(autoCode);
                    }
                }
            }
        ]
    },
    quizGuide: {
        kind: 'box',
        className: 'quizGuidePop',
        children: [
            {
                kind: 'h2',
                html:'퀴즈 응시 안내<br>',
            },
            {
                kind: 'box',
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    margin: '30px 0',
                    flexWrap: 'wrap',
                    width: '100%'
                },
                children: [
                    {
                        kind: 'box',
                        text: '• 문제구성 : 객관식 20문항',
                        style: {
                            flex: 1
                        }
                    },
                    {
                        kind: 'box',
                        text: '• 응시시간 : 총 60분',
                        style: {
                            flex: 1
                        }
                    }
                ]
            },
            {
                kind: 'box',
                text: '- 유의 사항 -',
                style: {
                    fontWeight: 300,
                    margin: '20px 0px'
                }
            },
            {
                kind: 'box',
                style: {
                    textAlign: 'left',
                    width: 'auto',
                    margin: '30px auto'
                },
                children: [
                    {
                        kind: 'p',
                        html: '• 응시 기회는 <font color=#2DD8FF>단 1회</font>로, 최종제출 후에는 어떠한 경우라도 재응시 할 수 없습니다.'
                    },
                    {
                        kind: 'p',
                        text: '• 학습기간 내에 원하는 시간에 응시할 수 있습니다.'
                    },
                    {
                        kind: 'p',
                        html: '• 응시 제한 시간은 <font color=#2DD8FF>초기 열람 시간을 기준으로 60분</font>이며, 응시 중 제한시간이 초과되거나 학습종료일 자정이 되면 자동으로 제출됩니다.'
                    },
                    {
                        kind : 'p',
                        html: '• 응시 페이지를 벗어나거나 비정상 종료되었더라도 제한시간이 남아 있다면 재입장 및 계속 응시가 가능합니다.'
                    },
                    {
                        kind : 'p',
                        html : '• 모든 문제의 풀이를 마친 후, 페이지 하단 <font color = yellowgreen>"제출하기" 녹색 버튼을 클릭</font>해야 최종 제출이 완료됩니다.'
                    },
                    {
                        kind : 'p',
                        html : '• 아래의 <font color=#2DD8FF>시작하기</font>를 클릭하면 퀴즈 응시가 시작되며, 제한시간 타이머가 작동합니다.'
                    },
                ]
            },
            {
                kind: 'box',
                style: {
                    width: '100%'
                },
                children: [
                    {
                        kind : 'button',
                        text : '시작하기',
                        style: {
                            background: '#2DD8FF',
                            border: 0,
                            borderRadius: 8,
                            padding: '10px 50px',
                            marginTop: 20
                        }
                    }
                ]
            }
        ]
        
    },
    quizWindow : {
        kind: 'box',
        className: 'quizWindow',
        oncopy: 'return false', // 복사 금지
        children: [
            {
                kind: 'box', //타이머
                className:'timerDisplay',
                // text : '60:00',
            },
            {
                kind: 'box',
                className: 'quizTimer',
            },
            {
                kind: 'box',
                className: 'quizPaper',// 문제출력
            },
            {
                kind: 'span',
                text: 'keyboard_double_arrow_up',
                className: 'material-symbols-outlined',
                onClick: e => {
                    $(e.target).prev().scrollTop({top: '0px', behavior: 'smooth'});
                },
                style: {
                    position: 'absolute',
                    right: 20,
                    bottom: 60,
                    color:'gray'
                }
            },
            {
                kind : 'box',
                className: 'bookHeader',
                children: [
                    {
                        kind: 'box',
                        style: {
                            width: 'auto',
                            zIndex: 10
                        },
                        children: [
                            {
                                kind: 'span',
                                className: 'material-symbols-outlined listbtn',
                                text : 'apps',
                                children: [
                                    {
                                        kind: 'span',
                                        className: 'tooltipText',
                                        text: '이전으로 돌아가기'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        kind:'box',
                        // className: 'bookNav',
                        text : '문제에서 정답에 해당하는 보기문항을 클릭하세요.',
                        style:{
                            width: 'auto',
                            fontSize: 12,
                            fontWeight: 300,
                            padding: 10,
                            // textAlign: 'left',
                            color: '#C90043'
                        }
                    }
                ]
            }
        ]
    },
    lessonWindow: {
        kind: 'box',
        className: 'lessonWindow', 
        oncopy: 'return false', // 교재내용 복사 금지
        children: [
            {
                kind: 'span',
                text: 'fullscreen_exit',
                className: 'material-symbols-outlined',
                onClick: e => {
                    $('.lessonBook')[0].style.overflowY = 'auto';
                    if(e.target.innerText == 'fullscreen') {
                        e.target.innerText = 'fullscreen_exit';
                    } else  {
                        e.target.innerText = 'fullscreen';
                    }   
                    $(e.target).parent().toggleClass('half');
                    const checked = $('input[name="read_check"]:checked');
                    const lastCheckbox = checked[checked.length-1];
                    if(lastCheckbox) {
                        setTimeout(() => {
                            lastCheckbox.scrollIntoView({block:'center'});
                        }, 200);
                    }
                    
                },
                style: {
                    position: 'absolute',
                    top: 50,
                    right: 20,
                    color:'rgba(128,128,128,0.1)',
                    zIndex: 11
                }
            },
            {
                kind: 'box',
                className: 'lessonBook',
            },
            {
                kind: 'span', // 탑버튼
                text: 'keyboard_double_arrow_up',
                className: 'material-symbols-outlined pageTopBtn',
                onClick: e => {
                    $(e.target).prev().scrollTop({top: '0px', behavior: 'smooth'});
                },
                style: {
                    position: 'absolute',
                    right: 20,
                    bottom: 60,
                    color:'gray',
                }
            },
            {
                kind : 'box',
                className: 'bookHeader',
                children: [
                    {
                        kind: 'box',
                        style: {
                            width: 36,
                            float: 'left'
                        },
                        children: [
                            {
                                kind: 'span',
                                className: 'material-symbols-outlined listbtn',
                                text : 'apps',
                                onClick: e => {   
                                    const queryStr = `p_cpsubj=${crs}&p_userid=${mid}&edustart=${crsStart}&bid=${groupId}`;
                                    location.href = `index.html?eq=${btoa(queryStr)}#list`;
                                },
                                children: [
                                    {
                                        kind: 'span',
                                        className: 'tooltipText',
                                        text: '교재 리스트로 돌아가기'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        kind:'box',
                        className: 'bookNav',
                    }
                ]
            }
        ]
    },
    loading : {
        kind: 'box',
        style: {
            width: '100%',
            height: '100% ',
            position: 'fixed',
            left: 0,
            top: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 100
        },

        children: [
            {
                kind: 'box',
                id: 'loading_container',
                children: [
                    {
                        kind: 'box',
                        id: 'loading_dot',
                        text: '^^'
                    },
                    {
                        kind: 'box',
                        className: 'loading_stair',
                        id: 'loading_s1'
                    },
                    {
                        kind: 'box',
                        className: 'loading_stair',
                        id: 'loading_s2'
                    },
                    {
                        kind: 'box',
                        className: 'loading_stair',
                        id: 'loading_s3'
                    }
                ]
            }
        ]
    },
    navLabel : {
        kind: 'label',
        className: 'navLabel',
    },
    wheelTabBtn : {
        kind: 'box',
        className: 'wheelTabBox',
        children : [
            {
                kind: 'box',
                className: 'wheelTabBtn',
                id: 'tabUP',
                text: '▲',
            },
            {
                kind: 'box',
                className: 'wheelTabBtn',
                id: 'tabDOWN',
                text: '▼',
            }
        ]
    }
}
const learnWindow = {
    main : {
        kind: 'box',
        children: [
            {
                kind: 'box',
                className: 'roomBg',
                children: [
                    learn.editor,
                    learn.emulator
                ],
            },
            learn.consolewindow,
        ]
    }
}