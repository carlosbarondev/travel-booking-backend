const { Schema, model } = require('mongoose');

const RoomSchema = Schema({
    roomId: {
        type: String,
        required: [true, 'roomId is required'],
    },
    hotel: {
        type: Schema.Types.ObjectId,
        ref: 'Hotel'
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
    },
    state: {
        type: Boolean,
        default: true
    },
    disable: {
        type: Boolean,
        default: true
    },
});

module.exports = model('Room', RoomSchema);