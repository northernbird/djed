import emotionAnalyser from '../emotion/emotionAnalyser';
import bookProvider from '../book/providers/google/googleBookAPI';
import Promise from 'bluebird';
import wait from 'wait.for';
import _ from 'lodash';
import distance from 'euclidean-distance';

const setDistance = (bookInfos, inputResult) => {

    const inputScores = [inputResult.result.totalLike, inputResult.result.totalJoy, inputResult.result.totalAnger];
    return _.map(bookInfos, (bookInfo)=> {
        const compareScores = [bookInfo.result.totalLike, bookInfo.result.totalJoy, bookInfo.result.totalAnger];
        bookInfo.distance = distance(inputScores, compareScores);
        return bookInfo;
    });

};


const getRecommendResult = (bookInfos, inputResult) => {
    const bookDistanceInfo = setDistance(bookInfos, inputResult);
    return {
        books : _.sortBy(bookDistanceInfo, (o) => { return o.distance; }),
        input : inputResult,
    };
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
    /*
     * Analyse user input
     */
    const inputResult = wait.for(analyseInput, textString);

    /*
     * Analyse both results then output recommended books
     */
    return getRecommendResult(bookResult, inputResult);

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
