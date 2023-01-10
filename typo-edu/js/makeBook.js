//교재 만들기 편집 도구
let bookData = getBookData();
let totalCourse = getTotalCourseData();
let previewBox, contentList, editBox;
document.documentElement.style.setProperty('--halfHeight', `-${window.innerHeight/2}px`);
appendMakeBook();

/**
 * 교재 제작도구 기본 구성
 */
function appendMakeBook(){
    const bg = box().appendTo(topBox).size('100%', '100vh').align('center');
    BX.component(edit.header).appendTo(bg);
    
    if(bookData) { // bookData가 있으면 교재 선택상자 option 추가
        Object.keys(bookData).forEach(id => {
            $("#bookSelect").append(`<option value="${id}">${bookData[id].title}</option>`);
        });
    }
    
    previewBox = box().appendTo(bg).size('65%', 'calc(100vh - 40px)').padding(20).overflow('auto').fontSize(20).fontFamily('GangwonEdu_OTFBoldA, sans-serif');
    const edittool = box().appendTo(bg).size('35%', 'calc(100vh - 40px)').color('#009378').fontFamily('ChosunSg').fontSize(14).overflow('hide');
    editBox = box().appendTo(edittool).size('100%', 260).color('#006D59').overflow('auto');
    appendEditTool().appendTo(editBox);
    contentList = box().appendTo(edittool).size('100%', 'calc(100% - 260px)').overflow('auto');
}

/**
 * 교재 제작도구 초기화
 */
function initMaker() {
    previewBox.empty();
    editBox.empty();
    appendEditTool().appendTo(editBox);
    contentList.empty();
}

/**
 * 컴포넌트 생성을 위한 데이터 입력 폼 생성
 * @param {*} data optional
 * @param {*} order optional
 * @returns 
 */
function appendEditTool(data, order) {
    
    const b = BX.component(editInput.makerTool);
    $(b).find('.plusCompBtn')[0].onclick = addCompToPreview;
    $(b).on('change', '#typeSelect', loadEditTool);

    if(data) {
        b.borderBottom('1px dotted lightgray').padding('20px 0px').color('#009378');
        $(b).find('input[name=order]')[0].value = order ? order : contentList.children().length + 1;
        $(b).find('input[name=order]')[0].readOnly = 'true';
        $(b).find('input[name=order]')[0].style.background = 'lightgray';
        $(b).find('#typeSelect').val(data.comp).trigger('change');
        $(b).find('input[name=enter]')[0].value = data.enter ? data.enter : 0;
        $(b).find('.plusCompBtn')[0].innerText = '수정';
        $(b).find('.delCompBtn').show();

        $(b).find('input').each((i, el) => {
            if(el.name == 'enter' || el.name == 'order') return;
            if(data[el.name])
                el.value = data[el.name];

            if(el.name == 'id' && !el.value) {
                el.value = randomId();
            }
        });
        $(b).find('textarea').each((i, el) => {
            if(data[el.name])
                el.value = data[el.name];

        });

        if(data.style) {
            if(typeof data.style == 'object'){
                for(let type of data.style) {
                    $(b).find('.styleBtn')[0].click();
                    $(b).find('.stylemaker').children().last().find('input[name=target]')[0].value = type.target;
                    $(b).find('.stylemaker').children().last().find('input[name=type]')[0].value = type.type;
                }
            }
            else {
                $(b).find('input[name=style]')[0].value = data.style;
            }
        }

        if(data.quiz) {
            for(let q of data.quiz){
                $(b).find('.quizBtn')[0].click();
                const quizbox = $(b).find('.quizunit').last();
                $(quizbox).find('#quiztypeselect').val(q.type).prop("selected", true);
                $(quizbox).find('input[name=answer]')[0].value = q.answer;
                $(quizbox).find('input.progressIdbox')[0].value = q.id;
                $(quizbox).find('textarea[name=question]')[0].value = q.question;

                if(q.type == 'multiple') {
                    const exampleSheet = $(quizbox).find('#quiztypeselect').siblings('div');
                    exampleSheet.show();
                    for(let i in q.example) {
                        exampleSheet.children()[i].value = q.example[i];
                    }
                }
            }
        }
    }

    return b;
}

