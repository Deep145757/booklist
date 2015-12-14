const { LOAD_BOOKS, LOAD_BOOKS_RESULTS, LOAD_SUBJECTS, LOAD_SUBJECTS_RESULTS,
        TOGGLE_SELECT_BOOK, SELECT_ALL_BOOKS, DE_SELECT_ALL_BOOKS, SET_NEW_SUBJECT_PARENT, EDIT_SUBJECT,
        UPDATE_SUBJECT, UPDATE_SUBJECT_RESULTS } = require('./actionNames');

function loadBooksAndSubjects(){
    return function(dispatch, getState){
        dispatch({ type: LOAD_SUBJECTS });
        dispatch({ type: LOAD_BOOKS });

        Promise.all([
            ajaxUtil.get('/subject/all', { userId: 1 }),
            booksSearch()
        ]).then(([subjectsResp, booksResp]) => {
            dispatch({ type: LOAD_SUBJECTS_RESULTS, subjects: subjectsResp.results });
            dispatch(booksResults(booksResp)); //have the subjects in place before loading books
        });
    }
}

function loadBooks(){
    return function(dispatch, getState){
        dispatch({ type: LOAD_BOOKS });

        Promise.resolve(booksSearch()).then(resp => dispatch(booksResults(resp)));
    }
}

function booksSearch(){
    return ajaxUtil.get('/book/searchBooks', { });
}

function booksResults(resp){
    return { type: LOAD_BOOKS_RESULTS, bookList: resp.results };
}

function editSubjectsForBook(index){
    return { type: EDIT_SUBJECTS_FOR, index };
}

function addSubjectToBook(subject){
    return function(dispatch, getState) {
        dispatch({ type: MODIFY_SUBJECTS });

        setTimeout(() => dispatch({ type: MODIFY_SUBJECTS_RESULTS, subject: subject }), 1000);
    }
}

function toggleSelectBook(_id){
    return { type: TOGGLE_SELECT_BOOK, _id }
}

function setNewSubjectParent(subjectId, newSubjectId){
    return { type: SET_NEW_SUBJECT_PARENT, subjectId, newSubjectId };
}

function editSubject(_id){
    return { type: EDIT_SUBJECT, _id };
}

function updateSubject(_id, newName, newParent){
    return function(dispatch) {
        ajaxUtil.post('/subject/setInfo', {_id, newName, newParent}, resp => {
            dispatch({ type: UPDATE_SUBJECT_RESULTS, _id, newName, newParent, affectedSubjects: resp.affectedSubjects, existingParent: resp.existingParent });
        });
    }
}

module.exports = {
    loadBooks,
    editSubjectsForBook,
    addSubjectToBook,
    loadBooksAndSubjects,
    toggleSelectBook,
    setNewSubjectParent,
    editSubject,
    updateSubject
};

