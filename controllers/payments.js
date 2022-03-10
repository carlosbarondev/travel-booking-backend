const { response } = require("express");
const Hotel = require('../models/hotel');

// This is your test secret API key.
const stripe = require("stripe")('sk_test_51KZH9rK7t3f78Hp2Sj9HgTLXEEyWS96I0oFhlwdwoxgKyXozBrLc1cISNpRFfcGdd1b9I8Vj5vm3fGqQsAXtZQPu002SQ6SeCA');

const calculateOrderAmount = (items) => {

    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    return parseFloat((Math.round((items.reduce((n, { unidades, producto }) => n + unidades * producto.precio * 100, 0) * 1000) / 10) / 100).toFixed(2));

};

const mostrarUsuario = async (req, res = response) => {

    const { id } = req.params;

    try {

        customer = await stripe.customers.retrieve(id);

        res.send({
            customer
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: error.message
        });
    }

}

const mostrarPago = async (req, res = response) => {

    const { payment_intent } = req.params;

    try {

        const paymentIntent = await stripe.paymentIntents.retrieve(
            payment_intent
        );

        res.send({
            paymentIntent
        });

    } catch (error) {
        return res.status(500).json({
            msg: error.message
        });
    }

}

const crearPago = async (req, res = response) => {

    const { id } = req.params;
    const { correo, direccion, items } = req.body;

    // Alternatively, set up a webhook to listen for the payment_intent.succeeded event
    // and attach the PaymentMethod to a new Customer
    let customer;

    try { // Si el cliente ya esta registrado se cargan sus datos

        try {

            customer = await stripe.customers.retrieve(id);

        } catch { // Si el cliente no esta registrado se crea

            customer = await stripe.customers.create({
                id: id,
                address: {
                    city: direccion.facturacion.poblacion,
                    country: direccion.facturacion.pais,
                    line1: direccion.facturacion.calle,
                    line2: direccion.facturacion.numero,
                    postal_code: direccion.facturacion.codigo,
                    state: direccion.facturacion.provincia
                },
                email: correo,
                name: direccion.direccion.nombre,
                phone: direccion.direccion.telefono,
                shipping: {
                    address: {
                        city: direccion.direccion.direccion.poblacion,
                        country: direccion.direccion.direccion.pais,
                        line1: direccion.direccion.direccion.calle,
                        line2: direccion.direccion.direccion.numero,
                        postal_code: direccion.direccion.direccion.codigo,
                        state: direccion.direccion.direccion.provincia
                    },
                    name: direccion.direccion.nombre,
                    phone: direccion.direccion.telefono
                }
            });

        }

        // El cliente existe y se actualiza con los datos del envio
        customer = await stripe.customers.update(id, {
            address: {
                city: direccion.facturacion.poblacion,
                country: direccion.facturacion.pais,
                line1: direccion.facturacion.calle,
                line2: direccion.facturacion.numero,
                postal_code: direccion.facturacion.codigo,
                state: direccion.facturacion.provincia
            },
            email: correo,
            name: direccion.direccion.nombre,
            phone: direccion.direccion.telefono,
            shipping: {
                address: {
                    city: direccion.direccion.direccion.poblacion,
                    country: direccion.direccion.direccion.pais,
                    line1: direccion.direccion.direccion.calle,
                    line2: direccion.direccion.direccion.numero,
                    postal_code: direccion.direccion.direccion.codigo,
                    state: direccion.direccion.direccion.provincia
                },
                name: direccion.direccion.nombre,
                phone: direccion.direccion.telefono
            }
        });

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            customer: customer.id,
            setup_future_usage: "off_session",
            amount: calculateOrderAmount(items),
            currency: "eur",
            automatic_payment_methods: {
                enabled: true,
            },
        });

        for (const item of items) { // Actualiza las unidades vendidas de una determinada categoría y producto
            await Categoria.findByIdAndUpdate({ "_id": item.producto.categoria._id }, { $inc: { "vendidos": item.unidades } });
            await Producto.findByIdAndUpdate({ "_id": item.producto._id }, { $inc: { "vendido": item.unidades, "stock": -item.unidades } });
        }

        res.send({
            clientSecret: paymentIntent.client_secret,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: error.message
        });
    }

};

module.exports = {
    mostrarUsuario,
    mostrarPago,
    crearPago,
}