import emotionAnalyser from '../emotion/emotionAnalyser';
import bookProvider from '../book/providers/google/googleBookAPI';
import Promise from 'bluebird';
import wait from 'wait.for';
import _ from 'lodash';

const callServices = (textString, bookInfos, callback) => {

    const promises = [];

    /*
     * Analyse for books
     */
    _.forEach(bookInfos, (bookInfo) => {
        promises.push(emotionAnalyser.asyncAnalyse(bookInfo.description));
    });
    /*
     * Analyse for given text
     */
    promises.push(emotionAnalyser.asyncAnalyse(textString));

    /*
     * Go to emotion analyse service asynchronously
     */
    Promise.all(promises).then((promiseRes) => {
        callback(null, promiseRes);
    }).catch((error) => {
        console.log(error.stack);
        callback(null, null);
    });

};

const getRecommend = (bookResult, inputResult) => {
    return [bookResult, inputResult];
};

const analyse = (author, textString) => {

    /*
     * Get book info
     */
    const bookInfos = wait.for(bookProvider.getBookInfoAsSync, author);
    console.log(`${bookInfos.length} data is fetched from book API service.`);
    /*
     * Analyse book info
     */
    const bookResult = wait.for(analyseBooks, bookInfos);
    console.log('bookResult : ' + JSON.stringify(bookResult));
    /*
     * Analyse user input
     */
    const inputResult = wait.for(analyseInput, textString);

    /*
     * Analyse both results then output recommended books
     */
    return getRecommend(bookResult, inputResult);

    //return wait.for(callServices, textString, bookInfos);
};

const analyseInput = (textString, callback) => {

    emotionAnalyser.asyncAnalyse(textString).then((result) => {
        callback(null, result);
    }).catch((error) => {
        console.log(error.stack);
        callback(error, null);
    });

};


const analyseBooks = (bookInfos, callback) => {

    const promises = [];

    /*
     * Analyse for books
     */
    _.forEach(bookInfos, (bookInfo) => {
        promises.push(emotionAnalyser.asyncAnalyse(bookInfo.description, bookInfo));
    });

    /*
     * Go to emotion analyse service asynchronously
     */
    Promise.all(promises).then((promiseRes) => {
        callback(null, promiseRes);
    }).catch((error) => {
        console.log(error.stack);
        callback(null, null);
    });

};

module.exports.analyse = analyse;
