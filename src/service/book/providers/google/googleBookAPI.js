import request from 'request-promise';
import urlencode from 'urlencode';
import _ from 'lodash';
import wait from 'wait.for';

const getBookInfo = (author) => {
    return new Promise((resolve, reject) => {
        request(`https://www.googleapis.com/books/v1/volumes?q=inauthor:${urlencode(author)}&maxResults=1`)
            .then(function (result) {

                const mappedResult = _.map(result, (item) => {

                    return {
                        title: item.title,
                        description: item.description,
                        author: item.authors,
                    };

                });

                resolve(mappedResult);
            })
            .catch(function (err) {
                reject(err);
            });

    });
};

const checkDescription = (description) => {
    return ((description) && (description.length >= 50));
};

const getBookInfoByIndexAsAsync = (author, index, callback) => {
    /*
     * TODO
     *  maxResults = 40 (max)
     */
    request(`https://www.googleapis.com/books/v1/volumes?q=inauthor:${urlencode(author)}&maxResults=40&startIndex=${index}`)
        .then(function (stringResult) {

            const result = JSON.parse(stringResult);
            const mappedResult = [];
            _.forEach(result.items, (item) => {

                const volumnInfo = item.volumeInfo;
                if (volumnInfo.authors && volumnInfo.authors.length === 1 && (checkDescription(volumnInfo.description))) {

                    mappedResult.push({
                        title: volumnInfo.title,
                        description: volumnInfo.description,
                        author: volumnInfo.authors,
                    });

                    console.log(`Entry is added (${JSON.stringify(volumnInfo)})`);

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

const getBookInfoAsSync = (author, callback) => {

    let totalCount = 0;
    let index = 0;
    const totalBookList = [];

    let bookInfo = wait.for(getBookInfoByIndexAsAsync, author, index);
    totalCount += bookInfo.length;
    totalBookList.push(...bookInfo);

    while (totalCount <= 1) {
        index += 40;
        bookInfo = wait.for(getBookInfoByIndexAsAsync, author, index);
        if(bookInfo.length <= 0) {
            break;
        } else {
            totalCount += bookInfo.length;
            totalBookList.push(...bookInfo);
        }
    }

};


module.exports.getBookInfo = getBookInfo;
module.exports.getBookInfoAsSync = getBookInfoAsSync;
