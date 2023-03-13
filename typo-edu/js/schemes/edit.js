// 교재 편집을 위한 입력 폼 컴포넌트 스킴
const edit = {
    popupSettingCourse:  { //코스관리 팝업
        kind: 'box',
        className: 'makerPopup',
        children:[
            {
                kind: 'box',
                children: [
                    {
                        kind: 'span',
                        className: 'material-symbols-outlined',
                        text :'close',
                        onClick: e => {
                            $('.makerPopup').remove();
                        },
                        style: {
                            color: 'black',
                            fontSize: 22,
                            verticalAlign: 'middle',
                            position: 'absolute',
                            right: 10,
                            top: 10
                        }
                    },
                    {
                        kind: 'box',
                        html: '새로운 코스(교육과정)를 만들거나 코스별 교재 관리를 할 수 있습니다.<br>코스에서 사용할 교재를 왼쪽에서 선택(클릭 or 드래그, ctrl키로 복수 선택 가능) 후, 화살표를 클릭하면 코스 목록에 추가됩니다.<br>코스 목록의 교재항목을 드래그해 순서를 변경할 수 있습니다.',
                        style: {
                            fontSize: 10,
                            color: '#D85B69',
                            marginBottom: 20
                        }
                    },
                    {
                        kind: 'select',
                        id: 'courseSelect',
                        onChange: 'loadCourse',
                        style: {
                            padding: 8,
                            width: '50%'
                        },
                        children: [
                            {
                                kind: 'option',
                                html : '코스 선택',
                                value: 'none'
                            },
                            {
                                kind: 'option',
                                html : '코스 생성',
                                value: 'new'
                            }
                        ]
                    },
                    {
                        kind: 'box',
                        style: {
                            marginTop: 10,
                            textAlign:'center'
                        },
                        children: [
                            {
                                kind: 'label',
                                text: '코스명'
                            },
                            {
                                kind: 'input',
                                style: {
                                    margin: 10,
                                    width: 400,
                                    padding: 8
                                }
                            }
                        ]
                    },
                    {
                        kind: 'box',
                        className: 'bookEditTable',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            marginTop: 20,
                            justifyContent: 'center',
                            height: '50%'
                        },
                        children: [
                            {
                                kind:'ul', // 전체 교재 리스트
                                text : '전체 교재 리스트',
                                id: 'totalBookList',
                                style: {
                                    width: '40%',
                                    height: '100%',
                                    background:'#E0F5FF',
                                    // color: 'blue',
                                    overflow: 'auto',
                                    padding: 5,
                                    textAlign: 'center'
                                },
                                children: [
                                ]
                            },
                            {
                                kind:'box',
                                id : 'selectArrow',
                                text: '➡︎',
                                style: {
                                    width: '10%',
                                    textAlign: 'center',
                                    fontSize: 60,
                                    color: 'gray'
                                }
                            },
                            {
                                kind:'ul', // 코스 교재 리스트
                                text : '코스 교재 리스트',
                                id :'sortable',
                                style: {
                                    width: '40%',
                                    height: '100%',
                                    background:'#E0F5FF',
                                    overflow: 'auto',
                                    color: 'blue',
                                    padding : 5,
                                    textAlign: 'center'
                                }
                            }
                        ]
                    },
                    {
                        kind : 'button',
                        text: '저장',
                        style: {
                            margin: 5,
                            padding: '2px 15px',
                            border: 0,
                            borderRadius: 3,
                            float: 'right',
                            background: '#879600',
                            color: 'white'
                        }
                    }
                ]
            }
            
        ]
    },
    bookbox : {
        kind: 'li',
        className: 'bookbox',
    },
    bookSortBox : {
        kind: 'box',
        style: {
            display: 'flex'
        },
        children: [
            {
                kind:'span',
                className: 'material-symbols-outlined',
                onClick : e => {
                    $(e.target).parent().remove();
                },
                text : 'delete',
                style: {
                    fontSize: 20,
                    color: 'gray',
                    margin: 2,
                }
            }
        ]
    },
    popupSettingBook:  { // 교재제작도구 셋팅 팝업상자
        kind: 'box',
        className: 'makerPopup',
        children: [
            {
                kind: 'box',
                children: [
                    {
                        kind: 'span',
                        className: 'material-symbols-outlined',
                        text :'close',
                        onClick: e => {
                            $('.makerPopup').remove();
                        },
                        style: {
                            color: 'black',
                            fontSize: 22,
                            verticalAlign: 'middle',
                            position: 'absolute',
                            right: 10,
                            top: 10
                        }
                    },
                    {
                        kind: 'box',
                        html: '교재 및 페이지의 제목 수정, 삭제할 수 있습니다.<br>페이지 순서는 페이지 라인을 드래그로 변경할 수 있습니다.<br>새로운 교재, 페이지 생성은 메인 페이지 상단 버튼으로 할 수 있습니다.',
                        style: {
                            fontSize: 10,
                            color: '#D85B69',
                            marginBottom: 20
                        }
                    },
                    {
                        kind: 'box',
                        className: 'setIcon',
                        style: {
                        },
                        children:[
                            {
                                kind: 'img',
                                style: {
                                    width: 70,
                                    height: 70,
                                    margin: 10,
                                    borderRadius: 10,
                                    border: '1px solid lightgray',
                                    background: 'white'
                                }
                            },
                            {
                                kind : 'input',
                                name: 'icon',
                                spellcheck: 'false',
                                onChange: e => {
                                    $(e.target).prev()[0].src = `./image/${e.target.value}`;
                                },
                                placeholder: '이미지경로',
                                style: {
                                    width: 'calc(100% - 120px)',
                                    marginTop: 30
                                }
                            }
                        ]
                    },
                    {
                        kind: 'box',
                        className: 'settingBook',
                        text : '교재명',
                        style: {
                        }
                    },
                    {
                        kind: 'box',
                        className: 'settingPageList',
                        text : '페이지 구성',
                        style: {
                            marginTop: 10
                        }
                    },
                    {
                        kind: 'box', //settingBtn
                        style: {
                            marginTop: 20,
                            textAlign: 'center'
                        },
                        children: [
                            {
                                kind: 'button',
                                text: '교재 삭제',
                                onClick: 'deleteBook',
                                style: {
                                    margin: 5,
                                    padding: '2px 15px',
                                    border: 0,
                                    borderRadius: 3,
                                    float:'left',
                                    background: '#879600',
                                    color: 'white'
                                }
                            },
                            {
                                kind: 'button',
                                text: '저장',
                                onClick: 'saveBookSettingData',
                                style: {
                                    margin: 5,
                                    padding: '2px 15px',
                                    border: 0,
                                    borderRadius: 3,
                                    float: 'right',
                                    background: '#879600',
                                    color: 'white'
                                }
                            }
                        ]
                    }
                ]
            },
        ]
    },
    settingForm : { // 설정 팝업에서 교재, 페이지 수정을 위한 입력 폼
        kind : 'box',
        style: {
            textAlign: 'center',
        },
        children: [
            {
                kind: 'box',
                style: {
                    width: 80,
                    fontSize: 12,
                    marginTop: 10,
                    color: 'gray'
                }
            },
            {
                kind: 'input',
                spellcheck : 'false',
                name: '',
                placeholder: '',
                style: {
                    width: 'calc(100% - 200px)',
                    margin: 5,
                    outline: 'none',
                }
            },
            {
                kind: 'span',
                className: 'material-symbols-outlined',
                text :'delete',
                onClick: e => {
                    const pageId = $(e.target).prev()[0].name;
                    deletePage(pageId);
                },
                style: {
                    color: 'black',
                    fontSize: 22,
                    verticalAlign: 'middle'
                }
            }
        ]
    },
    header : { // 교재제작도구 헤더 : 교재, 페이지 선택상자
        kind: 'box',
        style : {
            width:'100%',
            height: 40,
            borderBottom: '1px solid gray',
            fontFamily: 'ChosunSg',
            fontSize: 14,
            paddingTop: 4
        },
        children: [
            {
                kind: 'box',
                text: '코스관리',
                onClick: 'manageCourse',
                style: {
                    position: 'absolute',
                    left: 5,
                    top: 0,
                    width: 'auto',
                    height: 'auto',
                    fontSize: 10,
                    padding: '2px 10px',
                    borderRadius: '0px 0px 10px 10px',
                    background: 'gray',
                    color: 'white'
                }
            },
            {
                kind: 'span',
                className: 'material-symbols-outlined settingsBtn',
                text: 'settings',
                onClick: 'manageBook',
                style: {
                    color : '#00BA98',
                    width: 'auto',
                    marginTop: 3,
                    display: 'none'
                }
            },
            {
                kind: 'box',
                style: {
                    width: '40%',
                    borderRight: '1px solid lightgray'
                },
                children: [
                    {
                        kind: 'button',
                        text: 'New Book',
                        onClick : 'createBook',
                        style: {
                            margin: 5,
                            padding: '0px 18px',
                            border: 0,
                            borderRadius: 3
                        }
                    },
                    {
                        kind: 'select',
                        id: 'bookSelect',
                        onChange : 'loadPage',
                        style: {
                            width: '70%',
                            padding: 5
                        },
                        children: [
                            {
                                kind: 'option',
                                html: '교재 선택',
                                value : 'none',
                            },
                        ]
                    }
                ]
            },
            {
                kind: 'box',
                style: {
                    width: '40%'
                },
                children: [
                    {
                        kind: 'button',
                        text: 'New Page',
                        onClick : 'createPage',
                        style: {
                            margin: 5,
                            padding: '0px 18px',
                            border: 0,
                            borderRadius: 3
                        }
                    },
                    {
                        kind: 'select',
                        id: 'pageSelect',
                        onChange : 'loadContents',
                        style: {
                            width: '70%',
                            padding: 5
                            // border: 'none',
                        },
                        children: [
                            {
                                kind: 'option',
                                html: '페이지 선택',
                                value : 'none'
                            },
                        ]
                    }
                ]
            },
            {
                kind : 'box',
                style: {
                    width: 'auto'
                },
                children: [
                    {
                        kind: 'button',
                        className : 'savePageButton',
                        onClick : 'savePageData',
                        text : '저장',
                        style: {
                            margin: '4px 5px',
                            border: 0,
                            borderRadius: 3,
                            background: '#00BA98',
                            color: 'white',
                            display: 'none'
                        }
                    }
                ]
            },
            {
                kind: 'span', // 스타일 즐겨찾기 아이콘
                className: 'material-symbols-outlined',
                text: 'star',
                onClick: e => $('.styleFavorite').toggle(),
                style: {
                    color : '#00BA98',
                    width: 'auto',
                    margin: 3,
                    float: 'right'
                }
            },
        ]
    },
    styleUnit: {
        kind:'box',
        style: {
            padding: 5
        }
    },
    styleFavorite : {
        kind: 'box',
        className : 'styleFavorite',
        style: {
            position: 'absolute',
            width: 300,
            height: 350,
            top: 40,
            right: 0,
            border: '1px solid',
            borderRadius: 8,
            background : '#00BA98',
            margin: 3,
            float: 'right',
            zIndex: 10,
            display: 'none'
        },
        children: [
            {
                kind: 'box',
                text : '스타일 즐겨찾기',
                style : {
                    height: '90%',
                    color:'white'
                },
                children: [
                    {
                        kind:'box',
                        class: 'favoriteList',
                        style: {
                            padding: 5,
                            background: 'white',
                            color: 'black',
                            height: '90%'
                        }
                    }
                ]

            },
            {
                kind: 'box',
                style : {
                    height: '10%'
                },
                children: [
                    {
                        kind: 'input',
                        class : 'styleText',
                        width: '80%'
                    },
                    {
                        kind: 'button',
                        text: '등록',
                        onClick: e => {
                            let style = document.querySelector('.styleText').value;
                            
                            if(style) {
                                favoriteStyle.push(style);
                                localStorage.setItem('style', JSON.stringify(favoriteStyle));
                                // 리스트에 추가
                                appendStyleUnit(style);
                                document.querySelector('.styleText').value = '';
                            }
                        },
                        style:{
                            marginLeft: 5,
                            borderRadius:5,
                            border: 0
                        }
                    }
                ]
            }
        ]
    },
    compSelect : { //교재제작 컴포넌트 유형 선택, 컨텐츠 리스트로 추가 버튼
        kind: 'box',
        children : [
            {
                kind: 'input',
                name : 'order',
                placeholder: '순서',
                style: {
                    width: 40,
                    height: 26,
                    margin: '10px 5px',
                    float: 'left',
                    textAlign: 'center',
                    border: 0,
                    borderRadius: 5,
                    outline: 'none'
                }
            },
            {
                kind: 'select',
                id: 'typeSelect',
                // onChange : 'loadEditTool',
                style: {
                    margin: '10px 5px',
                    float: 'left',
                    padding: 5,
                    border: 'none',
                    borderRadius: 5
                },
                children: [
                    {
                        kind: 'option',
                        html: '유형 선택',
                        value : 'none'
                    },
                    {
                        kind: 'option',
                        html: '제목',
                        value : 'title'
                    },
                    {
                        kind: 'option',
                        html: '체크박스',
                        value : 'check'
                    },
                    {
                        kind: 'option',
                        html: '퀴즈',
                        value : 'quiz'
                    },
                    {
                        kind: 'option',
                        html: '글상자',
                        value : 'text'
                    },
                    {
                        kind: 'option',
                        html: '위첨자',
                        value : 'sup'
                    },
                    {
                        kind: 'option',
                        html: '아래첨자',
                        value : 'sub'
                    },
                    {
                        kind: 'option',
                        html: '문단',
                        value : 'par'
                    },
                    {
                        kind: 'option',
                        html: '링크',
                        value : 'link'
                    },
                    {
                        kind: 'option',
                        html: '코드상자',
                        value : 'codeBox'
                    },
                    {
                        kind: 'option',
                        html: '코드에디터',
                        value: 'aceEditor'
                    },
                    {
                        kind: 'option',
                        html: '지시문',
                        value : 'direction'
                    },
                    {
                        kind: 'option',
                        html: '실습지시문',
                        value : 'practiceDirection'
                    }, 
                    {
                        kind: 'option',
                        html: '포스트잇',
                        value : 'postit'
                    }, 
                    // {
                    //     kind: 'option',
                    //     html: '표',
                    //     value : 'table'
                    // },
                    {
                        kind: 'option',
                        html: '표(헤드고정)',
                        value : 'tableFH'
                    },
                    {
                        kind: 'option',
                        html: '표(균등분할)',
                        value : 'tableHVH'
                    },
                    {
                        kind: 'option',
                        html: '앱보기 버튼',
                        value : 'appBtn'
                    },
                    {
                        kind: 'option',
                        html: '이미지',
                        value : 'image'
                    },
                    {
                        kind: 'option',
                        html: '스크래치박스',
                        value : 'hidebox'
                    },
                    {
                        kind: 'option',
                        html: '엔딩 배너',
                        value : 'ending'
                    }
                ]
            },
            {
                kind: 'input',
                name: 'enter',
                placeholder: '줄간격',
                style: {
                    width: 50,
                    height: 26,
                    margin: '10px 5px',
                    float: 'left',
                    textAlign: 'center',
                    border: 0,
                    borderRadius: 5,
                    outline: 'none'
                }
            },
            {
                kind: 'button',
                className: 'plusCompBtn',
                // onClick: 'addCompToPreview',
                text : '추가',
                style: {
                    margin: '10px 5px',
                    float: 'right',
                    padding: '2px 10px',
                    border: 0,
                    borderRadius: 3
                },
            },
            {
                kind: 'button',
                className: 'delCompBtn',
                onClick: 'deleteContent',
                text : '삭제',
                style: {
                    display: 'none',
                    margin: '10px 5px',
                    float: 'right',
                    padding: '2px 10px',
                    border: 0,
                    borderRadius: 3
                },
            }
        ]
    },
    edit : { //텍스트 기본 입력상자
        kind: 'textarea',
        name: 'text',
        placeholder: '텍스트 입력',
        spellcheck: 'false',
        style: {
            width: '95%',
            height: 70,
            margin: '5px auto',
            padding: 5,
            outline: 'none'
        }
    },
    progressId :  { //진도기록을 위한 id 상자
        kind : 'input',
        name : 'id',
        readonly: 'true',
        className: 'progressIdbox',
        placeholder: '진도기록을 위한 id',
        style: {
            width: '90%',
            margin: 5,
            outline: 'none'
        }
    },
    codeId : { // 학습자 입력 코드 기록을 위한 id 상자
        kind : 'input',
        name : 'codeId',
        readonly: 'true',
        className: 'codeIdbox',
        placeholder: '코드기록을 위한 id',
        style: {
            width: '90%',
            margin: 5,
            outline: 'none'
        }
    },
    styleBtn : { //스타일 추가 버튼
        kind: 'button',
        className: 'styleBtn',
        text: '스타일 추가',
        onClick: e => {
            const parent = $(e.target).parents();
            BX.component(edit.stylebox).appendTo($(parent[3]).find('.stylemaker')[0]);
        },
        style: {
            width: '50%',
            margin: 3,
            border: 0,
            borderRadius: 4
        }
    },
    quizBtn : { //문제 출제바튼
        kind: 'button',
        className: 'quizBtn',
        text: '문제 출제',
        onClick: e => {
            const parent = $(e.target).parents();
            const quizbox = BX.component(edit.quizbox).appendTo($(parent[3]).find('.quizList')[0]);
            $(quizbox).find('.progressIdbox')[0].value = randomId();
            quizbox[0].scrollIntoView({block: 'start', behavior: 'smooth'})
        },
        style: {
            width: '50%',
            margin: 3,
            border: 0,
            borderRadius: 4
        }
    },
    quizbox : { //퀴즈 문제 유형, 문제, 답, 보기 등 입력 폼
        kind: 'box',
        children: [
            {
                kind : 'box',
                className: 'quizunit',
                style: {
                    background:'gray',
                    borderBottom: '1px dotted white',
                    padding: '10px 0px'
                },
                children: [
                    {
                        kind: 'input',
                        name: 'id',
                        className: 'progressIdbox',
                        readonly: 'true',
                        style: {
                            width:'auto'
                        }
                    },
                    {
                        kind: 'select',
                        id: 'quiztypeselect',
                        onChange: e => {
                            if(e.target.selectedIndex == 1) {
                                $(e.target).siblings('div').show();
                            }
                            else {
                                $(e.target).siblings('div').hide();
                            }
                        },
                        style: {
                            padding: '5px 0px',
                            marginLeft: 10
                        },
                        children: [
                            {
                                kind: 'option',
                                html: '유형 선택',
                                value : 'none'
                            },
                            {
                                kind: 'option',
                                html: '객관식',
                                value : 'multiple'
                            },
                            {
                                kind: 'option',
                                html: '주관식',
                                value : 'short'
                            },
                            {
                                kind: 'option',
                                html: 'OX (개발중)',
                                value : 'ox'
                            },
                        ]
                    },
                    {
                        kind: 'input',
                        name: 'answer',
                        placeholder: '정답 입력',
                        spellcheck: 'false',
                        style: {
                            width: 'calc(100% - 105px)',
                            margin: 5,
                            outline: 'none'
                        }
                    },
                    {
                        kind: 'textarea',
                        name: 'question',
                        placeholder: '문제 입력',
                        spellcheck: 'false',
                        style: {
                            width: '95%',
                            height: 70,
                            margin: '5px auto',
                            padding: 5,
                            outline: 'none'
                        }
                    },
                    {
                        kind: 'box',
                        style: {
                            display: 'none'
                        },
                        children: [
                            {
                                kind: 'textarea',
                                placeholder: '보기1',
                                style: {
                                    width: '95%',
                                    height: 40,
                                    margin: '5px auto',
                                    padding: 5,
                                    outline: 'none'
                                }
                            },
                            {
                                kind: 'textarea',
                                placeholder: '보기2',
                                style: {
                                    width: '95%',
                                    height: 40,
                                    margin: '5px auto',
                                    padding: 5,
                                    outline: 'none'
                                }
                            },
                            {
                                kind: 'textarea',
                                placeholder: '보기3',
                                style: {
                                    width: '95%',
                                    height: 40,
                                    margin: '5px auto',
                                    padding: 5,
                                    outline: 'none'
                                }
                            },
                            {
                                kind: 'textarea',
                                placeholder: '보기4',
                                style: {
                                    width: '95%',
                                    height: 40,
                                    margin: '5px auto',
                                    padding: 5,
                                    outline: 'none'
                                }
                            }
                        ]
                    }
                    
                ]
            }
        ]
    },
    stylebox : { //스타일 입력 폼
        kind: 'box',
        children: [
            {
                kind: 'box',
                className: 'styleunit',
                style: {
                    width: '90%',
                    borderRadius: 10,
                    border: '1px dashed lightgray',
                    margin: 5
                },
                children: [
                    {
                        kind: 'input',
                        name: 'target',
                        placeholder: '스타일 대상 텍스트',
                        style: {
                            width: '90%',
                            margin: 5,
                            outline: 'none'
                        }
                    },
                    {
                        kind: 'input',
                        name: 'type',
                        placeholder: '스타일 (예시 color:blue;background:white;)',
                        style: {
                            width: '90%',
                            margin: 5,
                            outline: 'none'
                        }
                    }
                ]
            },
            {
                kind: 'span',
                className: 'material-symbols-outlined',
                text: 'close',
                onClick: e => {
                    $(e.target).parent().remove();
                },
                style:{
                    position: 'absolute',
                    left: 10,
                    top: 30,
                    padding: 2,
                    fontSize: 19,
                    borderRadius: 40,
                    background: 'lightgray'
                }
            }
        ]
    },
    previewHandle: { // 교재 컨텐츠를 미리보기에 붙이는 핸들
        kind: 'box',
        children: [
            {
                kind: 'box',
                style: {
                    border: '1px solid #f7f7f7',
                    textAlign: 'left'
                }
            },
            {
                kind: 'span',
                className: 'previewhandle',
                // className: 'material-symbols-outlined',
                text: '1',
                onClick: e => {
                    const idx = e.target.innerText * 1 - 1;
                    contentList.children()[idx].scrollIntoView({behavior: 'smooth'});
                },
                style:{
                    position: 'absolute',
                    width: 26,
                    height: 26,
                    right: 5,
                    top: 5,
                    padding: 2,
                    fontSize: 16,
                    borderRadius: 40,
                    color: 'white',
                    background: 'lightgray'
                }
            }
        ]
    }
}
const editInput = { // 교재 컨텐츠 컴포넌트 생성을 위한 데이터 입력 도구
    makerTool : { // 컴포넌트 편집 도구 기본
        kind: 'box',
        style: {
            width: '100%',
            height: 'auto',
            textAlign: 'center',
        },
        children: [
            {
                kind: 'box',
                className: 'typebg',
                style: {
                    width: '100%',
                    height: 'auto'
                },
                children: [
                    edit.compSelect,
                    {
                        kind: 'box'
                    }
                ]
            },
            {
                kind: 'box',
                className: 'stylemaker',
                style: {
                    width: '100%',
                    height: 'auto'
                }
            },
            {
                kind: 'box',
                className: 'quizList',
                style: {
                    width: '100%',
                    height: 'auto'
                }
            }
        ]
    },
    aceEditor: {//에디터 컴포넌트 데이터 입력 폼
        kind: 'box',
        children: [
            {
                kind: 'input',
                name: 'height',
                placeholder: '높이',
                style: {
                    width: '20%',
                    margin: 5,
                    outline: 'none'
                }
            },
            {
                kind: 'input',
                name : 'start',
                placeholder: '시작 라인번호',
                style: {
                    width: '30%',
                    margin: 5,
                    outline: 'none'
                }
            }, 
            {
                kind: 'textarea',
                name:'text',
                placeholder: '코드 입력',
                spellcheck: 'false',
                style: {
                    width: '95%',
                    height: 150,
                    margin: '5px auto',
                    padding: 5,
                    outline: 'none'
                }
            }
        ]
    },
    title: { //제목 컴포넌트 데이터 입력 폼
        kind: 'box',
        children: [
            edit.edit
        ]
    },
    postit:  { //코드 설명(배경) 데이터 입력 폼
        kind: 'box',
        children: [
            edit.edit, edit.styleBtn
        ]
    },
    text: { // 글상자 컴포넌트 데이터 입력 폼
        kind: 'box',
        children: [
            edit.edit, edit.styleBtn,
        ]
    },
    check: {  //체크상자 포함 텍스트상자 컴포넌트 데이터 입력 폼
        kind: 'box',
        children: [
            edit.progressId,
            edit.edit, edit.styleBtn,
        ]
    },
    sup : {  //위 첨자 컴포넌트 데이터 입력 폼
        kind: 'box',
        children: [
            edit.edit, edit.styleBtn,
        ]
    },
    sub: {  //아래첨자 컴포넌트 데이터 입력 폼
        kind: 'box',
        children: [
            edit.edit, edit.styleBtn,
        ]
    },
    link: { //링크 컴포넌트 데이터 입력폼
        kind: 'box',
        children: [
            {
                kind: 'input',
                name: 'text',
                placeholder: '텍스트',
                style: {
                    width: '90%',
                    margin: 5,
                    outline: 'none'
                }
            },
            {
                kind: 'input',
                name: 'src',
                placeholder: '링크',
                style: {
                    width: '90%',
                    margin: 5,
                    outline: 'none'
                }
            },
            {
                kind: 'input',
                name : 'linkstyle',
                placeholder: '스타일',
                style: {
                    width: '90%',
                    margin: 5,
                    outline: 'none'
                }
            },
        ]
    },
    appBtn : { //앱보기 버튼 컴포넌트 데이터 입력 폼
        kind: 'input',
        name: 'compName',
        placeholder: '앱',
        style: {
            width: '90%',
            margin: 5,
            outline: 'none'
        }
    },
    hidebox : { // 클릭으로 내용 보여주는 글상자 컴포넌트 데이터 입력 폼
        kind : 'box',
        children: [
            edit.progressId,
            {
                kind: 'input',
                name: 'text',
                placeholder: '숨길 텍스트',
                style: {
                    width: '90%',
                    margin: 5,
                    outline: 'none'
                }
            }
        ]
    },
    practiceDirection: { //실습지시문(에디터 열기 버튼포함) 컴포넌트 데이터 입력 폼
        kind: 'box',
        children: [
            edit.codeId,
            {
                kind: 'input',
                name: 'targetApp',
                placeholder: '대상 앱',
                style: {
                    width: '90%',
                    margin: 5,
                    outline: 'none'
                }
            },
            {
                kind: 'input',
                name: 'title',
                placeholder: '앱 제목',
                style: {
                    width: '90%',
                    margin: 5,
                    outline: 'none'
                }
            },
            {
                kind: 'textarea',
                name :'bgCode',
                placeholder: '배경코드 입력',
                style: {
                    width: '95%',
                    height: 70,
                    margin: '5px auto',
                    padding: 5,
                    outline: 'none'
                }
            },
            {
                kind: 'input',
                name: 'targetLine',
                placeholder: '포커스 라인(숫자)',
                style: {
                    width: '90%',
                    margin: 5,
                    outline: 'none'
                }
            }, edit.edit
        ]
    },
    codeBox : { //코드상자 컴포넌트 데이터 입력 폼 : carbon iframe으로 사용 보류
        kind: 'box',
        children: [
            {
                kind: 'input',
                name: 'height',
                placeholder: '높이',
                style: {
                    width: '20%',
                    margin: 5,
                    outline: 'none'
                }
            },
            {
                kind: 'input',
                name : 'tab',
                placeholder: '탭 노출여부(true or false)',
                style: {
                    width: '40%',
                    margin: 5,
                    outline: 'none'
                }
            },
            {
                kind: 'input',
                name : 'start',
                placeholder: '시작 라인번호',
                style: {
                    width: '30%',
                    margin: 5,
                    outline: 'none'
                }
            }, 
            {
                kind: 'textarea',
                name:'text',
                placeholder: '코드 입력',
                style: {
                    width: '95%',
                    height: 150,
                    margin: '5px auto',
                    padding: 5,
                    outline: 'none'
                }
            }
        ]
    },
    direction : { //일반지시문(에디터 열기 버튼포함) 컴포넌트 데이터 입력 폼
        kind: 'box',
        children: [
            edit.codeId,
            edit.edit,
            {
                kind: 'textarea',
                name :'bgCode',
                placeholder: '배경코드 입력',
                style: {
                    width: '95%',
                    height: 70,
                    margin: '5px auto',
                    padding: 5,
                    outline: 'none'
                }
            },
            {
                kind: 'input',
                name: 'targetLine',
                placeholder: '포커스 라인(숫자)',
                style: {
                    width: '90%',
                    margin: 5,
                    outline: 'none'
                }
            },
            {
                kind: 'input',
                name: 'title',
                placeholder: '에디터 제목',
                style: {
                    width: '90%',
                    margin: 5,
                    outline: 'none'
                }
            }
        ]
    },
    tableFH: { //헤드고정 스타일 표 컴포넌트 데이터 입력 폼
        kind : 'box',
        children: [
            {
                kind: 'input',
                name: 'width',
                placeholder: '너비',
                style: {
                    width: '25%',
                    margin: 5,
                    outline: 'none'
                }
            },
            {
                kind: 'input',
                name: 'height',
                placeholder: '컨텐트 영역 높이',
                style: {
                    width: '25%',
                    margin: 5,
                    outline: 'none'
                }
            },
            {
                kind: 'input',
                name: 'column',
                placeholder: '열(column)',
                style: {
                    width: '45%',
                    margin: 5,
                    outline: 'none'
                }
            },
            {
                kind: 'textarea',
                name :'headarr',
                placeholder: '헤드 내용 입력(콤마 구분)',
                style: {
                    width: '95%',
                    height: 70,
                    margin: '5px auto',
                    padding: 5,
                    outline: 'none'
                }
            },
            {
                kind: 'textarea',
                name :'arr',
                placeholder: '표 내용 입력(콤마 구분)',
                style: {
                    width: '95%',
                    height: 70,
                    margin: '5px auto',
                    padding: 5,
                    outline: 'none'
                }
            },
        ]
    },
    tableHVH: { //균등분할 표 컴포넌트 데이터 입력 폼
        kind: 'box',
        children: [
            {
                kind: 'input',
                name: 'width',
                placeholder: '너비',
                style: {
                    width: '45%',
                    margin: 5,
                    outline: 'none'
                }
            },
            {
                kind: 'input',
                name: 'column',
                placeholder: '열(column)',
                style: {
                    width: '45%',
                    margin: 5,
                    outline: 'none'
                }
            },
            {
                kind: 'textarea',
                name :'arr',
                placeholder: '표 내용 입력(콤마 구분)',
                style: {
                    width: '95%',
                    height: 70,
                    margin: '5px auto',
                    padding: 5,
                    outline: 'none'
                }
            },
        ]
    },
    image: { // 이미지 상자 컴포넌트 데이터 입력 폼
        kind: 'box',
        children: [
            {
                kind: 'input',
                name : 'width',
                placeholder: '너비',
                style: {
                    width: '30%',
                    margin: 5,
                    outline: 'none'
                }
            },
            {
                kind: 'input',
                name : 'src',
                spellcheck: 'false',
                placeholder: '이미지 경로',
                style: {
                    width: '60%',
                    margin: 5,
                    outline: 'none'
                }
            },
        ]
    },
    par : { // 문단 상자 컴포넌트 데이터 입력 폼
        kind: 'box',
        children: [
            edit.edit,
            {
                kind: 'input',
                name : 'style',
                placeholder: '스타일',
                style: {
                    width: '95%',
                    margin: 5,
                    outline: 'none'
                }
            }
        ]
    },
    quiz : { // 퀴즈 컴포넌트 데이터 입력 폼
        kind: 'box',
        children: [
            edit.quizBtn
        ]
    },
}