/**
 * 삭제 버튼 클릭이벤트 : 페이지 컨텐츠 삭제
 * @param {*} e 
 */
function deleteContent(e) {
    const parent = $(e.target).parents()[2];
    const order = $(parent).find('input[name=order]')[0].value * 1;
    previewBox.children()[order-1].style.border = '2px solid red';
    setTimeout( () => {
        let isDelete = confirm('삭제하시겠습니까?');
        if(isDelete) {
            parent.remove(); // 편집툴 제거 
            previewBox.children()[order-1].remove();

            sortedOrder();
        } 
        else {
            previewBox.children()[order-1].style.border = '1px solid #f7f7f7';
        }
    }, 200)
    
    
}

/**
 * 코스관리 팝업에서 코스 선택 이벤트
 * @param {*} e 
 */
function loadCourse(e) {
    const selected = e.target.value;

    if(selected == 'none') {
        return;
    }

    if(selected == 'new') { //코스 생성인 경우
        $('.makerPopup').find('input')[0].value = '';
        $('.makerPopup').find('input')[0].name = '';
        $('#sortable div').remove();
    }
    else { //기존 코스 선택한 경우
        $('.makerPopup').find('input')[0].value = totalCourse[selected].title;
        $('.makerPopup').find('input')[0].name = selected;

        const bookList = totalCourse[selected].books;
        for(let id of bookList) {
            $(`li#${id}`).addClass('ui-selected');
        }
        $('#selectArrow')[0].click();
    }
}

/**
 * 
 * @param {*} e 
 */
function manageCourse(e) {
    const popWindow = BX.component(edit.popupSettingCourse).appendTo(topBox);

    // 코스 선택 option 추가
    Object.keys(totalCourse).forEach((cid) => {
        $("#courseSelect").append(`<option value="${cid}">${totalCourse[cid].title}</option>`);
    })
    

    // 저장버튼 클릭이벤트 
    $(popWindow).find('button')[0].onclick = e => {
        let isSave = confirm('저장하시겠습니까?');

        if(isSave) {
            let arr = []; //교재 아이디 리스트
            $('#sortable li').each(function(i, el) {
                arr.push(el.id);
            });
            const title = $(popWindow).find('input')[0].value;
            const courseId = $(popWindow).find('input')[0].name;
            if(courseId) { //수정
                totalCourse[courseId].title = title;
                totalCourse[courseId].books = arr;
                //수정시에 time 데이터를 업데이트 해줘야 하는지..
            }
            else { // 신규
                const data = {
                    title : title,
                    books : arr,
                    time: Date.now(),
                    id: randomId()
                };
                totalCourse[data.id] = data;
            }
        
            localStorage.setItem('course', JSON.stringify(totalCourse));
            toastr.success('저장되었습니다');
        }
    }
    
    // 전체 교재 목록 생성하기
    const totalBookList = $('#totalBookList')[0];
    Object.keys(bookData).forEach(function(bookid){
        const book = BX.component(edit.bookbox).appendTo(totalBookList);
        book[0].innerHTML = bookData[bookid].title;
        book[0].id = bookid;
    });

    /**
     * 화살표 클릭이벤트: 선택된 요소 복제해서 추가하기
     */
    $('#selectArrow')[0].onclick = e => { 
        $( ".ui-selected").each(function(i, el) {
            const cloneEl = el.cloneNode(true);
            // $(cloneEl).find('span').show();
            $(cloneEl).removeClass('ui-selected');
            const sortBox = BX.component(edit.bookSortBox).appendTo($('#sortable')[0]);
            sortBox.prepend(cloneEl);
        });
    }

    $( "#sortable" ).sortable({//course
        revert: true,
        placeholder: "ui-state-highlight",
    });
    $('#totalBookList').selectable();
    $( ".bookEditTable" ).disableSelection();
}

/**
 * 설정 아이콘 클릭 이벤트
 * @param {*} e 
 */
