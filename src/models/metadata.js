import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const MetadataCacheSchema = new Schema({
    id: String,
    result: {type: Schema.Types.Mixed},
}, {
    strict: false,
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

const MetadataCache = mongoose.model('MetadataCache', MetadataCacheSchema, 'metadata');

module.exports.MetadataCache = MetadataCache;
