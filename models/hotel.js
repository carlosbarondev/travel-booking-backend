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
    stars: {
        type: Number,
        required: [true, 'Stars is required'],
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
    doubleRoom: {
        name: {
            type: String,
            required: [true, 'Name is required'],
            default: "Doble"
        },
        img: {
            type: String,
            default: ""
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            default: "0"
        }
    },
    familyRoom: {
        name: {
            type: String,
            required: [true, 'Name is required'],
            default: "Familiar"
        },
        img: {
            type: String,
            default: ""
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            default: "0"
        }
    },
    suiteRoom: {
        name: {
            type: String,
            required: [true, 'Name is required'],
            default: "Suite"
        },
        img: {
            type: String,
            default: ""
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            default: "0"
        }
    },
    rooms: [
        {
            idRoom: {
                type: String,
                required: [true, 'idRoom is required'],
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