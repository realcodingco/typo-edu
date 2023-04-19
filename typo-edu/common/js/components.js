BX.regist('Dialog', Dialog);
BX.regist('AceEditor', AceEditor);

/**
 * 다이얼로그 커스텀 콤포넌트
 * @param {object} scheme 콤포넌트 정의 객체
 * @returns {box} 생성한 box 반환
 */
function Dialog(scheme) {
    return box().size('50vw', '50vh').position('absolute').shadow(4).top('50%').left('50%').transform('translate(-50%, -50%)');
}

/**
 * ace editor 커스텀 콤포넌트
 * @param {object} scheme 
 * @returns {box} 생성한 box 반환
 */
function AceEditor(scheme) {
    const b = box();
    const el = b.get(0);
    const opt = scheme.options || {};
    const basePath = 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.11/';
    const loadEditor = function() {
        ace.config.set('basePath', basePath);
        ace.config.set('modePath', basePath);
        ace.config.set('themePath', basePath);
        ace.config.set('workerPath', basePath);
        const editor = ace.edit(el, {
            theme: 'ace/theme/' + (opt.theme || 'monokai'),
            mode: 'ace/mode/' + (opt.mode || 'javascript')
        });
        el.aceEditor = editor;
        
        if(opt.fontsize)
            editor.setFontSize( parseInt(opt.fontsize) );
        
        editor.setShowPrintMargin(false);
        editor.setValue((scheme.text || '').trim());
        editor.clearSelection();
    };

    if(window.ace) {
        loadEditor();
    }
    else {
        const src = 'ace.min.js';
        BX.insertScript(basePath + src, loadEditor);
    }

    return b;
}
