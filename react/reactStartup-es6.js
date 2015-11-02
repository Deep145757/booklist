const renderUI = require('/react/applicationRoot/renderUI');
const { store, getNewReducer } = require('/react/store');

System.import('./modules/bookEntry/bookEntry').then(module => {
    getNewReducer({ name: module.name, reducer: module.reducer });
    renderUI(module.component);
});