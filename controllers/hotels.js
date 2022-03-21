const mongoose = require('mongoose');
const { response } = require("express");

const Booking = require("../models/booking");
const Hotel = require("../models/hotel");
const Room = require("../models/room");

const hotelsGet = async (req = request, res = response) => {

    const { from = 0, limit = 50, visible = `{ "state": "true" }`, order = "-rating", from_date, to_date } = req.query;

    const [total, hotels] = await Promise.all([
        Hotel.countDocuments(JSON.parse(visible)),
        Hotel.find(JSON.parse(visible))
            .sort(order)
            .skip(Number(from))
            .limit(Number(limit))
    ]);

    const bookings = await Booking // Habitaciones disponibles en la fecha dada
        .find({
            $or: [
                {
                    start: { $gte: from_date, $lte: to_date }
                },
                {
                    end: { $gte: from_date, $lte: to_date }
                },
                {
                    $and: [
                        { start: { $lte: from_date } },
                        { end: { $gte: to_date } }
                    ]
                },
            ],
        })
        .select('room');

    const roomIds = bookings.map(b => b.room);

    const availableRooms = await Room
        .find({ _id: { $nin: roomIds } })
        .populate("hotel")
        .select('hotel');

    // Filtrar por hotel
    const hotelIds = availableRooms.map(b => b.hotel);

    const availableHotels = [...new Map(hotelIds.slice().reverse().map(v => [v.name, v])).values()].reverse();

    res.json({
        total,
        hotels,
        availableHotels
    });
}

const hotelGet = async (req = request, res = response) => {

    const { id } = req.params;
    const { from_date, to_date } = req.query;

    let query;

    if (mongoose.isValidObjectId(id)) { // El id puede ser un id de Mongo o el nombre del hotel
        query = { "_id": id }
    } else {
        query = { "name": id.replace(/-/g, ' ') }
    }

    const hotel = await Hotel.findOne(query)
        .collation({ locale: "es", strength: 1 })
        .populate("comments.user")

    if (hotel) {
        if (hotel.length === 0) {
            return res.status(400).json({
                msg: `El hotel no existe`
            });
        }
    } else {
        return res.status(400).json({
            msg: `El hotel no ha sido encontrado`
        });
    }

    const bookings = await Booking // Habitaciones disponibles en la fecha dada
        .find({
            $or: [
                {
                    start: { $gte: from_date, $lte: to_date }
                },
                {
                    end: { $gte: from_date, $lte: to_date }
                },
                {
                    $and: [
                        { start: { $lte: from_date } },
                        { end: { $gte: to_date } }
                    ]
                },
            ],
        })
        .select('room');

    const roomIds = bookings.map(b => b.room);

    const availableRooms = await Room
        .find({ _id: { $nin: roomIds } })
        .where('hotel').equals(hotel._id) // Filtrar por hotel

    res.json({
        hotel,
        availableRooms
    });
}

const obtenerMejoresProductosCategoria = async (req = request, res = response) => {

    const { desde = 0, limite = 50, visibles = true, categoria, ordenar } = req.query;

    try {

        const idProducto = await Categoria.findOne({ nombre: categoria });

        const productos = await Producto.find({ categoria: idProducto._id, estado: visibles })
            .collation({ locale: "es", strength: 1 })
            .sort(ordenar)
            .skip(Number(desde))
            .limit(Number(limite))
            .populate("categoria subcategoria");

        res.json({
            productos
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            msg: error
        });
    }

}

const hotelPost = async (req, res = response) => {

    const { name, stars, description, country, city } = req.body;

    const hotel = new Hotel({ name, stars, description, country, city });

    // Guardar en la base de datos
    await hotel.save();

    res.status(201).json(hotel);

};

