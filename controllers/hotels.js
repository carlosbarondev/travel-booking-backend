const mongoose = require('mongoose');
const { response } = require("express");

const Hotel = require("../models/hotel");
const Booking = require("../models/booking");

const hotelsGet = async (req = request, res = response) => {

    const { from = 0, limit = 50, visible = `{ "state": "true" }`, order = "-rating" } = req.query;

    const [total, hotels] = await Promise.all([
        Hotel.countDocuments(JSON.parse(visible)),
        Hotel.find(JSON.parse(visible))
            .sort(order)
            .skip(Number(from))
            .limit(Number(limit))
    ]);

    res.json({
        total,
        hotels
    });
}

const hotelGet = async (req = request, res = response) => {

    const { id } = req.params;

    let query;

    if (mongoose.isValidObjectId(id)) { // El id puede ser un id de Mongo o el nombre del producto
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

    res.json({
        hotel
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
    const { name, stars, description, country, city, img, state, room, roomOp, idRoom, category, oldIdRoom, updateRoom, doublePrice, familyPrice, suitePrice } = req.body;

    if (room) { // Habilitar o deshabilitar una habitación
        await Hotel.findOneAndUpdate({ "rooms.idRoom": room }, { $set: { 'rooms.$.state': roomOp } });
    }

    let hotel;

    if (idRoom) { // Si se recibe idRoom se esta creando/actualizando una habitación
        if (updateRoom) { //Actualizar o crear habitación
            hotel = await Hotel.findOneAndUpdate({ "rooms.idRoom": oldIdRoom }, { $set: { 'rooms.$.idRoom': idRoom, 'rooms.$.category': category } }, { new: true });
        } else {
            const add = { "idRoom": idRoom, "category": category }
            hotel = await Hotel.findByIdAndUpdate(id, { $push: { rooms: add } }, { new: true });
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

const obtenerComentarioProducto = async (req = request, res = response) => {

    const { id } = req.params;

    //Validar el usuario a consultar respecto el usuario que viene en el JWT
    if (id !== req.uid) {
        return res.status(401).json({
            ok: false,
            msg: 'No tiene privilegios para ver este usuario'
        });
    }

    const valorados = await Producto.find({ "opinion.usuario": id }, { "nombre": 1, "categoria": 1, "subcategoria": 1, "img": 1, "opinion.$": 1 })
        .populate("subcategoria categoria");

    const productosSinOpinionUsuario = await Producto.find({ "opinion.usuario": { $nin: id } }).populate("subcategoria categoria");

    const noValorados = [];

    for (const producto of productosSinOpinionUsuario) {
        const pedidos = await Pedido.find({ "usuario": id, "producto.producto": { $in: [producto._id] } });
        if (pedidos.length > 0) {
            noValorados.push(producto)
        }
    }

    res.json({
        valorados,
        noValorados
    });
}

const crearComentarioProducto = async (req, res = response) => {

    const { id } = req.params;
    const { titulo, comentario, rating, usuario, fecha } = req.body;

    let producto;

    const existeComentario = await Producto.findOne({ _id: id, "opinion.usuario": usuario });

    if (existeComentario) { // Si el usuario ya tiene un comentario en el producto lo actualiza
        producto = await Producto.findOneAndUpdate({ _id: id, "opinion.usuario": usuario }, { '$set': { "opinion.$.titulo": titulo, "opinion.$.comentario": comentario, "opinion.$.rating": rating, "opinion.$.usuario": usuario, "opinion.$.fecha": fecha } }, { new: true }); // new devuelve la respuesta actualizada
    } else { // Si el usuario no tiene un comentario en el producto lo añade
        producto = await Producto.findByIdAndUpdate(id, { $push: { "opinion": { titulo, comentario, rating, usuario, fecha } } }, { new: true }); // new devuelve la respuesta actualizada
    }

    res.json(producto);

}

// borrarProducto - estado: false
const borrarComentarioProducto = async (req = request, res = response) => {

    const { id } = req.params;
    const { idProducto, idComentario } = req.body;

    //Validar el usuario a eliminar respecto el usuario que viene en el JWT
    if (id !== req.uid) {
        return res.status(401).json({
            ok: false,
            msg: 'No tiene privilegios para eliminar el comentario del usuario'
        });
    }

    // Borrado fisico
    const comentarioBorrado = await Producto.findOneAndUpdate({ "_id": idProducto }, { $pull: { opinion: { _id: idComentario } } }, { new: true });

    res.json({
        comentarioBorrado
    });
}

module.exports = {
    hotelsGet,
    hotelGet,
    obtenerMejoresProductosCategoria,
    hotelPost,
    hotelUpdate,
    hotelDelete,
    obtenerComentarioProducto,
    crearComentarioProducto,
    borrarComentarioProducto
}