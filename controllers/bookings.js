const { response } = require("express");

const Booking = require("../models/booking");

const obtenerPedidosUsuario = async (req = request, res = response) => {

    const { id } = req.params;

    //Validar el usuario a eliminar respecto el usuario que viene en el JWT
    if (id !== req.uid) {
        return res.status(401).json({
            ok: false,
            msg: 'No tiene privilegios para ver este usuario'
        });
    }

    // const { limite = 5, desde = 0 } = req.query;
    const query = { usuario: id }

    const [total, pedidos] = await Promise.all([
        Pedido.countDocuments(query),
        Pedido.find(query)
            .populate({
                path: 'producto',
                populate: {
                    path: 'producto',
                    populate: {
                        path: 'categoria subcategoria'
                    }
                },
            })
        // .skip(Number(desde))
        // .limit(Number(limite))
    ]);

    res.json({
        total,
        pedidos
    });
}

const bookingPost = async (req, res = response) => {

    const { idBooking, user, booking, date, billing, payment_method, digits, total } = req.body;

    const newBooking = new Booking({ idBooking, user, hotel: booking.idHotel, booking, date, billing, payment_method, digits, total });

    // Guardar en la base de datos
    await newBooking.save();

    const bookingSend = await Booking.findById(newBooking._id)
        .populate("user hotel")

    res.status(201).json(bookingSend);

}

module.exports = {
    obtenerPedidosUsuario,
    bookingPost,
}