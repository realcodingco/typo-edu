// 캘린더 앱
var prevMonth, nextMonth, createCalendar, clearTbody, tbody, cell, calendarTitle;
(function(){
    const scheme = {
        app: {
            kind: 'box',
            children : [
                {
                    kind: 'h1',
                    text: '캘린더',
                    style: {
                        textAlign: 'center',
                        marginTop: 50,
                        fontSize: 36,
                        color: '#333'
                    }
                },
                {
                    kind: 'box',
                    className: 'calendarNav',
                    children: [
                        {
                            kind: 'box',
                            text: '이전',
                            className: 'navPrev',
                            style: {
                                cursor: 'pointer',
                                width:'auto',
                                // display: 'inline-block',
                                padding: 10,
                                backgroundColor: '#333',
                                color: '#fff',
                                fontWeight: 'bold',
                                borderRadius: 5,
                                float: 'left'
                            }
                        },
                        {
                            kind: 'box',
                            text: '다음',
                            className: 'navNext',
                            style: {
                                cursor: 'pointer',
                                width:'auto',
                                // display: 'inline-block',
                                padding: 10,
                                backgroundColor: '#333',
                                color: '#fff',
                                fontWeight: 'bold',
                                borderRadius: 5,
                                float: 'right'
                            }
                        }
                    ]
                },
                {
                    kind: 'table',
                    style: {
                        width: '100%',
                        borderCollapse: 'collapse',
                        marginTop: 30,
                        backgroundColor: '#fff',
                        border: '1px solid #ccc'
                    },
                    children: [
                        {
                            kind:'thead',
                            children: [
                                {
                                    kind: 'tr',
                                }
                            ]
                        },
                        {
                            kind:'tbody'
                        }
                    ]
                }
            ]
        },
        th: {
            kind: 'th',
            style: {
                padding: 10,
                textAlign: 'center',
                border: '1px solid #ccc'
            }
        },
        td: {
            kind : 'td',
            style: {
                padding: 10,
                textAlign: 'center',
                border: '1px solid #ccc',
                color:'black'
            }
        }
    };
    
    function bx20() {
        const b = box().size('100%').padding(5);
        
        createCalendar = function(fn) {
            b.empty().color('#f2f2f2');
            const app = BX.component(scheme.app).appendTo(b);
            const thead = app.find('thead tr');
            const days = ['일', '월', '화', '수', '목', '금', '토'];
            for(let d of days) {
                BX.component(scheme.th).appendTo(thead).text(d);
            }
            tbody = app.find('tbody')[0];
            cell = () => BX.component(scheme.td)[0];
            calendarTitle = app.find('h1')[0];
            clearTbody = () => app.find('tbody').empty();

            if(fn) {
                fn();
            }
            
        }

        prevMonth = function(fn){
            $('.navPrev').on('click', e => {
                fn();
            });
        }
        nextMonth = function(fn){
            $('.navNext').on('click', e => {
                fn();
            });
        }

        return b;
    }
    window.bx20 = bx20;
})();

const compData = {
    bx : bx20,
    practice: bx20,
    category: '',
    user: 'zzin',
    desc: `교육용 앱 컴포넌트<br>
▼ scheme 데이터 key :<br>
resource`,
    basicCode: `BX.components.Calendar.bx().appendTo(topBox);`,
    lessonBook: '',
    appCode : ``,
    appTitle: '캘린더 앱',
    bgCode : ``
};
BX.regist('Calendar', compData);