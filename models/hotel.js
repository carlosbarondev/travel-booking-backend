const { Schema, model } = require('mongoose');

const HotelSchema = Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        unique: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
    },
    city: {
        type: String,
        required: [true, 'City is required'],
    },
    img: {
        type: String
    },
    rooms: [
        {
            name: {
                type: String,
                required: [true, 'Name is required'],
            },
            description: {
                type: String,
                required: [true, 'Description is required'],
            },
            category: {
                type: String,
                required: [true, 'Category is required'],
            },
            capacity: {
                type: Number,
                required: [true, 'Capacity is required'],
            },
            price: {
                type: Number,
                required: [true, 'Price is required'],
            },
        }
    ],
    rating: {
        type: Number
    },
    state: {
        type: Boolean,
        default: true
    },
    disable: {
        type: Boolean,
        default: true
    },
    comments: [
        {
            title: {
                type: String,
                required: [true, 'Title is required'],
            },
            text: {
                type: String,
                required: [true, 'Text is required'],
            },
            rating: {
                type: Number,
                required: [true, 'Rating is required'],
            },
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: [true, 'User is required']
            },
            date: {
                type: Date,
                required: [true, 'Date is required'],
            },
        }
    ]
});

HotelSchema.post('findOneAndUpdate', async function (doc) { // Actualiza el rating al insertar opiniones de los usuarios

    let r = 0;

    doc.comments.map(op => (
        r += op.rating
    ));

    r = r / doc.comments.length;

    if (isNaN(r)) {
        r = 0;
    }

    doc.rating = r;
    doc.save();

});

module.exports = model('Hotel', HotelSchema);