const { response } = require("express");
const Hotel = require('../models/hotel');

// This is your test secret API key.
const stripe = require("stripe")('sk_test_51KZH9rK7t3f78Hp2Sj9HgTLXEEyWS96I0oFhlwdwoxgKyXozBrLc1cISNpRFfcGdd1b9I8Vj5vm3fGqQsAXtZQPu002SQ6SeCA');

const calculateOrderAmount = (items) => {

    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    const { days, adults, children, roomType, food, parking } = items;
    return days * ((roomType?.price ? roomType?.price : 0) + ((adults + children) * (food?.price ? food?.price : 0))) + (parking?.price ? parking?.price : 0);

};

const userGet = async (req, res = response) => {

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

const paymentGet = async (req, res = response) => {

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

const paymentPost = async (req, res = response) => {

    const { id } = req.params;
    const { email, name, phone, billing, idHotel, items } = req.body;

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
                    city: billing.city,
                    country: billing.country,
                    line1: billing.line1,
                    line2: billing.line2,
                    postal_code: billing.postal_code,
                    state: billing.state,
                },
                email: email,
                name: name,
                phone: phone,
            });

        }

        // El cliente existe y se actualiza con los datos del envio
        customer = await stripe.customers.update(id, {
            address: {
                city: billing.city,
                country: billing.country,
                line1: billing.line1,
                line2: billing.line2,
                postal_code: billing.postal_code,
                state: billing.state,
            },
            email: email,
            name: name,
            phone: phone,
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

        // Actualiza las reservas totales del hotel
        await Hotel.findByIdAndUpdate(idHotel, { $inc: { "bookings": 1 } });

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
    userGet,
    paymentGet,
    paymentPost,
}