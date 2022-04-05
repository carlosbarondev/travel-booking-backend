const { request, response } = require('express');
const bcryptjs = require('bcryptjs');

const User = require('../models/user');
const Hotel = require('../models/hotel');
const { generateJWT } = require('../helpers/generate-jwt');

const cloudinary = require('cloudinary').v2
cloudinary.config(process.env.CLOUDINARY_URL);

const usersGet = async (req = request, res = response) => {

    const { limit = 50, from = 0, role = "USER_ROLE" } = req.query;

    const query = { role }

    const [total, users] = await Promise.all([
        User.countDocuments(query),
        User.find(query)
            .skip(Number(from))
            .limit(Number(limit))
    ]);

    res.json({
        total,
        users
    });
}

const userGetId = async (req = request, res = response) => {

    const query = { _id: req.params.id, estado: true }

    //Validar el usuario a modificar respecto el usuario que viene en el JWT
    if (req.params.id !== req.uid) {
        return res.status(401).json({
            ok: false,
            msg: 'No tiene privilegios para editar este usuario'
        });
    }

    const user = await User.findOne(query);

    res.json({
        user
    });
}

const userPost = async (req = request, res = response) => {

    const { name, email, password } = req.body;
    const user = new User({ name, email, password });

    // Encriptar la contraseña
    const salt = bcryptjs.genSaltSync();
    user.password = bcryptjs.hashSync(password, salt);

    // Guardar en la base de datos
    await user.save();

    res.status(201).json({
        user
    });

}

const userPut = async (req = request, res = response) => {

    const { id } = req.params;
    const {
        name,
        email,
        password,
        state,
        oldEmail,
        img,
        billing,
        phone
    } = req.body;

    //Validar el usuario a modificar respecto el usuario que viene en el JWT o es un Administrador
    if (id !== req.uid && req.role !== "ADMIN_ROLE") {
        return res.status(401).json({
            ok: false,
            msg: 'No tiene privilegios para editar este usuario'
        });
    }

    if (email) {
        const checkEmail = await User.findOne({ "email": email });
        if (checkEmail && oldEmail !== email) {
            return res.status(401).json({
                ok: false,
                msg: 'El correo ya existe en la base da datos'
            });
        }
    }

    // Encriptar la contraseña
    let salt;
    let newPassword;

    if (password) {
        salt = bcryptjs.genSaltSync();
        newPassword = bcryptjs.hashSync(password, salt);
    }

    // Borrar la imagen de la nube
    if (img === "") {
        const checkImg = await User.findById(id);
        const nameArr = checkImg.img.split('/');
        const name = nameArr[nameArr.length - 1];
        const [public_id] = name.split('.');
        cloudinary.uploader.destroy(`travel-booking/users/${public_id}`);
    }

    // Actualizar la base de datos
    const user = await User.findByIdAndUpdate(id, { name, email, password: newPassword, state, img, billing, phone }, { new: true });

    // Actualizar el token del usuario en su navegador para sincronizar los datos correctamente
    if (req.role === "USER_ROLE") {
        const token = await generateJWT(user._id, user.name, user.email, user.role, user.img, user.state);
        return res.json({
            user,
            token
        });
    }

    res.json(user);
}

const userDelete = async (req = request, res = response) => {

    const { id } = req.params;

    // Borrado fisico
    // const user = await User.findByIdAndDelete(id);

    const user = await User.findByIdAndUpdate(id, { state: false }, { new: true });

    res.json({
        user
    });
}

module.exports = {
    usersGet,
    userGetId,
    userPost,
    userPut,
    userDelete
}