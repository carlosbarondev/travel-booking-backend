const { request, response } = require('express');
const bcryptjs = require('bcryptjs');

const User = require('../models/user');
const Hotel = require('../models/hotel');
const { generateJWT } = require('../helpers/generate-jwt');

const cloudinary = require('cloudinary').v2
cloudinary.config(process.env.CLOUDINARY_URL);

const usuariosGet = async (req = request, res = response) => {

    const { limite = 50, desde = 0, rol = "USER_ROLE" } = req.query;

    const query = { rol }

    const [total, usuarios] = await Promise.all([
        Usuario.countDocuments(query),
        Usuario.find(query)
            .skip(Number(desde))
            .limit(Number(limite))
    ]);

    res.json({
        total,
        usuarios
    });
}

const usuariosGetId = async (req = request, res = response) => {

    const query = { _id: req.params.id, estado: true }

    //Validar el usuario a modificar respecto el usuario que viene en el JWT
    if (req.params.id !== req.uid) {
        return res.status(401).json({
            ok: false,
            msg: 'No tiene privilegios para editar este usuario'
        });
    }

    const usuario = await Usuario.findOne(query);

    res.json({
        usuario
    });
}

const usuariosPost = async (req = request, res = response) => {

    const { nombre, correo, password } = req.body;
    const usuario = new Usuario({ nombre, correo, password });

    // Encriptar la contraseña
    const salt = bcryptjs.genSaltSync();
    usuario.password = bcryptjs.hashSync(password, salt);

    // Guardar en la base de datos
    await usuario.save();

    res.status(201).json({
        usuario
    });

}