function manageBook(e) {
    //팝업 열기
    const bookId = $('#bookSelect')[0].options[$('#bookSelect')[0].selectedIndex].value;
    if(bookId == 'none') return;

    const pop = BX.component(edit.popupSettingBook).appendTo(topBox);
    const form = BX.component(edit.settingForm).appendTo($(pop).find('.settingBook')[0]);
    const pageList = $(pop).find('.settingPageList')[0];

    $(pageList).sortable();
    const inputEl = $(form).find('input')[0];
    if(bookData[bookId].icon) {
        $('.setIcon').find('img')[0].src = `./image/${bookData[bookId].icon}`;
        $('.setIcon').find('input')[0].value = bookData[bookId].icon;    
    }   
    
    inputEl.value = bookData[bookId].title;
    inputEl.name = bookId;
    form.children()[0].innerText = `${bookId}`;
    form.children()[2].style.display = 'none';
    
    for(let page of bookData[bookId].pages) {
        Object.keys(page).forEach(function(id){
            const pageForm = BX.component(edit.settingForm).appendTo(pageList);
            const inputEl = $(pageForm).find('input')[0];
            inputEl.value = page[id].title;
            inputEl.name = id;
            pageForm.children()[0].innerText = `✣ ${id}`;
        })
    }
}

/**
 * 폼 입력데이터로 컨텐츠 데이터 생성
 * @param {*} target 
 * @returns 
 */
function colletData(target) { // 추가버튼을 기준으로
    let data = {};
    const parent = $(target).parents();
    const combobox = $(parent[2]).find('#typeSelect')[0];
    const name = combobox.options[combobox.selectedIndex].value;
    if(name == 'none') return data;

    data.comp = name;
    $(parent[1]).find('input').each((i, el) => { 
        if(el.name) {
            data[el.name] = el.value;
        }
    });
    $(parent[2]).find('textarea').each((i, el) => { 
        if(el.name && el.name != 'question') {
            data[el.name] = el.value;
        }
    });
    const style = [];
    $(parent[2]).find('.stylemaker .styleunit').each((i, el) => {
        let styledata = {};
        const inputs = $(el).find('input');
        for(let input of inputs) {
            styledata[input.name] = input.value;
        }
        style.push(styledata);
    });
    if(name != 'par') data.style = style;
    
    if(name == 'quiz'){
        const quiz = [];
        if($(parent[2]).find('.quizList .quizunit').length == 0) return {};
        $(parent[2]).find('.quizList .quizunit').each((i, el) => {
            let quizdata = {};
            quizdata.type = $(el).find("#quiztypeselect option:selected")[0].value;
            quizdata.id = $(el).find('.progressIdbox')[0].value;
            quizdata.answer = $(el).find('input[name=answer]')[0].value;
            quizdata.question = $(el).find('textarea[name=question]')[0].value;

            const textareas = $(el).find('textarea');
            let examples = [];
            for(let example of textareas) {
                if(example.value && example.name != 'question') examples.push(example.value);
            }
            quizdata.example = examples;
            quiz.push(quizdata);
        });
        data.quiz = quiz;
    }

    return data;
}

/**
 * 추가 버튼 클릭이벤트 : 컨텐츠 컴포넌트 미리보기에 추가
 * @param {*} e 
 */
function addCompToPreview(e) {
    const parent = $(e.target).parents();
    let data = colletData(e.target);
    console.log(data, '<<<');
    if(JSON.stringify(data) == '{}') return;

    if(e.target.innerText == '수정') {
        const order = $(parent[2]).find('input[name=order]')[0].value * 1;
        $(previewBox.children()[order-1]).replaceWith(createContent(data));
        sortedOrder();
    }
    else {
        if(data.order != '') {
            const order = $(parent[2]).find('input[name=order]')[0].value * 1;
            $(contentList.children()[order-1]).before(appendEditTool(data, order));
            $(previewBox.children()[order-1]).before(createContent(data));
        } 
        else  {
            appendEditTool(data).appendTo(contentList);
            createContent(data).appendTo(previewBox);
        }
        sortedOrder();
    
        //편집도구 초기화
        $(editBox).empty();
        appendEditTool().appendTo(editBox);
    }
}

/**
 * 유형 선택 onChange 이벤트
 * @param {*} e 
 * @returns 
 */
function loadEditTool(e) {
    const parent = $(e.target).parents();
    const combobox = $(parent[2]).find('#typeSelect')[0];
    const target = $(parent[2]).find('.typebg').children()[1];
    $(parent[2]).find('.stylemaker').empty();
    $(target).empty();
    let selected = combobox.options[combobox.selectedIndex].value;
    if(selected == 'ending' || selected == 'none') return;

    const component = BX.component(editInput[selected]).appendTo(target);
    if($(component).find('.progressIdbox')[0]) $(component).find('.progressIdbox')[0].value = randomId();
} 

