const admin = {
    head : {
        kind: 'box',
        className: 'pageHead',
        style: {
           background: 'lightgray',
           height: 50
        }
    },
    headTag: {
        kind: 'box',
        style: {
            height: 25,
            background: '#004942',
            padding: '1px 5px'
        },
        children: [
            {
                kind: 'span',
                text: 'ADMIN',
                style: {
                    float: 'left',
                    color:'white'
                }
            },
            {
                kind: 'span',
                className: 'headTag',
                style: {
                    float: 'right',
                    color: 'lightgray'
                }
            }
        ]
    },
    searchType: {
        kind: 'select',
        style: {
            margin: 10
        }
    },
    typeOption :{
        kind: 'option'
    },
    body : {
        kind :'box',
        style: {
            textAlign: 'center'
        }
    },
    input : {
        kind: 'form',
        style: {
            display: 'inline-block',
            width: 'auto',
            margin: 10
        },
        children: [
            {
                kind: 'input',
                style: {
                    marginRight: 10,
                    width: 180
                }
            },
            {
                kind: 'button',
                text: '조회'
            }
        ]
    },
    dataBox : {
        kind : 'box',
        style: {
            width: '95%',
            padding: 10,
            borderBottom: '1px dashed #D8CEA9',
            textAlign: 'left'
        },
        children: [
            {
                kind: 'box',
                children: [
                    {
                        kind: 'input',
                        type: 'checkbox',
                        className: 'selectmember',
                        style: {
                            scale: '1.5',
                            margin: 8
                        }
                    },
                    {
                        kind:'span',
                        className : 'userName',
                        style: {
                            margin: 5,
                            fontWeight: '500'
                        },
                    },
                    {
                        kind:'span',
                        className : 'userId',
                        style: {
                            margin: 5,
                            color: '#0A68FF'
                        },
                    }
                ]
            }
        ]
    },
    courseInfo : {
        kind: 'box',
        style: {
            marginTop: 10,
            fontSize: 14
        },
        children: [
            {
                kind: 'span',//crs
                style: {
                    margin: '0 10px',
                    background: 'gray',
                    color:'white',
                    padding: '2px 5px',
                    fontSize: 12
                }
            },
            {
                kind: 'span',//코스명
            },
            {
                kind: 'span', 
                text : '시작일 : ',
                style: {
                    color: '#762BD8',
                    fontSize: 12,
                    marginLeft: 10
                }
            },
            {
                kind: 'span', //edustart
                style: {
                    color: '#762BD8',
                    fontSize: 12
                }
            },
            {
                kind: 'span', //최초 접속
                style: {
                    color: 'gray',
                    fontSize: 10,
                    marginLeft: 12
                }
            },
            {
                kind: 'box',
                style: {
                    float: 'right',
                    width: 'auto',
                    display: 'flex'
                },
                children: [
                    {
                        kind: 'box',
                        text: '수업중',
                        className: 'studyStatus',
                    },
                    {
                        kind : 'button',
                        className: 'postResultBtn',
                        text: '결과전송',
                    }
                ]
            }
        ]
    },
    sendmailBtn: {
        kind: 'button',
        className: 'mailingBtn',
        text: 'Mail',
        style: {
            margin: '0 10px'
        }
    },
    excelfileBtn: {
        kind: 'button',
        className: 'excelfileBtn',
        text: 'Excel',
        style: {
            // position: 'absolute',
            // right: 10,
            // top: 10,
            display: 'none'
        }
    },
    progInfoBox : {
        kind:'box', //진도
        style: {
            width: '100%',
            background: '#BA99FF',
            padding: 10,
            height: 'auto',
            borderRadius: 5,
            margin: '6px auto',
            fontSize: 12,
            textAlign: 'center'
        }, 
        children: [
            {
                kind: 'box',
                style: {
                    marginBottom: 5,
                    fontSize:14,
                    background: 'white',
                    textAlign: 'left',
                    padding: 10
                },
                children: [
                    {
                        kind: 'span',
                        className: 'totalProgress',
                        text: '학습진도율',
                        style: {
                            margin: 10,
                            color: '#0068A5',
                            fontWeight: 500
                        }
                    },
                    {
                        kind : 'button',
                        text : '자세히',
                        onClick: e => {
                            const txt = e.target.innerText;
                            e.target.innerText = txt == '자세히' ? '닫기' : '자세히';
                            $($(e.target).parents()[1]).find('.progressList').toggle();
                        },
                        style: {
                            padding: 5,
                            border: 0,
                            borderRadius: 4,
                            float:'right'
                        }
                    },
                    {
                        kind : 'button',
                        text : '초기화',
                        style: {
                            padding: 5,
                            marginRight:10,
                            border: 0,
                            borderRadius: 4,
                            float:'right'
                        }
                    }
                ]
            },
            {
                kind: 'box',
                className: 'progressList',
                style: {
                    display: 'none',
                }
            }
        ]
    },
    quizInfoBox : {
        kind: 'box', //퀴즈
        style: {
            background: '#495FD8',
            padding: 10,
            borderRadius: 5,
            margin: '6px auto',
            fontSize: 12,
            textAlign: 'center'
        },
        children: [
            {
                kind: 'box',
                style: {
                    marginBottom: 5,
                    fontSize:14,
                    background: 'white',
                    textAlign: 'left',
                    padding: 10
                },
                children: [
                    {
                        kind: 'span',
                        className: 'finalScore',
                        text: '평가 점수',
                        style: {
                            margin: 10,
                            color: '#0068A5',
                            fontWeight: 500
                        }
                    },
                    {
                        kind : 'button',
                        text : '자세히',
                        onClick: e => {
                            const txt = e.target.innerText;
                            e.target.innerText = txt == '자세히' ? '닫기' : '자세히';
                            $($(e.target).parents()[1]).find('.solveList').toggle();
                        },
                        style: {
                            padding: 5,
                            border: 0,
                            borderRadius: 4,
                            float:'right'
                        }
                    },
                    {
                        kind : 'button',
                        text : '초기화',
                        style: {
                            padding: 5,
                            marginRight:10,
                            border: 0,
                            borderRadius: 4,
                            float:'right'
                        }
                    }
                ]
            },
            {
                kind: 'box',
                className: 'solveList',
                style: {
                    display: 'none',
                }
            }
        ]
    },
    solveUnit: { //
        kind:'box',
        className: 'solveUnit',
        style: {
            width: '100%',
        },
        children: [
            {
                kind : 'box',
                style: {
                    height: 30,
                    width: 30,
                    border: '1px solid #ADD3FF',
                    margin: 1,
                    color: '#ADD3FF',
                    padding: 5,
                    textAlign: 'center'
                }
            },
            {
                kind : 'box', //문제, 보기,
                className: 'previewQuestion',
                children: [
                    {
                        kind: 'box',
                    },
                    {
                        kind: 'box'
                    }
                ]
            },
            {
                kind : 'box',
                style: {
                    height: 30,
                    width: 50,
                    border: '1px solid #ADD3FF',
                    margin: 1,
                    background: '#ADD3FF',
                    padding: 5,
                    textAlign: 'center'
                }
            }
        ]
    },
    progressBar : {
        kind: 'box',
        className: 'progressBar',
        children: [
            {
                kind: 'box',
                style: {
                    textAlign: 'left',
                    width: 'calc(100% - 30px)'
                }
            },
            {
                kind: 'box',
                text: 'x',
                style: {
                    float: 'right',
                    width: 30,
                    height: 18
                }
                
            }
        ]
    },
    accessPopup: {
        kind: 'box',
        style: {
            width: '100%',
            height: '100%',
            position: 'fixed',
            left: 0, 
            top: 0,
            background: 'rgba(7,51,48,0.9)',
            textAlign: 'center',
            padding: '15px 30px'
        },
        children: [
            {
                kind: 'box',
                text : '관리자 페이지에 접속하시겠습니까?',
                style: {
                    width: '100%',
                    fontSize: 30,
                    margin: '20% 0 0 0',
                    // top: '25%',
                    color: 'white'
                },
            },
            {
                kind: 'p',
                text: '관리자 이메일로 접근코드가 발송됩니다',
                style: {
                    color:'#51FF9C',
                    fontSize: 16
                }
            },
            {
                kind: 'button',
                text: '접속하기',
                style: {
                    padding: '5px 20px',
                    marginTop: 20
                }
            },
            {
                kind: 'input',
                spellcheck: 'false',
                style: {
                    display: 'none',
                    margin: '20px auto',
                    padding: 10,
                    outline: 0,
                }
            }
        ]
    },
    mailingPopup : {
        kind: 'box',
        style: {
            width: '100%',
            height: '100%',
            position: 'fixed',
            left: 0, 
            top: 0,
            background: 'rgba(0,0,0,0.9)',
            textAlign: 'center',
            padding: '15px 30px'
        },
        children: [
            {
                kind: 'box',
                text: 'X',
                style: {
                    width: 'auto',
                    fontSize: 30,
                    margin: '0px 20px 0 0',
                    float: 'right',
                    color: 'white'
                },
                onClick: e => {
                    $(e.target).parent().remove();
                }
            },
            {
                kind: 'box',
                style: {
                    textAlign: 'left',
                    maxHeight: 80
                }
            },
            {
                kind:'box',
                style: {
                    position:'absolute',
                    width: 14,
                    height:14,
                    borderRadius: 100,
                    background: '#137F7A',
                    left: 30,
                    top: 120
                }
            },
            {
                kind: 'input',
                spellcheck: 'false',
                style: {
                    width: '80%',
                    height: 40,
                    padding: 20,
                    fontSize: 15,
                    marginTop: 10,
                    outline: 'none',
                    background: 'transparent',
                    border: '1px solid gray',
                    color:'#6AD0C6',
                }
            },
            {
                kind: 'textarea',
                spellcheck: 'false',
                style: {
                    width: '80%',
                    height: 380,
                    marginTop: 20,
                    fontSize: 15,
                    outline: 'none',
                    padding: 20,
                    background: 'transparent',
                    color:'#6AD0C6',
                    fontWeight: 100
                }
            },
            {
                kind:'box',
                children: [
                    {
                        kind:'button',
                        text:'전송',
                        style: {
                            padding: '5px 20px'
                        }
                    }
                ]
            }
        ]
    },
    mTag : {
        kind: 'box',
        className:'mTag'
    }
}