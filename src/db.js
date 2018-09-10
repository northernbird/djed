import mongoose from 'mongoose';

export default callback => {

    mongoose.connect('mongodb://localhost/test');

    const db = mongoose.connection;
    // connect to a database if needed, then pass it to `callback`:
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        // we're connected!
        console.log("we're connected!");
        callback();
    });

}
