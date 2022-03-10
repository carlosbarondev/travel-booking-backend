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

const crearPedido = async (req, res = response) => {

    const { idPedido, usuario, producto, fecha, direccionEnvio, direccionFacturacion, metodoPago, digitos, total } = req.body;

    const pedido = new Pedido({ idPedido, usuario, producto, fecha, direccionEnvio, direccionFacturacion, metodoPago, digitos, total });

    // Guardar en la base de datos
    await pedido.save();

    const pedidoEnviar = await Pedido.findById(pedido._id)
        .populate({
            path: 'producto',
            populate: {
                path: 'producto',
                populate: {
                    path: 'categoria subcategoria'
                }
            },
        })

    res.status(201).json(pedidoEnviar);

}


module.exports = {
    obtenerPedidosUsuario,
    crearPedido,
}