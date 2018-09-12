import request from 'request-promise';
import urlencode from 'urlencode';

function analyse(textString) {
    return new Promise((resolve, reject)=>{
        const API_KEY = process.env['METADATA_API_KEY'];
        request(`http://ap.mextractr.net/ma9/emotion_analyzer?out=json&apikey=${API_KEY}&text=${urlencode(textString)}`)
            .then(function (result) {
                resolve(result);
            })
            .catch(function (err) {
                reject(err);
            });

    });
}

module.exports.analyse = analyse;
