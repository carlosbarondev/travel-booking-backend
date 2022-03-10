const { response, request } = require('express');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const validateJWT = async (req = request, res = response, next) => {

    // x-token headers
    const token = req.header('x-token');

    if (!token) {
        return res.status(401).json({
            msg: 'There is no token in the request'
        });
    }

    try {

        const { uid, name, email, role, img, state } = jwt.verify(token, process.env.SECRETORPRIVATEKEY); // Si falla dispara el catch y no ejecuta el next()

        // Leer el usuario que corresponde al uid
        const user = await User.findById(uid);

        if (!user) {
            return res.status(401).json({
                msg: 'Invalid token - user does not exist in DB'
            })
        }

        // Verificar si el uid tiene estado=true(si no esta borrado)
        if (!user.estado) {
            return res.status(401).json({
                msg: 'Invalid token - user with state: false'
            })
        }

        req.user = user; // Graba la propiedad en la request y se la pasa por referencia a los demas validadores(check)¡¡¡¡¡¡¡¡¡¡
        req.uid = uid;
        req.name = name;
        req.email = email;
        req.role = role;
        req.img = img;
        req.state = state;

        next();

    } catch (error) {
        console.log(error);
        res.status(401).json({
            msg: 'Invalid token'
        })
    }
}

module.exports = {
    validateJWT
}