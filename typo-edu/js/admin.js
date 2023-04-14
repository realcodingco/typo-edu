(function(){
    window.getSolve = getSolve;

    if(!location.pathname.includes('admin')){
        return;
    }
    initDatabase();
    let groupData = {};
    let resultBox;
    let totalBookData = {};
    let totalCourse, group, unstudied, crsStart;
    let bg = box().appendTo(topBox);
    let head = BX.component(admin.head).appendTo(bg);
    const excelBtn = BX.component(admin.excelfileBtn).appendTo(bg);
    excelBtn[0].onclick = printExcelData;
    BX.component(admin.headTag).appendTo(bg);
    resultBox = BX.component(admin.body).appendTo(bg);
    
    let optList = [
        {text: '그룹선택', value : 'default'},
        {text : '롯데이지러닝', value: 'lotte'}
    ];
    appendSelectBox(head, optList, selectedGroup);

    /**
     * EXCEL 버튼 클릭이벤트 핸들러 : 결과전송 처리 후 엑셀파일 정리를 위한 데이터 출력
     * @param {*} e 
     */
    function printExcelData(e) { 
        let result = [];
        //대상 데이터는 groupData가 가지고 있음. //수강과목이 2개 이상이면??
        Object.keys(groupData).forEach(function(mid) {
            Object.keys(groupData[mid].course).forEach(function(crs) {
                const quiz = groupData[mid].course[crs].quiz;
                const quizScore = parseInt(!quiz || !quiz.score ? 0 : quiz.score);
                let data = new Array(10).fill('');
                data[0] = mid;
                data[3] = totalCourse[crs].title;
                data[4] = groupData[mid].course[crs].courseCd;
                data[6] = groupData[mid].course[crs].finalprog;
                data[8] = quizScore;
                data[10] = quizScore >= 60 ? '수료' : '미수료';
                result.push(data);
            });
        });
        console.log(JSON.stringify(result)); // 엑셀작업을 위해 필요한 콘솔 출력
    }
    /**
     * 그룹선택 상자 선택 이벤트 
     * @param {*} e 
     */
    function selectedGroup(e) {
        $('.excelfileBtn').hide();
        group = e.target.value;

        head.find('>:not(:first-child)').remove();
        if(group == 'default'){
            groupData = {};
            return;
        }

        const serachTools = [
            { text : '조회 타입을 선택하세요', value : 'default'},
            { text : '기간별 검색', value: 'ymonth'},
            { text : `${new Date().getMonth()}월 미학습자`, value : 'unstudied'}
        ];
        appendSelectBox(head, serachTools, onSearchData);
    }

    /**
     * 검색 조회 타입 선택 이벤트 핸들러
     * @param {*} e 
     */
    function onSearchData(e) {
        const selected = e.target.value;
        let thirdEl = $(e.target).next();
        if(thirdEl) thirdEl.remove();
        resultBox.empty();
        groupData = {};
        unstudied = false;
        if(selected == 'default') {
            $('.headTag')[0].innerText = '';
            return;
        }
         
        if(selected == 'ymonth'){ // 입과일 기준으로 검색
            $('.excelfileBtn').hide();
            let matchNo = 0; 
            const form = BX.component(admin.input).appendTo(head);
            const inputEl = form.find('input')[0];
            inputEl.placeholder = 'YYYYMMDD 입력';
            form[0].onsubmit = e => {
                e.preventDefault();
                resultBox.empty();
                const keyword = inputEl.value;
                crsStart = keyword;
                getYmonthUser(group, keyword.substring(0, 6), function(docs) {
                    for(const doc of docs) {
                        groupData[doc.id] = doc.data();
                        appendResult(doc.data());
                    }
                    $('.headTag')[0].innerText = `${docs.length}건`;
                });
            }
        }
        else if(selected == 'unstudied'){ //미학습자 출력 : 조회시점 직전월 입과인원 중 데이터가 없는
            unstudied = true;
            const today = new Date();
            const curMonth = String(today.getMonth());
            const firstDate = `${today.getFullYear()}${curMonth.padStart(2, '0')}01`;
            const lastDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            const finalDate = `${today.getFullYear()}${curMonth.padStart(2, '0')}${lastDays}`;
            crsStart = firstDate;
            getUnstudiedList(group, firstDate, finalDate, function(result){ //배열
                $('.headTag')[0].innerText = `${result.length}건`;
                for(let user of result) {
                    groupData[user.mid] = user; //미학습자 데이터 생성해서 검색 결과 데이터로 편입.
                    appendResult(user);
                }
                $('.excelfileBtn').show();
            });
        }
    }
    // 입과일 목록의 데이터 가져오기
    function getYmonthUser(bid, ymonth, fn) {
        BX.db.firestore().collection('lecture').doc(bid).collection('monthly').doc(ymonth).collection('members')
            .get().then(snapshop => {
                const {docs} = snapshop;
                if(fn) fn(docs);
        }); 
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
    /**
     * 리스트 생성을 위한 개별 학습자 라인 생성
     * @param {*} data 
     */
    function appendResult(data) {
        const bg = BX.component(admin.dataBox).appendTo(resultBox);
        bg.find('.userName')[0].innerText = data.name;
        bg.find('.userId')[0].innerText = data.mid;
        const studied = data.course;
        const drawList = function(){
            Object.keys(studied).forEach(function(crs){
                const crsData = studied[crs];
                const date = crsData.edustart;
                const line = BX.component(admin.courseInfo).appendTo(bg);
                line.find('span:nth-child(1)')[0].innerText = crs;
                line.find('span:nth-child(2)')[0].innerText = totalCourse[crs].title;
                line.find('span:nth-child(4)')[0].innerText = date;
                line.find('span:nth-child(5)')[0].innerText = new Date(crsData.time).toLocaleString();

                const progress = crsData.progress;
                const progBg = BX.component(admin.progInfoBox).appendTo(bg);
                progBg.find('button:last-child')[0].onclick = deleteProgreeRecord;
                progBg.find('button:last-child')[0].dataset.mid = data.mid;
                progBg.find('button:last-child')[0].dataset.crs = crs;

                if(progress){
                    const listBg = progBg.find('.progressList')[0];
                    getProgress(listBg, crs, totalCourse[crs].books, progress, function(finalprogress){
                        // groupData[data.mid].course[crs].finalprog = finalprogress;
                    }); 
                } 
                else {
                    // groupData[data.mid].course[crs].finalprog = 0;
                    progBg.find('.totalProgress')[0].innerText = '학습진도율 : 0%';
                    progBg.find('.totalProgress')[0].dataset.progress = 0;
                    progBg.find('div :not(:first-child)').hide();
                }
                //퀴즈 데이터 출력
                const quizBg = BX.component(admin.quizInfoBox).appendTo(bg);
                const quizData = crsData.quiz;
                quizBg.find('button:last-child')[0].onclick = deleteQuizRecord;
                quizBg.find('button:last-child')[0].dataset.mid = data.mid;
                quizBg.find('button:last-child')[0].dataset.crs = crs;

                if(quizData) {
                    const listBg = quizBg.find('.solveList')[0];
                    getSolve(listBg, quizData);
                    quizBg.find('.finalScore')[0].innerText = quizData.score ? `평가점수 : ${quizData.score || 0}` : '평가점수 : 응시중';
                }
                else {
                    quizBg.find('.finalScore')[0].innerText = '평가점수 : 미응시';
                    quizBg.find('div :not(:first-child)').hide();
                }

                // 결과전송버튼 노출 조건 : edustart 기준 익월 1일이후
                const year = date.substring(0, 4);
                const month = date.substring(4, 6);
                if(Date.now() >= new Date(year, month, 1).getTime()) {
                    const btn = line.find('.postResultBtn')[0];
                    btn.dataset.score = crsData.quiz ? crsData.quiz.score : 0;
                    btn.dataset.progress = progBg.find('.totalProgress')[0].dataset.progress;
                    btn.dataset.crs = crs;
                    btn.dataset.mid = data.mid;
                    btn.dataset.year = year;
                    btn.dataset.groupId = data.groupId;
                    btn.dataset.courseCd = data.courseCd;
                    btn.dataset.courseCsNo = data.courseCsNo;
                    btn.style.display = 'block';

                    if(crsData.quiz && crsData.quiz.vendorResponse) {
                        btn.innerText = '전송완료';
                        $(btn).addClass('success');
                    }
                    else if(group == 'lotte') {
                        btn.onclick = postResult;
                        $('.excelfileBtn').show();
                    }

                    const status = line.find('.studyStatus')[0];
                    $(status).addClass('final');
                    status.innerText = crsData.quiz && crsData.quiz.score >= 60 ? '수료' : '미수료';
                    status.style.color = crsData.quiz && crsData.quiz.score >= 60 ? 'blue' : 'red';
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
     * 결과전송 버튼 클릭이벤트 핸들러
     * @param {*} e 
     * @returns 
     */
    function postResult(e) {
        const btn = e.target;
        const data = btn.dataset;
        const postData = {
            crs : data.crs,
            courseCd: data.courseCd,
            year: data.year,
            courseCsNo: data.courseCsNo,
            mid : data.mid,
            progress: data.progress,
            score: data.score
        }; console.log(postData);

        if(parseInt(crsStart) < 20230501) { // 테스트 기간은 제외
            return;
        }

        postLotteResult(postData, function(isSuccess) {
            if(isSuccess) {
                toastr('전송완료 되었습니다.');
                btn.innerText = '전송완료';
                btn.onclick = 'disable';
                $(btn).addClass('success');
            }
        });
    }

    /**
     * 입과리스트에서 미학습자 리스트 추출하기
     * @param {*} groupId 
     * @param {*} crsStart 
     * @param {*} crsEnd 
     * @param {*} fn 
     */
    function getUnstudiedList(groupId, crsStart, crsEnd, fn) {
        const createUnstudiedData = (totalList) => {
            const groupUser = Object.keys(groupData);
            const target = totalList.filter(o => !groupUser.includes(o.userId)); // 일치하는 mid가 없으면
            
            let arr = [];
            for(let user of target) {
                let data = {};
                data.groupId = group;
                data.name = user.userNm;
                data.mid = user.userId;
                data.course = {};
                data.course[user.cpCourseCd] = {};
                data.course[user.cpCourseCd].edustart = crsStart;
                data.course[user.cpCourseCd].courseCd = user.courseCd;
                data.course[user.cpCourseCd].courseCsNo = user.courseCsNo;
                data.course[user.cpCourseCd].time = Date.now();
                arr.push(data);
            }
            return arr;
        }

        if(groupId == 'lotte'){
            if(crsStart == '20230401' || crsStart == '20230301') { // 테스트
                const totalList = [
                    {
                        cpCourseCd : 'L018761',
                        userNm : '김하나',
                        userId: 'test',
                        courseCd : 'E187611',
                        courseCsNo : '04'
                    },
                    {
                        cpCourseCd : 'L018761',
                        userNm : '김철수',
                        userId: 'test1',
                        courseCd : 'E187611',
                        courseCsNo : '04'
                    },
                    {
                        cpCourseCd : 'L018761',
                        userNm : '이호',
                        userId: 'test2',
                        courseCd : 'E187611',
                        courseCsNo : '03'
                    },
                    ,
                    {
                        cpCourseCd : 'L018761',
                        userNm : '송미',
                        userId: 'test6',
                        courseCd : 'E187611',
                        courseCsNo : '03'
                    }
                ];
                fn(createUnstudiedData(totalList));
            }
            else { // '23. 5월 상용화
                getLotteEntrance(crsStart, crsEnd, function(result) {
                    fn(createUnstudiedData(result));
                });   
            }
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
            
            updateUserData({groupId: group, mid:mid, data:groupData[mid], crsStart:crsStart}, function(result){
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
            delete groupData[mid].course[data.crs].progress;
            
            updateUserData({groupId: group, mid:mid, data:groupData[mid], crsStart:crsStart}, function(result){
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
        if(solve) {
            if(solve.time){
                const solveTime = `제출일 : ${new Date(solve.time).toLocaleString()}`;
                box().appendTo(target).text(solveTime).textColor('white').padding(5).textAlign('left');
            }
            
            for(var i=0; i<solve.detail.length; i++){ //correct, question, userInput
                let quiz = BX.component(admin.solveUnit).appendTo(target);
                quiz.children()[0].innerText = i+1;
                if(solve.detail[i].userInput){
                    if(!solve.detail[i].correct) $(quiz.children()[0]).addClass('incorrect');
                    quiz.children()[1].innerHTML = solve.detail[i].question;
                    quiz.children()[2].innerText = solve.detail[i].userInput;
                }
                else {
                    quiz.children()[1].innerHTML = '<font color=#FF8E9B>풀지 않음</font>';
                }
            }
        }
        const entranceTime = `마지막 입장시간 : ${new Date(quizData.entrance.time).toLocaleString()} / 열람횟수: ${quizData.entrance.count}`;
        box().appendTo(target).text(entranceTime).textColor('white').padding(5).textAlign('left');
        
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

    // 챕터별 진도 체크해서 표시해주기
    function getProgress(target, crs, books, progressData, fn){
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
                    compare = compare.map( o => o.id); //id만 추출
    
                    totalRequired += compare.length;
                    const userBookData = progressData[bid];
                    const studyData = userBookData && userBookData[pid] ? 
                                userBookData[pid].clicked : [];
    
                    if(studyData){
                        studied += studyData.length;
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
                    bid : bid,
                    title : bookData[bid].title,
                    progress : progress
                };
    
                totalProgress += Number(progress);
                count++;
                if(count == Object.keys(books).length) {
                    for(var p=0; p<progData.length; p++){
                        const bar = BX.component(admin.progressBar).appendTo(target);
                        bar.children()[0].innerText = progData[p].title + ' ( ' + progData[p].progress + '% )';
                        bar[0].style.background = `linear-gradient(90deg, rgba(231,214,255,1) ${progData[p].progress}%, rgba(194,255,0,0) ${progData[p].progress}%)`;
                        if(progData[p].progress == 0){
                            bar.children()[1].innerText = ' ';
                        }
                        else {
                            bar.children()[1].dataset.crs = crs;
                            bar.children()[1].dataset.bookid = progData[p].bid;
                            bar.children()[1].onclick = initChapProgress;
                        }
                    }
                    let finalprogress = parseFloat(totalProgress/books.length);
                    if(finalprogress < 100) finalprogress = finalprogress.toFixed(2);
                    else finalprogress = finalprogress.toFixed(0);
                    $(target).parent().find('.totalProgress')[0].innerText = `학습진도율 : ${finalprogress}%`;
                    $(target).parent().find('.totalProgress')[0].dataset.progress = finalprogress;
                    if(fn) fn(finalprogress);
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
     * 진도 내역에서 챕터별 기록 삭제 버튼 클릭이벤트 핸들러
     * @param {*} e 
     */
    function initChapProgress(e){
        const bar = $(e.target).parent()[0];
        $(bar).addClass('selected');

        const fnProcess = () => {
            const topParent = $(e.target).parents()[3];
            const mid = $(topParent).find('.userId')[0].innerText
            const data = e.target.dataset;
 
            const isDelete = confirm('진도 기록을 삭제하시겠습니까?');
            if(isDelete){
                delete groupData[mid].course[data.crs].progress[data.bookid];

                updateUserData({groupId: group, mid:mid, data:groupData[mid], crsStart:crsStart}, function(result){
                    toastr.success('삭제되었습니다.');
                    $(bar).removeClass('selected');
                    const prevTxt = $(bar).children()[0].innerText;
                    $(bar).children()[0].innerText = prevTxt.substring(0, prevTxt.indexOf('(')) + '(0%)';
                    bar.style.background = `rgba(194,255,0,0)`;
                    $(bar).children()[1].innerText = ' ';
                    $(bar).children()[1].onclick = 'disable';
                }); 
            }
            else {
                $(bar).removeClass('selected');
            }
        }
        setTimeout(fnProcess, 500);
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
    
    /**
     * 롯데 이지러닝 결과 전송
     * @param {*} data 
     * @param {*} fn 
     */
    function postLotteResult(data, fn){  
        var score = parseInt(data.score);
        var passDesc = score >= 60 ? '02' : '03';

        var url = "https://www.realcoding.co/cest/lotte-post-evaluate";
        var param = {
            year : data.year,
            courseCd : data.courseCd,
            courseCsNo : data.courseCsNo,
            userId : data.mid,
            progScore : data.progress,
            finalTestScore : score,
            completionCode : passDesc // 01: 진행중, 02: 수료, 03: 미수료
        };
        
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify(param),
        })
        .then((response) => {
            saveResponseData(data.crs, data.mid, response);
        });
        //firebase에 데이터 추가
        var saveResponseData = function(crs_code, mid, response){ 
            if(!response.ok) { // 전송실패인 경우
                toastr.error('전송 실패입니다. 다시 시도하세요.');
                return;
            }

            if(!groupData[mid].course[crs_code].quiz) { // 미학습, 미응시로 데이터가 없는 경우
                groupData[mid].course[crs_code].quiz = {};
            }
            const resData = {result:response, params: param};
            groupData[mid].course[crs_code].quiz.vendorResponse = resData;
            groupData[mid].course[crs_code].quiz.vendorUptime = Date.now();
            
            if(unstudied) { // 미학습자의 경우, 진도/퀴즈 기록 없이 response 데이터 저장,
                putUserData({groupId: group, mid:mid, data:groupData[mid], crsStart:crsStart}, function(result){
                    fn && fn(true);
                });
            }
            else {
                updateUserData({groupId: group, mid:mid, data:groupData[mid], crsStart:crsStart}, function(result){
                    fn && fn(true);
                });
            }
        };
    }
})();