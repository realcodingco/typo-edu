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
                    textAlign: 'center'
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
            fontSize: 30,
            background: 'lightgray'
        }
    },
    stepStore: {
        kind: 'box',
        style: {
            width: '100%',
            height: 'calc(100% - 85px)',
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
                kind: 'h2', //타이틀
                text : '내 수강 목록',
                style: {
                    padding: 20
                }
            }
        ]
    },
    courseBox: {
        kind: 'box',
        children: [
            {
                kind: 'box',
                style: {
                    padding: '0px 10px',
                    borderBottom: '1px solid lightgray'
                },
                children: [
                    {
                        kind: 'span',
                        className : "material-symbols-outlined",
                        text: 'arrow_drop_down',
                    },
                    {
                        kind: 'box',
                        text: '그래머과정',
                        style: {
                            width: 'auto',
                            fontSize: 20,
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
                            borderRadius: 10,
                            padding: '0px 12px',
                            margin: '5px 5px 0px 5px'
                        }
                    },
                    {
                        kind: 'box', // 학습진행율
                        text: '진행율 30%',
                        style: {
                            width: 'auto',
                            fontSize: 12,
                            color: 'white',
                            background : '#004D80',
                            borderRadius: 10,
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
        style: {
            padding: 15,
            borderBottom: '1px dotted lightgray'
        },
        children: [
            {
                kind:'p',
                text: 'title'
            },
            {
                kind:'box',
                style: {
                    display:'flex',
                    width: '90%',
                    margin: '0px auto'
                },
                children: [
                    {
                        kind: 'span',
                        text:'0%',
                        width: 40
                    },
                    {
                        kind:'box',
                        style: {
                            background: '#f7f7f7',
                            height: 22,
                            borderLeft: 'calc(100% - 80%) solid red'
                        },
                        
                    }
                ]
            }
        ]
    }
}