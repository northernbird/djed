import request from 'request-promise';
import urlencode from 'urlencode';
import _ from 'lodash';

const getBookInfo = (author) => {
    return new Promise((resolve, reject)=>{
        request(`https://www.googleapis.com/books/v1/volumes?q=inauthor:${urlencode(author)}&maxResults=1`)
            .then(function (result) {

                const mappedResult  = _.map(result, (item)=>{

                    return {
                        title : item.title,
                        description : item.description,
                        author : item.authors,
                    };

                });

                resolve(mappedResult);
            })
            .catch(function (err) {
                reject(err);
            });

    });
};

const getBookInfoAsSync = (author, callback) => {
    /*
     * TODO
     *  maxResults = 40 (max)
     */
    request(`https://www.googleapis.com/books/v1/volumes?q=inauthor:${urlencode(author)}&maxResults=3`)
        .then(function (stringResult) {

            const result = JSON.parse(stringResult);
            const mappedResult = [];
            _.forEach(result.items, (item)=>{

                const volumnInfo = item.volumeInfo;
                if(volumnInfo.authors.length === 1 && (volumnInfo.description)) {

                    mappedResult.push({
                        title : volumnInfo.title,
                        description : volumnInfo.description,
                        author : volumnInfo.authors,
                    });

                } else {

                    console.log(`Entry is ignored due to missing info (${JSON.stringify(volumnInfo)})`);
                }

            });

            callback(null, mappedResult);
        })
        .catch(function (err) {
            console.log(err.stack);
            callback(err, null);
        });
};



module.exports.getBookInfo = getBookInfo;
module.exports.getBookInfoAsSync = getBookInfoAsSync;
