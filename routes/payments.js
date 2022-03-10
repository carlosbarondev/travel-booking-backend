const { Router } = require('express');
const { check } = require('express-validator');

const { mostrarPago, crearPago, mostrarUsuario } = require('../controllers/payments');
const { validateFields } = require('../middlewares/validate-fields');
const { existeUsuarioPorId } = require('../middlewares/validate-db');
const { validateJWT } = require('../middlewares/validate-jwt');

const router = Router();

router.get("/user/:id", [
    validateJWT,
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(existeUsuarioPorId),
    validateFields
], mostrarUsuario);

router.get("/:payment_intent", [
    validateJWT,
], mostrarPago);

router.post("/:id", [
    validateJWT,
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(existeUsuarioPorId),
    validateFields
], crearPago);

module.exports = router;