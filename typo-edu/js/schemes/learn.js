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
                style : {
                    width: 380,
                    height: 580,
                    border: '14px solid', //#584A52
                    borderRadius: 10,
                    margin: '30px 20px 0px 50px'
                },
                children: [
                    {
                        kind: 'box',
                        className: 'appWindow',
                        style : {
                            width: 362-10,//302,
                            height: 563-11,//502,
                            background: 'white',
                            border: 0,
                            overflow: 'auto',
                            textAlign:'center',
                            backgroundImage: "url('./lecture/ci.png')",
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center'
                        },
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
                            location.href = `index.html?mid=${mid}`;
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
                            color: 'white',//'#61D836',
                            // background: 'white',
                            fontSize: 25,
                            marginTop: 5
                        }
                    },
                    {
                        kind: 'box',
                        className: 'fn-btn',
                        children: [
                            // {
                            //     kind: 'box',
                            //     children: [
                            //         {
                            //             kind: 'span',
                            //             className: 'material-symbols-outlined',
                            //             text: 'share',
                            //             children: [
                                            
                            //             ]
                            //         },
                            //         {
                            //             kind: 'p',
                            //             text: '공유'
                            //         }
                            //     ]
                                
                            // },
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
                    maxLines: Infinity
                },
            },
            {
                kind: 'box', //가이드 카드
                style: {
                    display: 'none'
                },
                children: [
                    {
                        kind:'box',
                        style: {
                            width: 20,
                            height: 18,
                            // background: 'white',
                            marginLeft: 35,
                            borderLeft : '12px solid transparent',
                            borderBottom: '18px solid white',
                            borderRight : '12px solid transparent',
                        }
                    },
                    {
                        kind:'box',
                        className: 'codingCard',
                        style: {
                            background: 'white',
                            width: 'calc(100% - 20px)',
                            borderRadius: 10,
                            height : 'auto',
                            margin: '-6px 10px 0px 10px',
                            padding: 10,
                            textAlign: 'center',
                        },
                    }

                ]
            }
        ]
    },
    lessonWindow: {
        kine: 'box',
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
                    top: 10,
                    right: 10,
                    color:'gray',
                    zIndex: 3
                }
            },
            {
                kind: 'box',
                className: 'lessonBook',
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
                        },
                        children: [
                            {
                                kind: 'span',
                                className: 'material-symbols-outlined listbtn',
                                text : 'apps',
                                onClick: e => {
                                    const course = new URLSearchParams(location.search).get("course");
                                    location.href = `index.html?mid=${mid}#${course}`;
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
            background: 'rgba(0,0,0,0.7)'
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
                ]
            },
            learn.consolewindow,
        ]
    }
}