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
    excelfileBtn: {
        kind: 'button',
        className: 'excelfileBtn',
        text: 'Excel',
        style: {
            position: 'absolute',
            right: 10,
            top: 10,
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
    solveUnit: {
        kind:'box',
        className: 'solveUnit',
        style: {
            // display: 'flex',
            width: '50%',
            // background: 'rgba(231,214,255,1)'
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
                kind : 'box',
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
    }
}