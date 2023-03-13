/**
 * Database 초기화
 * 의존 스크립트: firebase-app.js, firebase-firestore.js
 */
function initDatabase() {
    if(!BX) {
        BX = {};
    }

    if(!BX.db) {
        BX.db = firebase.initializeApp({
            apiKey: "AIzaSyAyWgP0T0-xUW2y_A2ZqRmbyAqTUN1qrok",
            authDomain: "realcoding-4ca98.firebaseapp.com",
            databaseURL: "https://realcoding-4ca98.firebaseio.com",
            projectId: "realcoding-4ca98",
            storageBucket: "realcoding-4ca98.appspot.com",
            messagingSenderId: "941153177710",
            appId: "1:941153177710:web:e3bbacb5b935b38edc167f"
        });
    }
}

/**
 * 데이터를 문서에 기록한다.
 * 예) userWriteDocument('users/LM00001', {name, email, ...})
 * 참고) https://firebase.google.com/docs/firestore/manage-data/add-data
 * @param {string} path 
 * @param {object} data 
 * @param {function} callback 
 */
function userWriteDocument(path, data, callback) {
    BX.db.firestore().doc(path).set(data)
        .then(callback)
        .catch(callback);
}

/**
 * 기존 문서에 데이터를 업데이트 한다.
 * @param {string} path 
 * @param {object} data 
 * @param {function} callback 
 */
function userUpdateDocument(path, data, callback) {
    BX.db.firestore().doc(path).set(data, { merge: true })
        .then(callback)
        .catch(callback);
}

/**
 * 문서에서 데이터를 읽는다.
 * 예) exampleReadDocument('users/LM00001', (doc)=>{ 
 *      console.log(doc.id, doc.data());
 * })
 * 참고) https://firebase.google.com/docs/firestore/query-data/get-data
 * @param {string} path 
 * @param {function} callback 
 */
function userReadDocument(path, callback) {
    BX.db.firestore().doc(path).get()
        .then(callback)
        .catch(callback);
}

/**
 * 문서 목록을 획득한다.
 * 예) exampleReadCollection('users', (snapshop)=>{
 *      const {docs} = snapshop;
 *      for(const doc of docs) {
 *          console.log(doc.id, doc.data());
 *      }
 * })
 * @param {string} path 
 * @param {function} callback 
 */
function userReadCollection(path, callback) {
    BX.db.firestore().collection(path).get()
        .then(callback)
        .catch(callback);
}

/**
 * 문서 데이터 삭제
 * 참고) https://firebase.google.com/docs/firestore/manage-data/delete-data
 * @param {string} path 
 * @param {function} callback 
 */
function userDeleteDocument(path, callback) {
    BX.db.firestore().doc(path).delete()
        .then(callback)
        .catch(callback);
}