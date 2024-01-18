const main = {
    bg : {
        kind: 'box',
        className: 'homeMainBg'
    },
    pad : {
        kind: 'box',
        className: 'homePad',
        children: [
            {
                kind: 'box',
                className: 'padBg'
            },
            {
                kind: 'box', //하단 바
                style : {
                    height: 50,
                    
                    // bottom : 0,
                    // left: 0,
                    background: 'black',
                    display: 'flex',
                }
            }
        ]
    },
    menuBtn : { // 하단 버튼
        kind: 'box',
        className: 'padBtn',
        children: [
            {
                kind:'span',
                className: 'material-symbols-outlined',
                style: {
                    width: '100%',
                    height: '100%',
                    fontSize : 30,
                    color: '#9B9FA5',
                    fontWeight: 400,
                    marginTop: 8,
                    cursor: 'pointer'
                }
            }
        ]
    
    },
    courseIcon : {
        kind: 'box',
        style: {
            width: '100%',
            margin: '20px auto',
            textAlign: 'center',
        },
        children: [
            {
                kind: 'box',
                text: '반갑습니다. 000 학습자님.',
                style: {
                    marginBottom: 10,
                    fontFamily:'"GmarketSans", sans-serif'
                }
            },
            {
                kind:'box',
                className : 'courseIcon',
            },
            {
                kind: 'box',
                style: {
                    width: '100%',
                    textAlign: 'center',
                    fontSize: 16,
                    color: '#0052A5',
                    marginTop: 15
                }
            },
            {
                kind: 'button',
                className: 'finalQuizBtn',
                html: 'Final Quiz<br><sub style="font-size:10px;color:#FFD870;">학습진도율 80%이상시 응시가능</sub>',
            }
        ]
        
    },
    stepIcon : {
        kind: 'box',
        className: 'stepIcon',
        onClick: e => {
            e.stopPropagation();
            $(e.target).parent().click();
        }
    },
    stepListTitle : {
        kind:'box',
        style: {
            width: '100%',
            padding: 15,
            fontSize: 16,
            background: 'lightgray'
        }
    },
    stepStore: {
        kind: 'box',
        className: 'stepStore',
    },
    stepBook : {
        kind: 'box',
        className: 'stepBook',
        children: [
            {
                kind: 'a'
            }
        ]
    },
    quizResultPop : {
        kind: 'box',
        className: 'popup-wrap',
        id : 'popup',
        children: [
            {
                kind: 'box',
                className: 'popup',
                children: [
                    {
                        kind: 'box',
                        className: 'popup-head',
                        children: [
                            {
                                kind:'span',
                                className:'head-title',
                                text: '수료'
                            }
                        ]
                    },
                    {
                        kind: 'box',
                        className: 'popup-body',
                        children: [
                            {
                                kind: 'box',
                                className: 'body-content'
                            }
                        ]
                    },
                    {
                        kind: 'box',
                        className: 'popup-foot',
                        onClick: e => {
                            $("#popup").fadeOut();
                        },
                        children: [
                            {
                                kind: 'span',
                                className: 'pop-btn confirm',
                                text: '확인'
                            }
                        ]
                    }
                ]
            }
        ]
    }
};
const myPage = {
    header: {
        kind : 'box',
        children: [
            {
                kind: 'box',
                style: {
                    background: '#FFF18E'
                },
                children: [
                    {
                        kind: 'h2', //타이틀
                        text : '학습 현황',
                        style: {
                            padding: '15px 0px 0px 20px',
                            width: 'auto',
                            display: 'inline-block'
                        }
                    },
                    {
                        kind: 'box',
                        style: {
                            width: 50,
                            height: 50,
                            background:'white',
                            borderRadius: 100,
                            float: 'right',
                            margin: 10,
                            overflow: 'hidden'
                        },
                        children: [
                            {
                                kind: 'img',
                                src: './lecture/2.svg',
                                style: {
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }
                            }
                        ]
                    },
                    {
                        kind: 'box',
                        className: 'lecNotice',
                        text: '',
                        style : {
                            position: 'absolute',
                            left : 0,
                            bottom: 1,
                            fontSize: 9,
                            paddingLeft: 10,
                            fontFamily: "'GmarketSans', sans-serif",
                            fontWeight: 400,
                            color: '#006D4A'
                        }
                    }
                ]
            }
        ]
    },
    courseListBox: {
        kind: 'box',
        className: 'myCourseListBox'
    },
    courseBox: {
        kind: 'box',
        className: 'myCourseBox',
        children: [
            {
                kind: 'box',
                style: {
                    padding: '6px 5px',
                    background: 'lightgray',
                    // display: 'flex',
                    // justifyContent: 'space-between',
                    // alignItems: 'center'
                },
                children: [
                    {
                        kind: 'span',
                        className : "material-symbols-outlined",
                        text: 'arrow_drop_down',
                    },
                    {
                        kind: 'box',
                        className: 'courseTitleText',
                        text: '과정명', //
                        style: {
                            width: 'calc(100% - 40px)',
                            fontSize: 16,
                            // marginRight:10,
                            whiteSpace: 'nowrap'
                        }
                    },
                    {
                        kind: 'box', // 남은 수강기간 d-day
                        className: 'deadline',
                        text : 'D-20',
                        style: {
                            width: 'auto',
                            fontSize: 12,
                            background: '#B7C9D5',
                            borderRadius: 6,
                            padding: '0px 8px',
                            // margin: '5px 0px 0px',
                            whiteSpace: 'nowrap',
                            float: 'right'
                        }
                    },
                    {
                        kind: 'box', // 학습진행율
                        className: 'totalProgress',
                        text: '진행율 30%',
                        style: {
                            width: 'auto',
                            fontSize: 12,
                            color: 'white',
                            background : '#7192AC',
                            borderRadius: 6,
                            padding: '0px 8px',
                            marginRight: 5,
                            // margin: '5px 5px 0px 5px',
                            whiteSpace: 'nowrap',
                            float: 'right'
                        }
                    }
                ]
            },
            {
                kind: 'box', //step리스트
                className: 'stepList'
            }
        ]
    },
    stepBox : {
        kind: 'box',
        className: 'stepBox',
        children: [
            {
                kind: 'box',
                children: [
                    {
                        kind:'p',
                        text: 'title',
                    },
                    // {
                    //     kind: 'a',
                    //     text : '학습하기',
                    //     className: 'studyBtn',
                    // }
                ]
            },
            {
                kind:'box',
                style: {
                    display:'flex',
                    width: '100%',
                    margin: '0px auto',
                    gap: '5px'
                },
                children: [
                    {
                        kind: 'span',
                        className: 'progressNumber',
                        text:'0%',
                        style: {
                            width: 50,
                            color: '#003887',
                            textAlign: 'center'
                        }
                    },
                    {
                        kind:'box',
                        style: {
                            background: '#f7f7f7',
                            height: 18,
                            marginTop: 2,
                            borderRadius: 8,
                            overflow: 'hidden',
                            width: 'calc(100% - 50px - 80px)'
                        },
                        children: [
                            {
                                kind: 'box',
                                className: 'progress',
                            }
                        ]
                    },
                    {
                        kind: 'a',
                        text : '학습하기',
                        className: 'studyBtn',
                    }
                ]
            }
        ]
    }
}