const { response } = require("express");

const cloudinary = require('cloudinary').v2
cloudinary.config(process.env.CLOUDINARY_URL);

const User = require('../models/user');
const Hotel = require('../models/hotel');

const updateImageCloudinary = async (req, res = response) => {

    try {

        const { id, collection, roomType } = req.params;

        let model;

        switch (collection) {

            case 'users':

                model = await User.findById(id);
                if (!model) {
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

            case 'hotels':

                model = await Hotel.findById(id);
                if (!model) {
                    return res.status(400).json({
                        msg: `No existe un producto con el id ${id}`
                    });
                }

                break;

            case 'rooms':

                model = await Hotel.findById(id);
                if (!model) {
                    return res.status(400).json({
                        msg: `No existe un producto con el id ${id}`
                    });
                }

                break;

            default:
                return res.status(500).json({ msg: 'Se me olvidó validar esto' });
        }

        // Limpiar imágenes previas
        if (collection === "rooms") {
            if (model[roomType].img) {
                // Hay que borrar la imagen del servidor
                const nameArr = model[roomType].img.split('/');
                const name = nameArr[nameArr.length - 1];
                const [public_id] = name.split('.');
                cloudinary.uploader.destroy(`travel-booking/${collection}/${public_id}`);
            }
        } else {
            if (model.img) {
                // Hay que borrar la imagen del servidor
                const nameArr = model.img.split('/');
                const name = nameArr[nameArr.length - 1];
                const [public_id] = name.split('.');
                cloudinary.uploader.destroy(`travel-booking/${collection}/${public_id}`);
            }
        }

        const { tempFilePath } = req.files.file;
        const { secure_url } = await cloudinary.uploader.upload(tempFilePath, { folder: `travel-booking/${collection}` });
        if (collection === "rooms") {
            model[roomType].img = secure_url;
        } else {
            model.img = secure_url;
        }

        await model.save();

        res.json(model);

    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }

}

module.exports = {
    updateImageCloudinary
}