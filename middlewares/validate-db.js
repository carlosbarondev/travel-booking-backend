const Hotel = require("../models/hotel");
const User = require("../models/user");

const emailExiste = async (correo = '') => {
    const existeEmail = await Usuario.findOne({ correo });
    if (existeEmail) {
        throw new Error(`El correo ${correo} ya está registrado`)
    }
}

const categoriaExiste = async (categoria = '') => {
    const existeCategoria = await Categoria.findOne({ nombre: categoria });
    if (!existeCategoria) {
        throw new Error(`La categoria ${categoria} no existe`)
    }
}

const subcategoriaExiste = async (categoria, subcategoria = '') => {
    const existeSubCategoria = await Categoria.findOne({ nombre: categoria, "subcategorias": { $elemMatch: { "nombre": subcategoria } } });
    if (!existeSubCategoria) {
        throw new Error(`La subcategoria ${subcategoria} no existe`)
    }
}

const productoExiste = async (producto = '') => {
    const existeProducto = await Producto.findOne({ nombre: producto });
    if (existeProducto) {
        throw new Error(`El producto ${producto} ya está registrado`)
    }
}

const existeUsuarioPorId = async (id) => {
    const existeUsuario = await Usuario.findById(id);
    if (!existeUsuario) {
        throw new Error(`El id ${id} no existe`)
    }
}

const existeProductoPorId = async (id) => {

    let existeProducto;

    if (Array.isArray(id)) { // Array de productos del pedido
        for (let i = 0; i < id.length; i++) {
            existeProducto = await Producto.findById(id[i]);
            if (!existeProducto) {
                break;
            }
        }
    } else {
        existeProducto = await Producto.findById(id);
    }

    if (!existeProducto) {
        throw new Error(`El id ${id} no existe`)
    }
}

const existeFacturacionPorId = async (id) => {
    const existeFacturacion = await Direccion.findById(id);
    if (!existeFacturacion) {
        throw new Error(`El id ${id} no existe`)
    }
}

const coleccionesPermitidas = (coleccion = '', colecciones = []) => {
    const incluida = colecciones.includes(coleccion);
    if (!incluida) {
        throw new Error(`La colección ${coleccion} no es permitida, ${colecciones}`);
    }
    return true;
}

module.exports = {
    emailExiste,
    categoriaExiste,
    subcategoriaExiste,
    existeUsuarioPorId,
    existeProductoPorId,
    existeFacturacionPorId,
    coleccionesPermitidas
}