const usuariosPut = async (req = request, res = response) => {

    const { id } = req.params;
    const { nombre, correo, password, predeterminado, envio, estado, oldCorreo, img } = req.body;

    //Validar el usuario a modificar respecto el usuario que viene en el JWT o es un Administrador
    if (id !== req.uid && req.rol !== "ADMIN_ROLE") {
        return res.status(401).json({
            ok: false,
            msg: 'No tiene privilegios para editar este usuario'
        });
    }

    if (correo) {
        const checkCorreo = await Usuario.findOne({ "correo": correo });
        if (checkCorreo && oldCorreo !== correo) {
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
        const checkImg = await Usuario.findById(id);
        const nombreArr = checkImg.img.split('/');
        const nombre = nombreArr[nombreArr.length - 1];
        const [public_id] = nombre.split('.');
        cloudinary.uploader.destroy(`ecommerce/usuarios/${public_id}`);
    }

    // Actualizar la base de datos
    const usuario = await Usuario.findByIdAndUpdate(id, { nombre, correo, password: newPassword, predeterminado, envio, estado, img }, { new: true });

    // Actualizar el token del usuario en su navegador para sincronizar los datos correctamente
    if (req.rol === "USER_ROLE") {
        const token = await generateJWT(usuario._id, usuario.nombre, usuario.correo, usuario.rol, usuario.img, usuario.estado);
        return res.json({
            usuario,
            token
        });
    }

    res.json(usuario);
}

const usuariosDelete = async (req = request, res = response) => {

    const { id } = req.params;

    // Borrado fisico
    // const usuario = await Usuario.findByIdAndDelete(id);

    const usuario = await Usuario.findByIdAndUpdate(id, { estado: false }, { new: true });

    res.json({
        usuario
    });
}

/*const usuariosPatch = (req = request, res = response) => {
    res.json({
        msg: 'patch API - usuariosPatch',
    });
}*/

const usuariosEnvioGet = async (req = request, res = response) => {

    //Validar el usuario a modificar respecto el usuario que viene en el JWT
    if (req.params.id !== req.uid) {
        return res.status(401).json({
            ok: false,
            msg: 'No tiene privilegios para editar este usuario'
        });
    }

    const query = { _id: req.params.id, estado: true }

    const envio = await Usuario.findById(query, "envio");

    res.send(envio);
}

const usuariosEnvioPost = async (req = request, res = response) => {

    const { id } = req.params;
    const { direccion, nombre, telefono } = req.body;
    const saveEnvio = { direccion, nombre, telefono }

    //Validar el usuario a modificar respecto el usuario que viene en el JWT
    if (id !== req.uid) {
        return res.status(401).json({
            ok: false,
            msg: 'No tiene privilegios para editar este usuario'
        });
    }

    // Actualizar la base de datos
    const usuario = await Usuario.findByIdAndUpdate(id, { $push: { "envio": saveEnvio } }, { new: true });

    res.json(usuario);

}

const usuariosEnvioPut = async (req = request, res = response) => {

    const { id } = req.params;
    const { _id, direccion, nombre, telefono } = req.body;

    //Validar el usuario a modificar respecto el usuario que viene en el JWT
    if (id !== req.uid) {
        return res.status(401).json({
            ok: false,
            msg: 'No tiene privilegios para editar este usuario'
        });
    }

    // Actualizar la base de datos
    const newEnvio = { _id, direccion, nombre, telefono };

    const usuario = await Usuario.findOneAndUpdate({ _id: id },
        { $set: { "envio.$[index]": newEnvio } },
        {
            arrayFilters: [{ "index._id": _id }],
            new: true
        });

    res.json(usuario);

}

const usuariosEnvioDelete = async (req = request, res = response) => {

    const { id } = req.params;
    const { idEnvio } = req.body;

    //Validar el usuario a eliminar respecto el usuario que viene en el JWT
    if (id !== req.uid) {
        return res.status(401).json({
            ok: false,
            msg: 'No tiene privilegios para eliminar este usuario'
        });
    }

    const query = { _id: id, estado: true }

    // Borrado fisico
    const envio = await Usuario.findOneAndUpdate(query, { $pull: { envio: { _id: idEnvio } } }, { new: true });

    res.json({
        envio
    });
}

const usuariosFacturacionGet = async (req = request, res = response) => {

    //Validar el usuario a modificar respecto el usuario que viene en el JWT
    if (req.params.id !== req.uid) {
        return res.status(401).json({
            ok: false,
            msg: 'No tiene privilegios para editar este usuario'
        });
    }

    const query = { _id: req.params.id, estado: true }

    const facturacion = await Usuario.findById(query, "facturacion");

    res.send(facturacion);
}

const usuariosFacturacionPost = async (req = request, res = response) => {

    const { id } = req.params;
    const { poblacion, pais, calle, numero, codigo, provincia } = req.body;
    const saveFacturacion = { poblacion, pais, calle, numero, codigo, provincia }

    //Validar el usuario a modificar respecto el usuario que viene en el JWT
    if (id !== req.uid) {
        return res.status(401).json({
            ok: false,
            msg: 'No tiene privilegios para editar este usuario'
        });
    }

    // Actualizar la base de datos
    const usuario = await Usuario.findByIdAndUpdate(id, { "facturacion": saveFacturacion }, { new: true });

    res.json(usuario);

}

const usuariosFacturacionDelete = async (req = request, res = response) => {

    const { id } = req.params;

    //Validar el usuario a eliminar respecto el usuario que viene en el JWT
    if (id !== req.uid) {
        return res.status(401).json({
            ok: false,
            msg: 'No tiene privilegios para eliminar este usuario'
        });
    }

    const usuario = await Usuario.findByIdAndUpdate(id, { facturacion: null }, { new: true });

    res.json({
        usuario
    });
}

const usuariosDeseosGet = async (req = request, res = response) => {

    const { id } = req.params;

    //Validar el usuario a eliminar respecto el usuario que viene en el JWT
    if (id !== req.uid) {
        return res.status(401).json({
            ok: false,
            msg: 'No tiene privilegios para modificar este usuario'
        });
    }

    const deseos = await Usuario.findOne({ "_id": id })
        .populate({
            path: 'deseos',
            populate: {
                path: 'categoria subcategoria'
            }
        });

    res.json({
        deseos
    });
}

const usuariosDeseosPost = async (req = request, res = response) => {

    const { id } = req.params;

    //Validar el usuario a eliminar respecto el usuario que viene en el JWT
    if (id !== req.uid) {
        return res.status(401).json({
            ok: false,
            msg: 'No tiene privilegios para modificar este usuario'
        });
    }

    const { deseos } = req.body;

    const usuario = await Usuario.findOneAndUpdate({ "_id": id, deseos: { $ne: deseos } }, { $push: { deseos: deseos } }, { new: true });

    res.status(201).json({
        usuario
    });

}

const usuariosDeseosDelete = async (req = request, res = response) => {

    const { id } = req.params;

    //Validar el usuario a eliminar respecto el usuario que viene en el JWT
    if (id !== req.uid) {
        return res.status(401).json({
            ok: false,
            msg: 'No tiene privilegios para eliminar este usuario'
        });
    }

    const { ids } = req.body;

    // Borrado fisico
    const usuario = await Usuario.findOneAndUpdate({ "_id": id }, { $pull: { deseos: { "$in": ids } } }, { new: true })
        .populate({
            path: 'deseos',
            populate: { path: 'categoria subcategoria' },
        });

    res.json({
        usuario
    });
}

module.exports = {
    usuariosGet,
    usuariosGetId,
    usuariosPost,
    usuariosPut,
    usuariosDelete,
    // usuariosPatch,
    usuariosEnvioGet,
    usuariosEnvioPost,
    usuariosEnvioPut,
    usuariosEnvioDelete,
    usuariosFacturacionGet,
    usuariosFacturacionPost,
    //usuariosFacturacionPut,
    usuariosFacturacionDelete,
    usuariosDeseosGet,
    usuariosDeseosPost,
    usuariosDeseosDelete
}