const { response } = require("express");

const Booking = require("../models/booking");

const bookingsGet = async (req = request, res = response) => {

    const { id } = req.params;

    //Validar el usuario a eliminar respecto el usuario que viene en el JWT
    if (id !== req.uid) {
        return res.status(401).json({
            ok: false,
            msg: 'No tiene privilegios para ver este usuario'
        });
    }

    const query = { user: id }

    const [total, bookings] = await Promise.all([
        Booking.countDocuments(query),
        Booking.find(query)
            .populate("user hotel")
    ]);

    res.json({
        total,
        bookings
    });
}

const bookingPost = async (req, res = response) => {

    const { idBooking, user, booking, date, billing, payment_method, digits, total, room, start, end } = req.body;

    const newBooking = new Booking({ idBooking, user, hotel: booking.idHotel, booking, date, billing, payment_method, digits, total, room, start, end });

    // Guardar en la base de datos
    await newBooking.save();

    const bookingSend = await Booking.findById(newBooking._id)
        .populate("user hotel room")

    res.status(201).json(bookingSend);

}

module.exports = {
    bookingsGet,
    bookingPost,
}