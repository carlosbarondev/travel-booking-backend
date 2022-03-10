const { Router } = require('express');
const { check } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');
const { existeProductoPorId, existeUsuarioPorId } = require('../middlewares/validate-db');
const { checkAdmin } = require('../middlewares/validate-roles');

const {
    obtenerProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    borrarProducto,
    crearComentarioProducto,
    obtenerComentarioProducto,
    borrarComentarioProducto
} = require('../controllers/hotels');

const router = Router();

router.get('/', obtenerProductos);

router.get('/hotel/:id', [
    validateFields
], obtenerProducto);

router.post('/', [
    validateJWT,
    check('name', 'Name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('country', 'Country is required').not().isEmpty(),
    check('city', 'City is required').not().isEmpty(),
    validateFields
], crearProducto);

router.put('/:id', [
    validateJWT,
    checkAdmin,
    check('id', 'Id is not valid').isMongoId(),
    check('id').custom(existeProductoPorId),
    validateFields
], actualizarProducto);

router.delete('/:id', [
    validateJWT,
    checkAdmin,
    check('id', 'Id is not valid').isMongoId(),
    check('id').custom(existeProductoPorId),
    validateFields
], borrarProducto);

router.get('/comment/:id', [
    validateJWT,
    check('id', 'Id is not valid').isMongoId(),
    check('id').custom(existeUsuarioPorId),
    validateFields
], obtenerComentarioProducto);

router.post('/comment/:id', [
    validateJWT,
    check('id', 'Id is not valid').isMongoId(),
    check('id').custom(existeProductoPorId),
    check('title', 'Title is required').not().isEmpty(),
    check('text', 'Text is required').not().isEmpty(),
    check('rating', 'Rating is required').not().isEmpty(),
    check('user', 'User is required').not().isEmpty(),
    check('user').custom(existeUsuarioPorId),
    check('date', 'Date is required').not().isEmpty(),
    validateFields
], crearComentarioProducto);

router.delete('/comment/:id', [
    validateJWT,
    check('id', 'Id is not valid').isMongoId(),
    check('id').custom(existeUsuarioPorId),
    validateFields
], borrarComentarioProducto);

module.exports = router;