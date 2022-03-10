const { Schema, model } = require('mongoose');

const UserSchema = Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    phone: {
        type: Number,
    },
    billing: { // Dirección de facturación
        city: {
            type: String,
            required: [true, 'City is required']
        },
        country: {
            type: String,
            required: [true, 'Country is required']
        },
        line1: {
            type: String,
            required: [true, 'Line1 is required']
        },
        line2: {
            type: String,
            required: [true, 'Line2 is required']
        },
        postal_code: {
            type: Number,
            required: [true, 'Postal_code is required']
        },
        state: {
            type: String,
            required: [true, 'State is required']
        },
    },
    img: {
        type: String,
    },
    role: {
        type: String,
        required: true,
        enum: ['ADMIN_ROLE', 'USER_ROLE'],
        default: 'USER_ROLE'
    },
    state: {
        type: Boolean,
        default: true
    },
    disable: {
        type: Boolean,
        default: true
    }
});

module.exports = model('User', UserSchema);