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
                msg: 'El correo no está registrado'
            });
        }

        // Verificar si el usuario no está activo
        if (!user.state) {
            return res.status(400).json({
                msg: 'El usuario ha sido eliminado'
            });
        }

        // Verificar la contraseña
        const validPassword = bcryptjs.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(400).json({
                msg: 'La contraseña no es correcta'
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
            msg: 'Contacta con el administrador'
        })
    }
}

const revalidateToken = async (req, res = response) => {

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
    revalidateToken,
}