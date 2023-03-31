(function(){
    window.getSolve = getSolve;
    if(location.hash != '#tohj'){
        return;
    }
    initDatabase();
    const groupList = [];
    let totalData = {};
    let groupData = {};
    let resultBox;
    let totalBookData = {};
    let totalCourse;
    let bg = box().appendTo(topBox);
    let head = BX.component(admin.head).appendTo(bg);
    BX.component(admin.headTag).appendTo(bg);
    resultBox = BX.component(admin.body).appendTo(bg);
    // 전체 user 데이터 가져오기
    userReadCollection(`users`, (snapshop)=>{ 
        const {docs} = snapshop;
        for(const doc of docs) {
            const userId = doc.id;
            const userData = doc.data();
            totalData[userId] = userData;
            const groupName = userData.groupId;
            if(groupName && !groupList.includes(groupName)) {
                groupList.push(groupName);
            }
        }
        
        let optList = [
            {text: '그룹선택', value : 'default'}
        ];
        for(let group of groupList){ // 데이터에 그룹이 있는만큼 생성
            optList.push({text: group});
        }
        appendSelectBox(head, optList, selectedGroup);
    });

    /**
     * 그룹선택 상자 선택 이벤트 
     * @param {*} e 
     */
    function selectedGroup(e) {
        const group = e.target.value;

        head.find('>:not(:first-child)').remove();
        if(group == 'default'){
            groupData = {};
            return;
        }
        //그룹 데이터 검색
        Object.keys(totalData).forEach(function(o) {
            if(totalData[o].groupId == group) {
                groupData[o] = totalData[o];
            }
        });
        //월별 수강자, 학습자 검색, 과정별 검색 
        const serachTools = [
            { text : '조회 타입을 선택하세요', value : 'default'},
            { text : '전체', value : 'total'},
            { text : '기간별 검색', value: 'ymonth'},
            { text : '학습자 검색', value : 'user'},
            { text : '과정별 검색', value : 'course'}
        ];
        appendSelectBox(head, serachTools, onSearchData);
    }
    /**
     * 검색 조회 타입 선택 이벤트 핸들러
     * @param {*} e 
     */
    function onSearchData(e) {
        const selected = e.target.value;
        let thirdEl = head.children()[2];
        if(thirdEl) thirdEl.remove();
        resultBox.empty();
        if(selected == 'default') {
            $('.headTag')[0].innerText = '';
            return;
        }
        if(selected == 'total') {
            Object.keys(groupData).forEach(function(o){
                appendResult(groupData[o]);
            });
            $('.headTag')[0].innerText = `${Object.keys(groupData).length}건`;
        }
        else if(selected == 'user' || selected == 'ymonth'){
            // mid 검색입력창 만들기
            let matchNo = 0; 
            const form = BX.component(admin.input).appendTo(head);
            const inputEl = form.find('input')[0];
            inputEl.placeholder = selected == 'user' ? '이름 또는 아이디 입력' : 'YYYYMM 입력';
            form[0].onsubmit = e => {
                e.preventDefault();
                resultBox.empty();
                const keyword = inputEl.value;
                const userData = groupData[keyword];
                const searchByName = Object.keys(groupData).filter(o => groupData[o].name == keyword);
                if(/\d{6}/.test(keyword)) { // 입과일 검색
                    let matched = [];
                    Object.keys(groupData).forEach(function(o){
                        let enroll = groupData[o].course;
                        Object.keys(enroll).forEach(function(crs){
                            if(enroll[crs].edustart.substring(0,6) == keyword) {
                                matched.push(groupData[o]);
                            }
                        });
                    });
                    for(let n of matched){
                        appendResult(n);
                    }
                    matchNo = matched.length;
                }
                else if(userData) { // mid 일치
                    appendResult(userData);
                    matchNo = 1;
                }
                else if(searchByName.length > 0){ // 이름이 일치하는 목록 
                    for(let id of searchByName) {
                        appendResult(groupData[id]);
                    }
                    matchNo = searchByName.length;
                }
                else {
                    toastr.error('해당 학습자는 검색되지 않습니다.');
                }
                $('.headTag')[0].innerText = `${matchNo}건`;
            }
        }
        else if(selected == 'course'){
            const offered = [
                { text : '교육과정을 선택하세요', value : 'default'},
            ];
            const getOffered = function() {
                Object.keys(totalCourse).forEach(function(crs){ // 개설과목 리스트 course.json에서 가져오기
                    offered.push({text: totalCourse[crs].title, value: crs});
                });
                appendSelectBox(head, offered, searchByCrs);
            }
            if(!totalCourse) {
                getCourseData(function(result){
                    totalCourse = result;
                    getOffered();
                });
            }
            else {
                getOffered();
            }
        }
    }
    /**
     * 교육과정 콤보상자 선택 이벤트 핸들러
     * @param {*} e 
     */
    function searchByCrs(e){ //그룹데이터에서 특정 코스를 수강중인 학습자 조회
        const selected = e.target.value;
        resultBox.empty();
        let matched = [];
        Object.keys(groupData).forEach(function(o){
            let enroll = groupData[o].course;
            Object.keys(enroll).forEach(function(crs){
                if(crs == selected){
                    matched.push(groupData[o]);
                }
            });
        });
        for(let n of matched){
            appendResult(n);
        }
        $('.headTag')[0].innerText = `${matched.length}건`;
    }

    function appendResult(data) {
        const bg = BX.component(admin.dataBox).appendTo(resultBox);
        bg.find('.userName')[0].innerText = data.name;
        bg.find('.userId')[0].innerText = data.mid;
        const studied = data.course;
        const drawList = function(){
            Object.keys(studied).forEach(function(crs){
                const crsData = studied[crs];
                const line = BX.component(admin.courseInfo).appendTo(bg);
                line.find('span:nth-child(1)')[0].innerText = crs;
                line.find('span:nth-child(2)')[0].innerText = totalCourse[crs].title;
                line.find('span:nth-child(4)')[0].innerText = crsData.edustart;
                line.find('span:nth-child(5)')[0].innerText = new Date(crsData.time).toLocaleString();

                const progress = crsData.progress;
                const progBg = BX.component(admin.progInfoBox).appendTo(bg);
                progBg.find('button:last-child')[0].onclick = deleteProgreeRecord;
                progBg.find('button:last-child')[0].dataset.mid = data.mid;
                progBg.find('button:last-child')[0].dataset.crs = crs;

                if(progress){
                    const listBg = progBg.find('.progressList')[0];
                    getProgress(listBg, crs, totalCourse[crs].books, progress);
                } else {
                    progBg.find('.totalProgress')[0].innerText = '학습진도율 : 0%';
                    progBg.find('div :not(:first-child)').hide();
                }
                //퀴즈 데이터 출력
                const quizBg = BX.component(admin.quizInfoBox).appendTo(bg);
                const quizData = crsData.quiz;
                quizBg.find('button:last-child')[0].onclick = deleteQuizRecord;
                quizBg.find('button:last-child')[0].dataset.mid = data.mid;
                quizBg.find('button:last-child')[0].dataset.crs = crs;

                if(quizData && quizData.solve) {
                    const listBg = quizBg.find('.solveList')[0];
                    getSolve(listBg, quizData);
                    quizBg.find('.finalScore')[0].innerText = quizData.score ? `평가점수 : ${quizData.score}` : '평가점수 : 응시중';
                }
                else {
                    quizBg.find('.finalScore')[0].innerText = '평가점수 : 미응시';
                    quizBg.find('div :not(:first-child)').hide();
                }
            });
        }
        if(!totalCourse) {
            getCourseData(function(totalcourse) {
                totalCourse = totalcourse;
                drawList();
            });
        } else {
            drawList();
        }
    }

    /**
     * 퀴즈 기록 초기화 버튼 클릭 이벤트 핸들러
     * @param {*} e 
     */
    function deleteQuizRecord(e) {
        const data = e.target.dataset;
        const mid = data.mid;
        
        const answer = confirm('퀴즈 기록을 삭제하시겠습니까?');
        if(answer) {
            delete groupData[mid].course[data.crs].quiz;
            totalData[mid] = groupData[mid];
            console.log(groupData[mid], 'updated');
            userUpdateDocument(`users/${mid}`, groupData[mid], function(result){
                toastr.success('삭제되었습니다.');
                $(e.target).siblings('span')[0].innerText = '평가점수 : 미응시';
                $(e.target).siblings('button').hide();
                $(e.target).hide();
                $($(e.target).parents()[1]).find('.solveList').empty();
                $($(e.target).parents()[1]).find('.solveList')[0].style.display = 'none';
            });
        }   
    }

    /**
     * 진도 기록 초기화 버튼 클릭 이벤트 핸들러
     * @param {*} e 
     */
    function deleteProgreeRecord(e) {
        const data = e.target.dataset;
        const mid = data.mid;

        const answer = confirm('진도 기록을 삭제하시겠습니까?');
        if(answer) {
            // course[src].progress 삭제
            delete groupData[mid].course[data.crs].progress;
            totalData[mid] = groupData[mid];
            console.log(groupData[mid], 'updated');
            userUpdateDocument(`users/${mid}`, groupData[mid], function(result){
                toastr.success('삭제되었습니다.');
                $(e.target).siblings('span')[0].innerText = '학습진도율 : 0%';
                $(e.target).siblings('button').hide();
                $(e.target).hide();
                $($(e.target).parents()[1]).find('.progressList').empty();
                $($(e.target).parents()[1]).find('.progressList')[0].style.display = 'none';
            });
            
        }
    }

    /**
     * 전체 코스 데이터 가져오기
     * @param {*} fn 
     */
    function getCourseData(fn){
        $.ajax({url: "./lecture/course.json", dataType: "json"})
        .done((json) => {
            if(fn) fn(json);
        })
        .fail((xhr, status, error) => {});
    }
    /**
     * 학습자 퀴즈풀이 데이터로 오답시트 생성하기
     * @param {bx} target 오답시트를 붙여줄 대상
     * @param {*} quizData 학습자 quiz 데이터
     */
    function getSolve(target, quizData){
        const solve = quizData.solve; 
        const solveTime = `제출일 : ${new Date(solve.time).toLocaleString()}`;
        box().appendTo(target).text(solveTime).textColor('white').padding(5).textAlign('left')
        for(var i=0; i<solve.detail.length; i++){ //correct, question, userInput
            let quiz = BX.component(admin.solveUnit).appendTo(target);
            quiz.children()[0].innerText = i+1;
            if(solve.detail[i].userInput){
                if(!solve.detail[i].correct) $(quiz.children()[0]).addClass('incorrect');
                quiz.children()[1].innerHTML = solve.detail[i].question;
                quiz.children()[2].innerText = solve.detail[i].userInput;
            }
        }
    }
    /**
     * 퀴즈교재 id로 퀴즈 정답 배열 가져오기
     * @param {*} crs 
     * @param {*} bookId 
     * @param {*} fn 
     */
    function checkQuizAnswer(crs, bookId, fn) {
        $.ajax({url: `./lecture/${crs}/${bookId}/${bookId}.json`, dataType: "json"})
            .done((json) => {
                const pageData = json.pages;
                let page = pageData[0]; //퀴즈교재는 단일 페이지
                let pageId = Object.keys(page)[0];
                let content = page[pageId].content; // 제목포함 교재 컨텐츠 배열
                let answers = content.map(o => o.answer);
                if(fn) fn(answers);
        })
        .fail((xhr, status, error) => {})
    }

    function getProgress(target, crs, books, progressData){
        let totalProgress = 0;
        let count = 0;
        let progData = [];

        Object.keys(books).forEach(function(o, pos){
            let bookData = {};
            const calcProg = function(json){
                const bid = json.id;
                bookData[bid] = json; 
                if(!totalBookData[crs]) totalBookData[crs] = {};
                if(!totalBookData[crs][bid]) totalBookData[crs][bid] = json; // 초기 1회만 조회
                let progress = 0;
    
                const pageData = bookData[bid].pages; // 배열
                let totalRequired = 0;
                let studied = 0;
    
                for(var i=0; i<pageData.length; i++) {
                    let pid = Object.keys(pageData[i])[0];
    
                    const targetPage = bookData[bid].pages.filter( o => Object.keys(o)[0] == pid)[0];
                    const content = targetPage[pid].content;
                    
                    let compare = content.filter(o => o.id);//교재에 포함된 id 목록 : 클릭되어야 할 요소들, 대조군
                    compare = compare.map( o => o.id);
    
                    totalRequired += compare.length;
                    const userBookData = progressData[bid];
                    const studyData = userBookData && userBookData[pid] ? 
                                userBookData[pid].clicked : [];
    
                    if(studyData){
                        studied += studyData.length;
                    }
    
                    let point;
                    for(let id of compare) {
                        if(!studyData || !studyData.includes(id)) {
                            point = id;
                            break;
                        }
                    }
                }
    
                progress = (studied / totalRequired) * 100;
                if(isNaN(progress)) {
                    progress = 0;
                } else if(progress >= 100) {
                    progress = progress.toFixed(0);
                } else if(progress > 0) {
                    progress = progress.toFixed(1);
                } 
                
                
    
                //화면에 출력
                progData[pos] = { 
                    title : bookData[bid].title,
                    progress : progress
                };
    
                totalProgress += Number(progress);
                count++;
                if(count == Object.keys(books).length) {
                    for(var p=0; p<progData.length; p++){
                        const bar = box().appendTo(target).width('24%').padding(2).margin(1).border('1px solid #E7D6FF').align('center')
                             .text(progData[p].title + ' ( ' + progData[p].progress + '% )');
                        bar[0].style.background = `linear-gradient(90deg, rgba(231,214,255,1) ${progData[p].progress}%, rgba(194,255,0,0) ${progData[p].progress}%)`;
                    }
                    let finalprogress = parseFloat(totalProgress/books.length)
                    if(finalprogress < 1) finalprogress = finalprogress.toFixed(1);
                    else finalprogress = finalprogress.toFixed(0);
                    $(target).parent().find('.totalProgress')[0].innerText = `학습진도율 : ${finalprogress}%`;
                }
            }

            if(totalBookData[crs]) {
                calcProg(totalBookData[crs][books[o].id]);
            } 
            else {
                getBookData(crs, books[o].id, json => {
                    calcProg(json);
                });
            }
            
            
        });
    }

    /**
     * 선택상자 붙이기
     * @param {*} target 붙일 대상(부모요소)
     * @param {*} options option목록(배열)
     * @param {*} fn 선택 이벤트 핸들러
     */
    function appendSelectBox(target, options, fn) {
        const typeSelect = BX.component(admin.searchType).appendTo(target);

        for(var i=0; i<options.length; i++) {
            const opt = BX.component(admin.typeOption).appendTo(typeSelect);
            opt[0].value = options[i].value || options[i].text;
            opt[0].innerText = options[i].text;
        }

        typeSelect[0].onchange = fn;
    }
    
    /**
     * 교육과정 교재 데이터 가져오기
     * @param {*} crs courseId
     * @param {*} bookid 
     * @param {*} fn 
     */
    function getBookData(crs, bookid, fn) {
        $.ajax({url: `./lecture/${crs}/${bookid}/${bookid}.json`, dataType: "json"})
        .done((json) => {
            if(fn) fn(json);
        })
        .fail((xhr, status, error) => {});
    }
    
})();