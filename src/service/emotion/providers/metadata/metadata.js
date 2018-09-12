import request from 'request-promise';
import urlencode from 'urlencode';
import _ from 'lodash';

const analyse = (textString) => {

    console.log('TextString : ' + textString);

    return new Promise((resolve, reject) => {
        const API_KEY = process.env['METADATA_API_KEY'];
        request(`http://ap.mextractr.net/ma9/emotion_analyzer?out=json&apikey=${API_KEY}&text=${urlencode(textString)}`)
            .then(function (stringResult) {

                const result = JSON.parse(stringResult);
                parseResult(urlencode.decode(result.analyzed_text));
                resolve(stringResult);

            })
            .catch(function (err) {
                reject(err);
            });

    });
};

const parseResult = (result) => {

    console.log('parseResult : ' + result);

    const regex = /【.+?】 \[.+?\]  】/g;

    const match = result.match(regex);
    if (match !== null) {
        const wordScoreArray = {};
        _.forEach(match, (oneMatch)=> {
            parseOneWordScore(oneMatch, wordScoreArray);
        });
        console.log('wordScoreArray : ' + JSON.stringify(wordScoreArray));
        return wordScoreArray;
    } else {
        throw new Error(`No emotional result was found : ${result}`);
    }

};

const parseOneWordScore = (entry, resultObj) => {

    /*
     * Extract word part
     */
    const wordRegex = /【【(.+?)】/;
    const wordMatch = entry.match(wordRegex);
    const word = wordMatch[1];

    /*
     * Extract score part
     */
    const scoreRegex = /\[(.+?)\]/;
    const scoreMatch = entry.match(scoreRegex);
    const scorePart = scoreMatch[1];

    const scores = scorePart.split(',');

    resultObj[word] = scores;

};

module.exports.analyse = analyse;