/**
 * 페이지 컨텐츠 미리보기 생성
 * @param {object} data 
 * @returns 미리보기 컨텐츠 box
 */
function createContent(data) {
    const handle = BX.component(edit.previewHandle);
    const target = handle.children()[0];
    const created = createComponent(data).appendTo(target);

    if(data.comp == 'title') {
        $(created).find('.pageidtag')[0].innerHTML = $("#pageSelect").val();
    }
    for(var i=0; i<data.enter; i++) {
        BX.component(lesson.enter).appendTo(target);
    }

    return handle;
}

/**
 * New Book 버튼 클릭이벤트 : 새로운 교재 데이터 추가
 * @param {*} e 
 */
function createBook(e) {
    let total = localStorage.getItem("book");
    total = JSON.parse(total);
    if(!total) total = {};

    let bookTitle = prompt('교재 제목', '제목을 입력해주세요');
    if(bookTitle) {
        const bookId = randomId();
        let data = {
            title : bookTitle,
            id : bookId,
            time: Date.now(),
            pages : []
        }

        total[bookId] = data;
        saveBookData(total);
        bookData = total;

        //콤보 옵션 추가하고 선택. 
        $("#bookSelect").append(`<option value="${bookId}">${bookTitle}</option>`);
        $("#bookSelect").val(bookId).prop("selected", true);
        $('#pageSelect').children('option:not(:first)').remove();
        location.hash = bookId;
        initMaker();
    }
}

/**
 * New Page 버튼 클릭이벤트 : 새 페이지 생성, 데이터 추가
 * @param {*} e 
 */
function createPage(e) {
    let pageData = bookData[location.hash.slice(1)].pages;
    let pageTitle = prompt('페이지 제목', '제목을 입력해주세요');
    if(pageTitle) {
        let newData = {};
        const pageId = randomId();
        let newPage = {
            title: pageTitle,
            id: pageId,
            time: Date.now(),
            content : []
        }
        newData[pageId] = newPage;
        pageData.push(newData);
        console.log(newData);

        bookData[location.hash.slice(1)].pages = pageData;
        saveBookData(bookData);

        $("#pageSelect").append(`<option value="${pageId}">${pageTitle}</option>`);
        $("#pageSelect").val(pageId).prop("selected", true);
    }
}

/**
 * 헤더 저장버튼 클릭이벤트
 * @param {*} e 
 */
function savePageData(e){
    // 데이터 수집
    let isSave = confirm('저장하시겠습니까?');
    const modifiedData = JSON.parse(JSON.stringify(bookData));
    console.log(modifiedData == bookData)
    if(isSave) {
        const list = contentList.children();
        let pageData = [];
        for(let el of list) {
            const orderBox = $(el).find('input[name=order]')[0];
            const data = colletData(orderBox);
            pageData.push(data);
        }

        const bookId = location.hash.slice(1);
        const pageId = $("#pageSelect").val();
        const idx = $("#pageSelect")[0].selectedIndex - 1;
        modifiedData[bookId].pages[idx][pageId].content = pageData;

        if(JSON.stringify(bookData) === JSON.stringify(modifiedData)) {
            toastr.error('수정된 내용이 없거나 저장할 내용이 없습니다.');
        } 
        else {
            saveBookData(modifiedData);
            toastr.success('저장되었습니다');
            bookData = modifiedData;
        }  
    } 
}

/**
 * 교재 선택 onChange이벤트
 * @param {*} e 
 */
function loadPage(e) {
    previewBox.empty();
    contentList.empty();
    const target = $('#bookSelect')[0];
    $('#pageSelect').children('option:not(:first)').remove();
    //교재 페이지 데이터를 가져와서 목록 생성
    let selected = target.options[target.selectedIndex].value;
    const saveBtn = $('.savePageButton')[0];
    $(saveBtn).hide();

    if(selected == 'none') {
        location.hash = '';
        return;
    }
    $('.settingsBtn').show();
    const bookId = selected;
    location.hash = bookId;
    let pageData = bookData[bookId].pages;
    if(pageData.length > 0) {
        //콤보 옵션 추가 
        for(let page of pageData) {
            const id = Object.getOwnPropertyNames(page)[0]
            $("#pageSelect").append(`<option value="${id}">${page[id].title}</option>`);
        }
    }
}

