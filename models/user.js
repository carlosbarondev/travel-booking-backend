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
            type: String
        },
        country: {
            type: String
        },
        line1: {
            type: String
        },
        line2: {
            type: String
        },
        postal_code: {
            type: Number
        },
        state: {
            type: String
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