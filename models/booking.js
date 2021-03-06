const { Schema, model } = require('mongoose');

const BookingSchema = Schema({
    idBooking: {
        type: String,
        required: [true, 'idBooking is required'],
        unique: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    hotel:
    {
        type: Schema.Types.ObjectId,
        ref: 'Hotel'
    },
    booking: {},
    date: {
        type: Date,
        required: [true, 'Date is required'],
    },
    billing: {},
    payment_method: {
        type: String,
        required: [true, 'Payment method is required'],
    },
    digits: {
        type: String,
        required: [true, 'Digits is required'],
    },
    total: {
        type: Number,
        required: [true, 'Total is required'],
    },
    room: {
        type: Schema.Types.ObjectId,
        ref: 'Room'
    },
    start: {
        type: Date,
    },
    end: {
        type: Date,
    }
});

module.exports = model('Booking', BookingSchema);