/**
 * 페이지 선택 onChange 이벤트
 * @param {*} e 
 */
function loadContents(e) {
    //content 데이터로 페이지 미리보기  인덱스의 value
    previewBox.empty();
    contentList.empty();
    const pageData = bookData[location.hash.slice(1)].pages;
    const idx = $('#pageSelect')[0].selectedIndex - 1;
    const pageId = e.target.value;
    const saveBtn = $('.savePageButton');
    if(pageId == 'none') {
        saveBtn.hide();
        return;
    }
    saveBtn.show();
    const content = pageData[idx][pageId].content;

    if(content.length > 0) {
        for(let data of content) {
            createContent(data).appendTo(previewBox);
            appendEditTool(data).appendTo(contentList);
        } 
        sortedOrder();
    }  
}

/**
 * 설정 데이터 저장 클릭이벤트
 * @param {*} e 
 */
function saveBookSettingData(e) {
    const modifiedData = JSON.parse(JSON.stringify(bookData));
    const bookId = $('#bookSelect')[0].options[$('#bookSelect')[0].selectedIndex].value;

    let isSave = confirm('저장 하시겠습니까?');
    if(isSave) {
        modifiedData[bookId].title = $('.settingBook').find('input')[0].value;
        modifiedData[bookId].icon = $('.setIcon').find('input')[0].value;

        const pageList = $('.settingPageList').find('input');
        let updateList = [];
        for(let page of pageList) {
            const compareData = modifiedData[bookId].pages.filter(o => Object.keys(o)[0] == page.name)[0];
            let data = {};
            data[page.name] = compareData[page.name];
            data[page.name].title = page.value;
            updateList.push(data);
        }
        modifiedData[bookId].pages = updateList;



        if(JSON.stringify(bookData) === JSON.stringify(modifiedData)) {
            toastr.error('변경내용이 없습니다.');
            return;
        }

        bookData = modifiedData;
        saveBookData(bookData);
        toastr.success('저장 되었습니다.');
    }
}

/**
 * 교재 삭제 클릭이벤트
 * @param {*} e 
 */
function deleteBook(e) {
    const bookId = $('#bookSelect')[0].options[$('#bookSelect')[0].selectedIndex].value;
    
    //저장
    let isDelete = confirm('삭제 하시겠습니까?');
    if(isDelete) {
        delete bookData[bookId];
        saveBookData(bookData);
        toastr.success('삭제되었습니다.');
        //팝업창 닫고, 교재 선택상자 초기화, 선택상자 옵션 제거
        $('.makerPopup').remove();
        $("#bookSelect").val('none').prop("selected", true);
        $(`#bookSelect option[value='${bookId}']`).remove();
    }
}

/**
 * 설정팝업에서 페이지 삭제 기능
 * @param {string} id - 페이지 아이디 
 */
function deletePage(id) {
    const modifiedData = JSON.parse(JSON.stringify(bookData));
    const bookId = $('#bookSelect')[0].options[$('#bookSelect')[0].selectedIndex].value;

    let isDelete = confirm('페이지를 삭제 하시겠습니까?');
    if(isDelete) {
        const updatePage = modifiedData[bookId].pages.filter(o => Object.keys(o)[0] != id);
        modifiedData[bookId].pages = updatePage;
        bookData = modifiedData;
        saveBookData(bookData);
        toastr.success('페이지가 삭제되었습니다.');
        //해당 페이지 라인 삭제
        $(`input[name=${id}]`).parent().remove();
        $(`#pageSelect option[value='${id}']`).remove();
    }
}

/**
 * 컴포넌트 추가 및 삭제시, contentList 컴포넌트 순서 재정렬 기능
 */
function sortedOrder() {
    $(contentList).find('input[name=order]').each((i, el) => {
        el.value = i + 1;
    });
    $(previewBox).find('span.previewhandle').each((i, el) => {
        el.innerText = i + 1;
    });
}

function saveBookData(data) {
    if(data)
        localStorage.setItem("book", JSON.stringify(data));
}


