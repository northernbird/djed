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

const getBookInfoByIndexAsAsync = (author, index) => {
    /*
     * TODO
     *  maxResults = 40 (max)
     */
    return new Promise((resolve, reject) => {

        request(`https://www.googleapis.com/books/v1/volumes?q=inauthor:${urlencode(author)}&maxResults=40&startIndex=${index}`)
            .then(function (stringResult) {

                const result = JSON.parse(stringResult);
                const mappedResult = [];
                _.forEach(result.items, (item) => {

                    const volumnInfo = item.volumeInfo;
                    if (volumnInfo.authors && volumnInfo.authors.length === 1 && (checkDescription(volumnInfo.description))) {

                        mappedResult.push({
                            id: item.id,
                            title: volumnInfo.title,
                            description: volumnInfo.description,
                            author: volumnInfo.authors,
                        });

                        console.log(`Entry is added (${JSON.stringify(volumnInfo)})`);

                    } else {

                        console.log(`Entry is ignored due to missing info (${JSON.stringify(volumnInfo)})`);
                    }

                });

                resolve(mappedResult);
            })
            .catch(function (err) {
                console.log(err.stack);
                reject(err);
            });
    });

};

const getAllBookInfos = (authors, callback) => {

    const promises = [];

    _.forEach(authors, (author) => {
        promises.push(getBookInfoByAuthor(author));
    });

    Promise.all(promises).then((promiseRes) => {
        callback(null, promiseRes);
    }).catch((error) => {
        console.log(error.stack);
        callback(error, null);
    });


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
};

const test = () => {
    return new Promise((res, rej) => {
        res([])
    });
};

const getPagedBookInfoByAuthor = (author) => {

    let totalCount = 0;
    let index = 0;
    const totalBookList = [];

    // ループ処理の完了を受け取るPromise
    return new Promise(function (res, rej) {
        // ループ処理（再帰的に呼び出し）
        function loop(index) {
            // 非同期処理なのでPromiseを利用
            return new Promise(function (resolve, reject) {
                // 非同期処理部分
                getBookInfoByIndexAsAsync(author, index).then((bookInfo) => {
                    resolve(bookInfo);
                });
                // test(author, index).then((bookInfo) => {
                //     resolve(bookInfo);
                // });
            })
                .then(function (bookInfo) {

                    totalCount += bookInfo.length;
                    totalBookList.push(...bookInfo);
                    // ループを抜けるかどうかの判定
                    if (totalCount >= 1 || bookInfo.length <= 0) {
                        // 抜ける（外側のPromiseのresolve判定を実行）
                        res(totalBookList);
                    } else {
                        console.log(`Looped again for ${author}`);
                        index += 40;
                        // 再帰的に実行
                        loop(index);
                    }
                });
        }

        // 初回実行
        loop(index);
    })
};

const getBookInfoByAuthor = (author) => {

    return new Promise((resolve, reject) => {
        getPagedBookInfoByAuthor(author)
            .then((totalBookList) => {
                resolve(totalBookList)
            }).catch((err)=> {
                reject(err);
            });
    });


};


//module.exports.getBookInfo = getBookInfo;
module.exports.getAllBookInfos = getAllBookInfos;
