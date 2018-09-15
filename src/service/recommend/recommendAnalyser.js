import emotionAnalyser from '../emotion/emotionAnalyser';
import bookProvider from '../book/providers/google/googleBookAPI';
import Promise from 'bluebird';
import wait from 'wait.for';
import _ from 'lodash';
import distance from 'euclidean-distance';

const setDistance = (bookInfos, inputResult) => {
    const inputScores = [inputResult.totalLike, inputResult.totalJoy, inputResult.totalAnger];
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
    const bookInfos = wait.for(bookProvider.getAllBookInfos, ['萩原朔太郎', '夏目漱石']);
    console.log(`${bookInfos.length} data is fetched from book API service.`);

    //return bookInfos;

    /*
     * Analyse book info
    */
    const bookResult = wait.for(analyseBooks, bookInfos);

    /*
     * Analyse user input
     */
    const inputResult = emotionAnalyser.syncAnalyse(textString);


    /*
     * Analyse both results then output recommended books
     */
    return getRecommendResult(bookResult, inputResult);

};

const analyseBooks = (bookInfos, callback) => {

    const promises = [];

    /*
     * Analyse for books
     */
    _.forEach(bookInfos, (bookInfo) => {
        console.log(JSON.stringify(bookInfo));
        /*
         * Duplicate titles should be removed
         */
        const removedDuplicates = _.uniqBy(bookInfo, function (e) {
            return e.title;
        });
        _.forEach(removedDuplicates, (oneBook)=> {
            promises.push(emotionAnalyser.asyncAnalyse(oneBook.description, oneBook, oneBook.id));
        });
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
