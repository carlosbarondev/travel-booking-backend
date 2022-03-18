const Hotel = require("../models/hotel");
const Room = require("../models/room");
const User = require("../models/user");

const emailExists = async (email = '') => {
    const exists = await User.findOne({ email });
    if (exists) {
        throw new Error(`The email ${email} is already registered`)
    }
}

const existsUserId = async (id) => {
    const existsUser = await User.findById(id);
    if (!existsUser) {
        throw new Error(`El id ${id} no existe`)
    }
}

const existsHotelId = async (id) => {
    const existsHotel = await Hotel.findById(id);
    if (!existsHotel) {
        throw new Error(`El id ${id} no existe`)
    }
}

const existsRoomId = async (id) => {
    const existsRoom = await Room.findById(id);
    if (!existsRoom) {
        throw new Error(`El id ${id} no existe`)
    }
}

const allowedCollections = (collection = '', collections = []) => {
    const included = collections.includes(collection);
    if (!included) {
        throw new Error(`La colección ${collection} no es permitida, ${collections}`);
    }
    return true;
}

module.exports = {
    emailExists,
    existsUserId,
    existsHotelId,
    existsRoomId,
    allowedCollections
}