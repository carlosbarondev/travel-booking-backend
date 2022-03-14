const Hotel = require("../models/hotel");
const User = require("../models/user");

const emailExists = async (email = '') => {
    const exists = await User.findOne({ email });
    if (exists) {
        throw new Error(`The email ${email} is already registered`)
    }
}

const productoExiste = async (producto = '') => {
    const existeProducto = await Producto.findOne({ nombre: producto });
    if (existeProducto) {
        throw new Error(`El producto ${producto} ya está registrado`)
    }
}

const existsUserId = async (id) => {
    const existsUser = await User.findById(id);
    if (!existsUser) {
        throw new Error(`El id ${id} no existe`)
    }
}

const existsHotelId = async (id) => {

    let existsHotel;

    if (Array.isArray(id)) { // Array de productos del pedido
        for (let i = 0; i < id.length; i++) {
            existsHotel = await Hotel.findById(id[i]);
            if (!existsHotel) {
                break;
            }
        }
    } else {
        existsHotel = await Hotel.findById(id);
    }

    if (!existsHotel) {
        throw new Error(`El id ${id} no existe`)
    }
}

const existeFacturacionPorId = async (id) => {
    const existeFacturacion = await Direccion.findById(id);
    if (!existeFacturacion) {
        throw new Error(`El id ${id} no existe`)
    }
}

const allowedCollections = (collection = '', collections = []) => {
    const included = collections.includes(collection);
    if (!included) {
        throw new Error(`La colección ${collection} no es permitida, ${collections}`);
    }
    return true;
}

module.exports = {
    emailExists,
    existsUserId,
    existsHotelId,
    existeFacturacionPorId,
    allowedCollections
}