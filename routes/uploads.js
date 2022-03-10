const { Router } = require('express');
const { check } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { coleccionesPermitidas } = require('../middlewares/validate-db');
const { validateFileUpload } = require('../middlewares/validate-file');
const { validateJWT } = require('../middlewares/validate-jwt');

const { mostrarImagen, actualizarImagenCloudinary } = require('../controllers/uploads');

const router = Router();

router.get('/:coleccion/:id', [
    check('id', 'El id no es valido').isMongoId(),
    check('coleccion').custom(c => coleccionesPermitidas(c, ['usuarios', 'productos', 'categorias', 'subcategorias'])),
    validateFields
], mostrarImagen);

router.put('/:coleccion/:id', [
    validateJWT,
    check('id', 'El id no es valido').isMongoId(),
    check('coleccion').custom(c => coleccionesPermitidas(c, ['usuarios', 'productos', 'categorias', 'subcategorias'])),
    validateFileUpload,
    validateFields
], actualizarImagenCloudinary);

module.exports = router;