var BX = $;

(function(){
    // CSS 표준 속성을 함수화 한다.
    applyCssNameToFunction();

    // 표준 속성외 커스터마이징 한다.
    extendBox();
    
    function applyCssNameToFunction() {
        var properties = {
            "align-content": [],
            "align-items": [],
            "align-self": [],
            "all": [],
            "animation": [],
            "animation-delay": [],
            "animation-direction": [],
            "animation-duration": [],
            "animation-fill-mode": [],
            "animation-iteration-count": [],
            "animation-name": [],
            "animation-play-state": [],
            "animation-timing-function": [],
            "backface-visibility": [],
            "background": [],
            "background-attachment": [],
            "background-blend-mode": [],
            "background-clip": [],
            "background-color": [],
            "background-image": [],
            "background-origin": [],
            "background-position": [],
            "background-repeat": [],
            "background-size": [],
            "border": [],
            "border-bottom": [],
            "border-bottom-color": [],
            "border-bottom-left-radius": [],
            "border-bottom-right-radius": [],
            "border-bottom-style": [],
            "border-bottom-width": [],
            "border-collapse": [],
            "border-color": [],
            "border-image": [],
            "border-image-outset": [],
            "border-image-repeat": [],
            "border-image-slice": [],
            "border-image-source": [],
            "border-image-width": [],
            "border-left": [],
            "border-left-color": [],
            "border-left-style": [],
            "border-left-width": [],
            "border-radius": [],
            "border-right": [],
            "border-right-color": [],
            "border-right-style": [],
            "border-right-width": [],
            "border-spacing": [],
            "border-style": ['none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset'],
            "border-top": [],
            "border-top-color": [],
            "border-top-left-radius": [],
            "border-top-right-radius": [],
            "border-top-style": [],
            "border-top-width": [],
            "border-width": [],
            "bottom": [],
            "box-shadow": [],
            "box-sizing": ['border-box', 'content-box', 'padding-box'],
            "caption-side": [],
            "clear": [],
            "clip": [],
            "color": [],
            "column-count": [],
            "column-fill": [],
            "column-gap": [],
            "column-rule": [],
            "column-rule-color": [],
            "column-rule-style": [],
            "column-rule-width": [],
            "column-span": [],
            "column-width": [],
            "columns": [],
            "content": [],
            "counter-increment": [],
            "counter-reset": [],
            "cursor": ["auto", "default", "crosshair", "pointer", "move", "text", "wait", "help"],
            "direction": [],
            "display": ["inline", "block", "flex", "inline-block", "none"],
            "empty-cells": [],
            "filter": [],
            "flex": [],
            "flex-basis": [],
            "flex-direction": [],
            "flex-flow": [],
            "flex-grow": [],
            "flex-shrink": [],
            "flex-wrap": [],
            "float": ["left", "right"],
            "hanging-punctuation": [],
            "height": [],
            "justify-content": [],
            // "@keyframes": [],
            "left": [],
            "letter-spacing": [],
            "line-height": [],
            "linear-gradient": [],
            "list-style": [],
            "list-style-image": [],
            "list-style-position": [],
            "list-style-type": [],
            "margin": [],
            "margin-bottom": [],
            "margin-left": [],
            "margin-right": [],
            "margin-top": [],
            "max-height": [],
            "max-width": [],
            // "@media": [],
            "min-height": [],
            "min-width": [],
            "nav-down": [],
            "nav-index": [],
            "nav-left": [],
            "nav-right": [],
            "nav-up": [],
            "opacity": [],
            "order": [],
            "outline": [],
            "outline-color": [],
            "outline-offset": [],
            "outline-style": [],
            "outline-width": [],
            "overflow": ['hidden', 'scroll', 'auto'],
            "overflow-x": ['hidden', 'scroll', 'auto'],
            "overflow-y": ['hidden', 'scroll', 'auto'],
            "padding": [],
            "padding-bottom": [],
            "padding-left": [],
            "padding-right": [],
            "padding-top": [],
            "page-break-after": [],
            "page-break-before": [],
            "page-break-inside": [],
            "perspective": [],
            "perspective-origin": [],
            "position": [],
            "quotes": [],
            "resize": [],
            "right": [],
            "tab-size": [],
            "table-layout": [],
            "text-align": ["left", "right", "center"],
            "text-align-last": [],
            "top": [],
            "transform": [],
            "transform-origin": [],
            "transform-style": [],
            "transition": [],
            "transition-delay": [],
            "transition-duration": [],
            "transition-property": [],
            "transition-timing-function": [],
            "unicode-bidi": [],
            "vertical-align": ["middle"],
            "visibility": [],
            "width": [],
            "word-break": [],
            "word-spacing": [],
            "word-wrap": [],
            "z-index": [],
    
            "font": [],
            // "@font-face": [],
            "font-family": [],
            "font-size": [],
            "font-size-adjust": [],
            "font-stretch": [],
            "font-style": [],
            "font-variant": [],
            "font-weight": [],
            "text-decoration": ["line-through", "none"],
            "text-decoration-color": [],
            "text-decoration-line": [],
            "text-decoration-style": [],
            "text-indent": [],
            "text-justify": [],
            "text-overflow": ['clip', 'ellipsis'],
            "text-shadow": [],
            "text-transform": [],
            "white-space": ['inherit', 'normal', 'nowrap', 'pre', 'pre-line', 'per-wrap']
        };
    
        // 모든 css property를 함수화 한다.
        for (const property in properties) {
            addCssMethod(property);
        }
    };
    
    function getMethodName(propertyName) {
        const hyphenLowerToUpper = function(match) {
            return match.slice(1).toUpperCase();
        };
        return propertyName.replace(/-[a-z]/g, hyphenLowerToUpper);
    }
    
    function addCssMethod(name) {
        const key = getMethodName(name);
        $.fn.extend({
            [key]: function (value) {
                return value == undefined ? this.css(name) : this.css(name, value);
            }
        });
    }

    function extendBox() {
        const legacy = {
            border: $.fn.border,
            outline: $.fn.outline,
            color: $.fn.color,
        };

        $.fn.extend({
            align: $.fn.textAlign,
            border: function(n, style, color) {
                if(typeof n == 'number') {
                    if(!style) {
                        style = this.borderStyle();
                        if(style == 'none') {
                            style = 'solid';
                        }
                    }
                    
                    return this.border(`${n}px ${style} ${color || this.borderColor()}`);
                }
                else {
                    return legacy.border.apply(this, arguments);
                }
            },
            outline: function(n, style, color) {
                if(typeof n == 'number') {
                    if(!style) {
                        style = this.outlineStyle();
                        if(style == 'none') {
                            style = 'solid';
                        }
                    }
                    
                    return this.outline(`${n}px ${style} ${color || this.outlineColor()}`);
                }
                else {
                    return legacy.outline.apply(this, arguments);
                }
            },
            textColor: legacy.color,
            color: $.fn.backgroundColor,
            shadow: function(n, c) {
                if(typeof n == 'number') {
                    return this.boxShadow(`${n}px ${n}px ${n}px ${n}px ${c || 'gray'}`);
                }
                else {
                    return $.fn.boxShadow.apply(this, arguments);
                }
            },
            size: function(w, h) {
                if(w !== undefined) {
                    return this.width(w).height(h || w);
                }
                else {
                    return {
                        width: this.width(),
                        height: this.height()
                    };
                }
            },
            placeholder: function(s) {
                return this.attr('placeholder', s);
            },
            text: function(s) {
                const el = this.get(0);
                if(s === undefined) {
                    if(el.value === undefined) {
                        for(const n of el.childNodes) {
                            if(n.nodeName == '#text') {
                                return n.textContent;
                            }
                            else if(n.nodeName == 'BUTTON') {
                                return n.innerHTML;
                            }
                        }
                        return '';
                    }
                    else {
                        return el.value;
                    }
                }
                else {
                    if(el.nodeName == 'BUTTON') {
                        el.innerHTML = s;
                        return this;
                    }
                    else if(el.value === undefined) {
                        for(const n of el.childNodes) {
                            if(n.nodeName == '#text') {
                                n.textContent = s;
                                return this;
                            }
                        }
                        el.prepend(s);
                    }
                    else {
                        el.value = s;
                    }
                    return this;
                }
            },
            image: function(s) {
                const el = this.get(0);
                if(s === undefined) {
                    for(const n of el.childNodes) {
                        if(n.nodeName == 'IMG') {
                            return n.src;
                        }
                    }
                    return '';
                }
                else {
                    for(const n of el.childNodes) {
                        if(n.nodeName == 'IMG') {
                            n.src = s;
                            return this;
                        }
                    }
                    return this.prepend($(`<img src="${s}" />`));
                }
            }
        });
    }

    Object.assign(BX, {
        components: {},
        regist: function(name, object){
            BX.components[name] = object;
        },
        create: function(scheme, style) {
            let tagName;
            if(!scheme) {
                tagName = 'box';
            }
            else if(typeof scheme == 'object') {
                if(scheme.kind) {
                    tagName = scheme.kind;
                }
                else {
                    style = scheme;
                }
            }
            else if(typeof scheme == 'string') {
                tagName = scheme;
            }
    
            // 콤포넌트 생성
            let element;
            const fn = BX.components[tagName];
            if(fn) {
                element = fn(scheme);
                if(!element) {
                    throw new Error(`No return box of "${tagName}".`);
                }
            }
            else if(!tagName || tagName == 'box') {
                element = $(`<div class='box'></div>`);
            }
            else {
                if(tagName == 'typography') {
                    tagName = 'p';
                }
    
                element = $(`<${tagName}></${tagName}>`);
            }
        
            // 스타일 존재시 반영
            if(typeof style == 'object') {
                for(const k in style) {
                    element.css(k, style[k]);
                }
            }
        
            return element;
        },
        component: function(scheme) {
            if(!scheme) {
                throw new Error('Missing scheme for append component.');
            }
    
            const {children, className, style, onClick, onChange} = scheme;
    
            // 콤포넌트 생성
            const comp = box(scheme);
    
            // 클래스 적용
            if(className) {
                comp.addClass(className);
            }
    
            // 인라인 스타일 적용
            if(typeof style == 'object') {
                comp.css(style);
            }
            else if(typeof style == 'string') {
                comp.attr('style', style);
            }
    
            // 클릭 이벤트 처리
            if(onClick) {
                let fn;
                if(typeof onClick == 'string') {
                    fn = window[onClick];
                }
                else if(typeof onClick == 'function') {
                    fn = onClick;
                }
    
                if(typeof fn == 'function') {
                    comp.click(fn);
                }
            }
    
            // Change 이벤트 처리
            if(onChange) {
                let fn;
                if(typeof onChange == 'string') {
                    fn = window[onChange];
                }
                else if(typeof onChange == 'function') {
                    fn = onChange;
                }
    
                if(typeof fn == 'function') {
                    comp.on('input', fn);
                }
            }
    
            // 기타 정의되지 않은 속성 처리
            for(const k in scheme) {
                if(!['kind', 'children', 'className', 'style', 'options', 'onClick', 'onChange'].includes(k)) {
                    if(typeof comp[k] == 'function') {
                        comp[k](scheme[k]);
                    }
                    else {
                        comp.attr(k, scheme[k]);
                    }
                }
            }
    
            // 하위 콤포넌트 생성
            if(Array.isArray(children)) {
                for(const child of children) {
                    BX.component(child).appendTo(comp);
                }
            }
    
            // comp.appendTo(target || topBox);
            return comp;
        },
        insertScript,
        insertCSS,
        offAceEditorDoctypeWarning
    });
    
    var _scriptStore = {};
    function insertScript(src, cb, doc) {
        if(!Array.isArray(src)) {
            src = [src];
        }
        var count = src.length;
        var fnComplete = function(){
            if(this && !doc && this.src && _scriptStore[this.src]) {
                _scriptStore[this.src].status = 'completed';
            }
            
            if(--count == 0) {
                cb && cb();

                if(!doc && this.src && _scriptStore[this.src] && _scriptStore[this.src].wait) {
                    _scriptStore[this.src].wait.forEach(function(waitCB){
                        waitCB && waitCB();
                    });
                    delete _scriptStore[this.src].wait;
                }
            }
        };

        if(doc) {
            for(var i=0; i<src.length; i++) {
                var script = doc.createElement('script');
                script.type = 'text/javascript';
                script.src = src[i];
                script.onload = fnComplete;
                doc.getElementsByTagName('head')[0].appendChild(script);
            }
        }
        else {
            for(var i=0; i<src.length; i++) {
                if(!_scriptStore[src[i]]) {
                    _scriptStore[src[i]] = {};
                }

                if(_scriptStore[src[i]].status == 'completed') {
                    fnComplete();
                }
                else if(_scriptStore[src[i]].status == 'pended') {
                    if(!_scriptStore[src[i]].wait) {
                        _scriptStore[src[i]].wait = [];
                    }
                    _scriptStore[src[i]].wait.push(cb);
                }
                else {
                    _scriptStore[src[i]].status = 'pended';
                    var script = document.createElement('script');
                    script.type = 'text/javascript';
                    script.src = src[i];
                    script.onload = fnComplete;
                    document.getElementsByTagName('head')[0].appendChild(script);
                }
            }
        }
    }

    function insertCSS(src, cb, doc) {
        if(!Array.isArray(src)) {
            src = [src];
        }
        var count = src.length;
        var fnComplete = function(){
            _scriptStore[this.href] = true;
            if(--count == 0) {
                cb && cb();
            }
        };

        if(!doc) doc = document;
        for(var i=0; i<src.length; i++) {
            if(_scriptStore[src[i]]) {
                fnComplete();
                continue;
            }
            var script = doc.createElement('link');
            script.rel = 'stylesheet';
            script.href = src[i];
            script.onload = fnComplete;
            doc.getElementsByTagName('head')[0].appendChild(script);
        }
    }

    function offAceEditorDoctypeWarning(editor) {
        var session = editor.getSession();
        session.on('changeAnnotation', function () {
            if(!session.$annotations) return;
            session.$annotations = session.$annotations.filter(function (annotation) {
                return !(/doctype first\. Expected/.test(annotation.text) || /Unexpected End of file\. Expected/.test(annotation.text))
            });
            editor.$onChangeAnnotation();
        });
    }    

    window.topBox = $('#mainapp');
    window.box = BX.create;
})();
