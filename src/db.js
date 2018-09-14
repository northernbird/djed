import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');

export default callback => {

    mongoose.connect('mongodb://localhost:27017/djed', {
        server: {
            poolSize: 50,
            autoReconnect: true,
            reconnectTries: 30,
            connectTimeoutMS: 30000,
            socketTimeoutMS: 30000,
            reconnectInterval: 1000,
        },
    });

    mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
    mongoose.connection.on('open', function () {
        // we're connected!
        console.log("we're connected!");
        callback();
    });


    // const db = mongoose.connection;
    // // connect to a database if needed, then pass it to `callback`:
    // db.on('error', console.error.bind(console, 'connection error:'));
    // db.once('open', function() {
    //     // we're connected!
    //     console.log("we're connected!");
    //     callback();
    // });

}
