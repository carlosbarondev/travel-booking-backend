const { response, request } = require("express");
const bcryptjs = require('bcryptjs');

const User = require('../models/user');

const { generateJWT } = require("../helpers/generate-jwt");

const login = async (req = request, res = response) => {

    const { email, password } = req.body;

    try {

        const user = await User.findOne({ email: email });

        // Verificar si el email existe
        if (!user) {
            return res.status(400).json({
                msg: 'Email is not registered'
            });
        }

        // Verificar si el usuario no está activo
        if (!user.estado) {
            return res.status(400).json({
                msg: 'User has been deleted'
            });
        }

        // Verificar la contraseña
        const validPassword = bcryptjs.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(400).json({
                msg: 'The password is not correct'
            });
        }

        // Generar JWT
        const token = await generateJWT(user._id, user.name, user.email, user.role, user.img, user.state);

        res.json({
            user,
            token
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Contact the administrator'
        })
    }
}

const revalidarToken = async (req, res = response) => {

    const { uid, name, email, role, img, state } = req;

    // Generar JWT
    const token = await generateJWT(uid, name, email, role, img, state);

    res.json({
        ok: true,
        uid,
        name,
        email,
        role,
        img,
        state,
        token
    });

}

module.exports = {
    login,
    revalidarToken,
}