// 계산기 앱
var insertFormula, calculateResult, clearResult, resultWin, appendCalculator;
(function(){
    const scheme = {
        app : {
            kind: 'table',
            style: {
                width: '100%',
                margin: '0 auto',
                borderCollapse: 'collapse'
            }
        },
        resultWindow: {
            kind: 'tr',
            children: [
                {
                    kind: 'td',
                    colspan: 4,
                    children: [
                        {
                            kind: 'input',
                            type: 'text',
                            readonly: true,
                            id: 'result',
                            style: {
                                width: '98%',
                                height: 50,
                                fontSize:20,
                                padding:5
                            }
                        }
                    ]
                }
            ]
        },
        tr : {
            kind: 'tr'
        },
        td : {
            kind: 'td',
            style: {
                width: 70,
                padding: 2,
                border: '1px solid #ccc'
            }
        },
        button : {
            kind: 'input',
            type: 'button',
            style: {
                width: '100%',
                height: '50px',
                border: 'none',
                backgroundColor: '#4285f4',
                color: '#fff',
                fontSize: 25,
                cursor: 'pointer',
                borderRadius: 4 
            }
        }
    };
    
    function bx4() {
        const b = box().size('100%', 'auto').padding(5);
        
        appendCalculator = function() {
            const app = BX.component(scheme.app).appendTo(b);
            const calcuWin = BX.component(scheme.resultWindow).appendTo(app);
            resultWin = calcuWin.find('#result')[0];
            const buttonArr = [
                ['c', '/'],
                [7, 8, 9, '*'],
                [4, 5, 6, '-'],
                [1, 2, 3, '+'],
                [0, '.', '=']
            ];

            for(let line of buttonArr) {
                const row = BX.component(scheme.tr).appendTo(app);
                for(var i=0; i<line.length; i++) {
                    const btn = BX.component(scheme.td).appendTo(row);
                    if(i == 0){
                        btn.attr('colspan', String(4 - line.length + 1));
                    }
                    const inputBtn = BX.component(scheme.button).appendTo(btn);
                    inputBtn[0].value = line[i];
                    if(!['c', '='].includes(line[i])) {
                        inputBtn[0].className = 'insert';
                    }else if(line[i] == 'c') {
                        inputBtn[0].className = 'clear';
                    }else {
                        inputBtn[0].className = 'calculate';
                    }
                }
            }
        }
        
        insertFormula = function(fn){
            $('.insert').each((i, o) => {
                $(o).on('click', e => {
                    fn(o.value);
                });
            });
        }

        calculateResult = function(fn) {
            $('.calculate').on('click', e => {
                fn();
            })
        }

        clearResult = function(fn) {
            $('.clear').on('click', e => {
                fn();
            })
        }

        return b;
    }
    window.bx4 = bx4;
})();

const compData = {
    bx : bx4,
    practice: bx4,
    category: '',
    user: 'zzin',
    desc: `교육용 앱 컴포넌트<br>
▼ scheme 데이터 key :<br>
resource`,
    basicCode: `BX.components.Calculate.bx().appendTo(topBox);`,
    lessonBook: '',
    appCode : ``,
    appTitle: '계산기 앱',
    bgCode : ``
};
BX.regist('Calculate', compData);