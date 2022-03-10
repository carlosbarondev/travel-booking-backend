const { Router } = require('express');
const { check, body } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');
const { existeUsuarioPorId } = require('../middlewares/validate-db');

const {
    crearPedido, obtenerPedidosUsuario,
} = require('../controllers/bookings');

const router = Router();

router.get('/:id', [
    validateJWT,
    check('id', 'Id is not valid').isMongoId(),
    check('id').custom(existeUsuarioPorId),
    validateFields
], obtenerPedidosUsuario);

router.post('/', [
    validateJWT,
    body('user', 'User id is not valid').isMongoId(),
    body('user').custom(existeUsuarioPorId),
    check('date', 'Date is required').not().isEmpty(),
    check('payment_method', 'The payment_method is required').not().isEmpty(),
    check('digits', 'Digits are required').not().isEmpty(),
    validateFields
], crearPedido);

module.exports = router;