const mongoose = require('mongoose');
const { response } = require("express");

const Room = require("../models/room");

const roomsGet = async (req = request, res = response) => {

    const { from = 0, limit = 50, visible = `{ "state": "true" }` } = req.query;

    const [total, rooms] = await Promise.all([
        Room.countDocuments(JSON.parse(visible)),
        Room.find(JSON.parse(visible))
            .skip(Number(from))
            .limit(Number(limit))
    ]);

    res.json({
        total,
        rooms
    });
}

const roomGet = async (req = request, res = response) => {

    const { id } = req.params;

    let query;

    if (mongoose.isValidObjectId(id)) { // El id puede ser un id de Mongo o el nombre de la habitación
        query = { "_id": id }
    } else {
        query = { "roomId": id.replace(/-/g, ' ') }
    }

    const room = await Room.findOne(query)
        .collation({ locale: "es", strength: 1 })

    if (room) {
        if (room.length === 0) {
            return res.status(400).json({
                msg: `La habitación no existe`
            });
        }
    } else {
        return res.status(400).json({
            msg: `La habitación no ha sido encontrada`
        });
    }

    res.json({
        room
    });
}

const roomPost = async (req, res = response) => {

    const { roomId, hotel, category } = req.body;

    const room = new Room({ roomId, hotel, category });

    // Guardar en la base de datos
    await room.save();

    res.status(201).json(room);

};

const roomUpdate = async (req = request, res = response) => {

    const { id } = req.params;
    const { roomId, hotel, category, state } = req.body;

    const room = await Room.findByIdAndUpdate(id, { roomId, hotel, category, state }, { new: true });

    res.json(room);
}

const roomDelete = async (req = request, res = response) => {

    const { id } = req.params;

    // Borrado fisico
    // const room = await Room.findByIdAndDelete(id);

    const room = await Room.findByIdAndUpdate(id, { state: false }, { new: true });

    res.json({
        room
    });
}

module.exports = {
    roomsGet,
    roomGet,
    roomPost,
    roomUpdate,
    roomDelete,
}