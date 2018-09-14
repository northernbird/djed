import metadata from './providers/metadata/metadata';
import Promise from 'bluebird';
import wait from 'wait.for';

/*const callServices = (textString, callback) => {

    const promises = [];
    promises.push(metadata.analyse(textString));

    Promise.all(promises).then((promiseRes) => {
        callback(null, promiseRes);
    }).catch((error) => {
        console.log(error.stack);
        callback(error, null);
    });

};*/

const syncAnalyse = (textString)=> {
    return wait.for(metadata.analyse, textString);
};

const asyncAnalyse = (textString, optionalInfo, cacheId)=> {

/*    return new Promise((resolve, reject)=>{

        /!*
         * TODO comming various proviers
         *!/
        const promises = [];
        promises.push(metadata.analyse(textString));

        Promise.all(promises).then((promiseRes) => {
            resolve(promiseRes);
        }).catch((error) => {
            console.log(error.stack);
            reject(error);
        });

    });*/

    return new Promise((resolve, reject)=>{

        metadata.analyseWithCache(cacheId, textString).then((result)=>{
            resolve({
                id : cacheId,
                result : result,
                optionalInfo: optionalInfo
            });
        }).catch(function (err) {
            reject(err);
        });

    });


};

module.exports.syncAnalyse = syncAnalyse;
module.exports.asyncAnalyse = asyncAnalyse;
