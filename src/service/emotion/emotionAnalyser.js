import metadata from './providers/metadata/metadata';
import Promise from 'bluebird';
import wait from 'wait.for';

const callServices = (textString, callback) => {

    const promises = [];
    promises.push(metadata.analyse(textString));

    Promise.all(promises).then((promiseRes) => {
        callback(null, promiseRes);
    }).catch((error) => {
        console.log(error.stack);
        callback(error, null);
    });

};

const analyse = (textString)=> {
    return wait.for(callServices, textString);
};

const asyncAnalyse = (textString)=> {

    return new Promise((resolve, reject)=>{

        /*
         * TODO comming various proviers
         */
        const promises = [];
        promises.push(metadata.analyse(textString));

        Promise.all(promises).then((promiseRes) => {
            resolve(promiseRes);
        }).catch((error) => {
            console.log(error.stack);
            reject(error);
        });

    });
};

module.exports.analyse = analyse;
module.exports.asyncAnalyse = asyncAnalyse;
