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
                    bottom : 0,
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
                // onClick: e => {
                //     e.stopPropagation();
                // },
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
            width: 150,
            margin: '20px 5px 20px 25px'
        },
        children: [
            {
                kind:'box',
                className : 'courseIcon'
            },
            {
                kind: 'box',
                style: {
                    width: 150,
                    textAlign: 'center',
                    fontSize:14,
                    lineHeight: '100%',
                    marginTop: 5
                }
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
            padding: 20,
            fontSize: 20,
            background: 'lightgray'
        }
    },
    stepStore: {
        kind: 'box',
        style: {
            width: '100%',
            height: 'calc(100% - 70px)',
            overflow: 'auto',
            textAlign: 'center',
            padding: '30px 0px'
        }
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
                            padding: '20px 0px 0px 20px',
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
                            // border: '1px solid lightgray',
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
                onClick: e => {
                    if(e.target != e.currentTarget) {
                        e.currentTarget.click();
                        return;
                    }
                     
                    $(e.target).next().slideToggle(500, () => {
                        const target = $(e.target).children()[0];
                        target.innerText = target.innerText == 'arrow_right' ? 'arrow_drop_down' : 'arrow_right';
                    });
                },
                style: {
                    padding: '6px 10px 0px 10px',
                    // borderBottom: '1px solid white',
                    background: 'lightgray'
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
                        text: '그래머과정', //
                        style: {
                            width: 'auto',
                            fontSize: 16,
                            marginRight:20
                        }
                    },
                    {
                        kind: 'box', // 남은 수강기간 d-day
                        text : 'D-20',
                        style: {
                            width: 'auto',
                            fontSize: 12,
                            background: '#B7C9D5',
                            borderRadius: 6,
                            padding: '0px 12px',
                            margin: '5px 5px 0px 5px'
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
                            padding: '0px 12px',
                            margin: '5px 5px 0px 5px'
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
                    {
                        kind: 'a',
                        text : '학습하기',
                        className: 'studyBtn',
                    }
                ]
            },
            {
                kind:'box',
                style: {
                    display:'flex',
                    width: '90%',
                    margin: '0px auto',
                    gap: '5px'
                },
                children: [
                    {
                        kind: 'span',
                        className: 'progressNumber',
                        text:'0%',
                        style: {
                            width: 40,
                            color: 'gray'
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
                            width: 'calc(100% - 50px)'
                        },
                        children: [
                            {
                                kind: 'box',
                                className: 'progress',
                            }
                        ]
                    }
                ]
            }
        ]
    }
}