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
    _.forEach(bookInfos, (bookInfo)=> {
        console.log('ZUZUZUZUZU');
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

const analyse = (author, textString)=> {

    /*
     * Get book info
     */
    const bookInfos = wait.for(bookProvider.getBookInfoAsSync, author);

    return wait.for(callServices, textString, bookInfos);
};

module.exports.analyse = analyse;
