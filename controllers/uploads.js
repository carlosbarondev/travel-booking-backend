const path = require('path');
const { response } = require("express");

const cloudinary = require('cloudinary').v2
cloudinary.config(process.env.CLOUDINARY_URL);

const User = require('../models/user');
const Hotel = require('../models/hotel');

const mostrarImagen = async (req, res = response) => {

    const { id, coleccion } = req.params;

    let modelo;

    switch (coleccion) {
        case 'usuarios':
            modelo = await Usuario.findById(id);
            if (!modelo) {
                return res.status(400).json({
                    msg: `No existe un usuario con el id ${id}`
                });
            }
            break;
        case 'productos':
            modelo = await Producto.findById(id);
            if (!modelo) {
                return res.status(400).json({
                    msg: `No existe un producto con el id ${id}`
                });
            }
            break;
        case 'categorias':
            modelo = await Producto.findById(id);
            if (!modelo) {
                return res.status(400).json({
                    msg: `No existe una categoria con el id ${id}`
                });
            }
            break;
        case 'subcategorias':
            modelo = await Producto.findById(id);
            if (!modelo) {
                return res.status(400).json({
                    msg: `No existe una subcategoria con el id ${id}`
                });
            }
            break;
        default:
            return res.status(500).json({ msg: 'Se me olvidó validar esto' });
    }

    if (modelo.img) {
        return res.redirect(modelo.img);
    }

    const pathImagen = path.join(__dirname, '../assets/no-image.jpg');
    res.sendFile(pathImagen);

}

const actualizarImagenCloudinary = async (req, res = response) => {

    try {

        const { id, coleccion } = req.params;

        let modelo;

        switch (coleccion) {

            case 'usuarios':

                modelo = await Usuario.findById(id);
                if (!modelo) {
                    return res.status(400).json({
                        msg: `No existe un usuario con el id ${id}`
                    });
                }

                //Validar el usuario a modificar respecto el usuario que viene en el JWT
                if (id !== req.uid) {
                    return res.status(401).json({
                        ok: false,
                        msg: 'No tiene privilegios para editar este usuario'
                    });
                }

                break;

            case 'productos':

                modelo = await Producto.findById(id);
                if (!modelo) {
                    return res.status(400).json({
                        msg: `No existe un producto con el id ${id}`
                    });
                }

                break;

            case 'categorias':

                modelo = await Categoria.findById(id).populate("subcategorias");
                if (!modelo) {
                    return res.status(400).json({
                        msg: `No existe una categoria con el id ${id}`
                    });
                }

                break;

            case 'subcategorias':

                modelo = await Subcategoria.findById(id);
                if (!modelo) {
                    return res.status(400).json({
                        msg: `No existe una subcategoria con el id ${id}`
                    });
                }

                break;

            default:
                return res.status(500).json({ msg: 'Se me olvidó validar esto' });
        }

        // Limpiar imágenes previas
        if (modelo.img) {
            // Hay que borrar la imagen del servidor
            const nombreArr = modelo.img.split('/');
            const nombre = nombreArr[nombreArr.length - 1];
            const [public_id] = nombre.split('.');
            cloudinary.uploader.destroy(`ecommerce/${coleccion}/${public_id}`);
        }

        const { tempFilePath } = req.files.archivo;
        const { secure_url } = await cloudinary.uploader.upload(tempFilePath, { folder: `ecommerce/${coleccion}` });
        modelo.img = secure_url;

        await modelo.save();

        res.json(modelo);

    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }

}

module.exports = {
    mostrarImagen,
    actualizarImagenCloudinary
}