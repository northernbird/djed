import request from 'request-promise';


function analyse(textString) {
    return new Promise((resolve, reject)=>{
        const API_KEY = process.env['METADATA_API_KEY'];
        request(`http://ap.mextractr.net/ma9/emotion_analyzer?out=json&apikey=${API_KEY}&text=${textString}`)
            .then(function (result) {
                resolve(result);
            })
            .catch(function (err) {
                reject(err);
            });

    });
}

module.exports.analyse = analyse;