const hotelUpdate = async (req = request, res = response) => {

    const { id } = req.params;
    const { name, stars, description, country, city, img, state, room, roomOp, idRoom, category, oldIdRoom, updateRoom, doublePrice, familyPrice, suitePrice, date } = req.body;

    if (room) { // Habilitar o deshabilitar una habitación
        await Hotel.findOneAndUpdate({ "rooms.idRoom": room }, { $set: { 'rooms.$.state': roomOp } });
    }

    let hotel;

    if (idRoom) { // Si se recibe idRoom se esta creando/actualizando una habitación
        if (updateRoom) { // Actualizar habitación
            hotel = await Hotel.findOneAndUpdate({ "rooms.idRoom": oldIdRoom }, { $set: { 'rooms.$.idRoom': idRoom, 'rooms.$.category': category } }, { new: true });
        } else if (!updateRoom && !date) { // Crear habitación
            const add = { "idRoom": idRoom, "category": category }
            hotel = await Hotel.findByIdAndUpdate(id, { $push: { rooms: add } }, { new: true });
        } else { // Actualizar habitación con la fecha de la reserva
            hotel = await Hotel.findOneAndUpdate({ "rooms.idRoom": idRoom }, { $set: { 'rooms.$.date': date } }, { new: true });
        }
    } else {
        hotel = await Hotel.findByIdAndUpdate(
            id,
            {
                name,
                stars,
                description,
                country,
                city,
                img,
                state,
                $set: { "doubleRoom.price": doublePrice, "familyRoom.price": familyPrice, "suiteRoom.price": suitePrice },
            },
            { new: true });
    }

    res.json(hotel);
}

const hotelDelete = async (req = request, res = response) => {

    const { id } = req.params;

    // Borrado fisico
    // const hotel = await Hotel.findByIdAndDelete(id);

    const hotel = await Hotel.findByIdAndUpdate(id, { state: false }, { new: true });

    res.json({
        hotel
    });
}

const userCommentsGet = async (req = request, res = response) => {

    const { id } = req.params;

    //Validar el usuario a consultar respecto el usuario que viene en el JWT
    if (id !== req.uid) {
        return res.status(401).json({
            ok: false,
            msg: 'No tiene privilegios para ver este usuario'
        });
    }

    const valued = await Hotel.find({ "comments.user": id }, { "name": 1, "img": 1, "comments.$": 1 })
        .populate("comments.user");

    const noOpinion = await Hotel.find({ "comments.user": { $nin: id } }).populate("comments.user");

    const notValued = [];

    for (const hotel of noOpinion) {
        const bookings = await Booking.find({ "user": id, "hotel": { $in: [hotel._id] } });
        if (bookings.length > 0) {
            notValued.push(hotel)
        }
    }

    res.json({
        valued,
        notValued
    });
}

const userCommentPost = async (req, res = response) => {

    const { id } = req.params;
    const { title, text, rating, user, date } = req.body;

    let hotel;

    const existsComment = await Hotel.findOne({ _id: id, "comments.user": user });

    if (existsComment) { // Si el usuario ya tiene un comentario en el producto lo actualiza
        hotel = await Hotel.findOneAndUpdate({ _id: id, "comments.user": user }, { '$set': { "comments.$.title": title, "comments.$.text": text, "comments.$.rating": rating, "comments.$.user": user, "comments.$.date": date } }, { new: true }); // new devuelve la respuesta actualizada
    } else { // Si el usuario no tiene un comentario en el producto lo añade
        hotel = await Hotel.findByIdAndUpdate(id, { $push: { "comments": { title, text, rating, user, date } } }, { new: true }); // new devuelve la respuesta actualizada
    }

    res.json(hotel);

}

const userCommentDelete = async (req = request, res = response) => {

    const { id } = req.params;
    const { idHotel, idComment } = req.body;

    //Validar el usuario a eliminar respecto el usuario que viene en el JWT
    if (id !== req.uid) {
        return res.status(401).json({
            ok: false,
            msg: 'No tiene privilegios para eliminar el comentario del usuario'
        });
    }

    // Borrado fisico
    const commentDeleted = await Hotel.findOneAndUpdate({ "_id": idHotel }, { $pull: { comments: { _id: idComment } } }, { new: true });

    res.json({
        commentDeleted
    });
}

module.exports = {
    hotelsGet,
    hotelGet,
    obtenerMejoresProductosCategoria,
    hotelPost,
    hotelUpdate,
    hotelDelete,
    userCommentsGet,
    userCommentPost,
    userCommentDelete
}