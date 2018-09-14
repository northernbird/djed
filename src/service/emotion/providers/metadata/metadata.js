import request from 'request-promise';
import urlencode from 'urlencode';
import _ from 'lodash';
import MetadataCacheModel from '../../../../models/metadata';

const MetadataCache = MetadataCacheModel.MetadataCache;

const persist = (id, result) => {

    const dbCache = new MetadataCache({id: id, result: result});

    dbCache
        .save()
        .then(function (savedDoc) {
            console.log(`Doc has been sucessfully saved : ${JSON.stringify(savedDoc)}`);
        }).catch((err) => {
        console.log(`Error occurred by saving service request : ${err.stack}`);
    });
};

const getCache = (cacheId) => {

    return new Promise((resolve, reject) => {
        MetadataCache
            .find({id: cacheId}).then((result) => {

            if (!result || result.length === 0) {
                resolve();
            } else {
                resolve(result[0]);
            }

        }).catch((err) => {
            reject(err);
        });
    });

};

const askAPI = (cacheId, textString) => {

    return new Promise((resolve, reject)=> {

        const API_KEY = process.env['METADATA_API_KEY'];
        request(`http://ap.mextractr.net/ma9/emotion_analyzer?out=json&apikey=${API_KEY}&text=${urlencode(textString)}`)
            .then((stringResult) => {

                const json = JSON.parse(stringResult);
                const result = parseResult(urlencode.decode(json.analyzed_text));
                if(cacheId) {
                    persist(cacheId, result);
                }
                resolve(result);

            })
            .catch((err) => {
                reject(err);
            });

    });

};

const analyse = (textString, callBack) => {

    askAPI(null, textString).then((result)=> {

        callBack(null, result);

    }).catch((err) => {

        callBack(err, null);

    });

};

const analyseWithCache = (cacheId, textString) => {

    return new Promise((resolve, reject) => {

        getCache(cacheId).then((cache) => {

            if(!cache) {

                console.log(`Cache doesn't exist for id : ${cacheId}`);
                askAPI(cacheId, textString).then((result)=> {

                    resolve(result);

                }).catch((err) => {

                    reject(err);

                });

            } else {

                console.log(`Use cache for id : ${cacheId}`);
                resolve(cache.result);

            }


        }).catch((err) => {
            reject(err);
        });




    });
};

const parseResult = (result) => {

    const regex = /【.+?】 \[.+?\]  】/g;
    const match = result.match(regex);
    const wordScoreArray = {
        totalLike: 0,
        totalJoy: 0,
        totalAnger: 0,
        words: {},
    };

    if (match !== null) {

        _.forEach(match, (oneMatch) => {
            parseOneWordScore(oneMatch, wordScoreArray);
        });

        return wordScoreArray;
    } else {
        console.log(`No emotional result was found : ${result}`);
        return wordScoreArray;
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

    const parts = scorePart.split(',');
    const wordScoreObj = resultObj.words[word];
    const like = Number(parts[0]);
    const joy = Number(parts[1]);
    const anger = Number(parts[2]);

    /*
     * Update total scores
     */
    resultObj.totalLike += like;
    resultObj.totalJoy += joy;
    resultObj.totalAnger += anger;

    if (wordScoreObj) {

        /*
         * Update existing object
         */
        wordScoreObj.like += like;
        wordScoreObj.joy += joy;
        wordScoreObj.anger += anger;
        wordScoreObj.count += 1;

    } else {

        /*
         * Add as a new word
         */
        resultObj.words[word] = {
            like: like,
            joy: joy,
            anger: anger,
            count: 1,
        };

    }

};

module.exports.analyseWithCache = analyseWithCache;
module.exports.analyse = analyse;
