const { Router } = require('express');
const { check } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');
const { emailExists, existsUserId } = require('../middlewares/validate-db');
const { checkAdmin } = require('../middlewares/validate-roles');

const {
    usersGet,
    userGetId,
    userPost,
    userPut,
    userDelete,
    usuariosEnvioGet,
    usuariosEnvioPost,
    usuariosEnvioPut,
    usuariosEnvioDelete,
} = require('../controllers/users');

const router = Router();

router.get('/', usersGet);

router.get('/:id', [
    validateJWT,
    check('id', 'Id is not valid').isMongoId(),
    check('id').custom(existsUserId),
    validateFields
], userGetId);

router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('password', 'The password must be at least 6 characters long').isLength({ min: 6 }),
    check('email', 'Email is required').isEmail(),
    check('email').custom(emailExists),
    validateFields
], userPost);

router.put('/:id', [
    validateJWT,
    check('id', 'Id is not valid').isMongoId(),
    check('id').custom(existsUserId),
    //check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    //check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
    //check('correo', 'El correo no es válido').isEmail(),
    validateFields
], userPut);

router.delete('/:id', [
    validateJWT,
    checkAdmin,
    check('id', 'Id is not valid').isMongoId(),
    check('id').custom(existsUserId),
    validateFields
], userDelete);

router.get('/billing/:id', [
    validateJWT,
    check('id', 'El id no es valido').isMongoId(),
    check('id').custom(existsUserId),
    validateFields
], usuariosEnvioGet);

router.post('/billing/:id', [
    validateJWT,
    check('id', 'El id no es valido').isMongoId(),
    check('id').custom(existsUserId),
    check('direccion.poblacion', 'La poblacion es obligatoria').not().isEmpty(),
    check('direccion.poblacion', 'La poblacion debe ser un string').isString(),
    check('direccion.pais', 'El pais es obligatorio').not().isEmpty(),
    check('direccion.pais', 'El pais debe ser un string').isString(),
    check('direccion.pais', 'El pais debe tener dos letras').isLength(2),
    check('direccion.calle', 'La calle es obligatoria').not().isEmpty(),
    check('direccion.calle', 'La calle debe ser un string').isString(),
    check('direccion.numero', 'El numero es obligatorio').not().isEmpty(),
    check('direccion.numero', 'El numero debe ser un string').isString(),
    check('direccion.codigo', 'El codigo es obligatorio').not().isEmpty(),
    check('direccion.codigo', 'El codigo debe ser un numero').isNumeric(),
    check('direccion.codigo', 'El codigo debe tener cinco numeros').isLength(5),
    check('direccion.provincia', 'La provincia es obligatoria').not().isEmpty(),
    check('direccion.provincia', 'La provincia debe ser un string').isString(),
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('nombre', 'El nombre debe ser un string').isString(),
    check('telefono', 'El telefono es obligatorio').not().isEmpty(),
    check('telefono', 'El teléfono debe ser un número').isNumeric(),
    check('telefono', 'El teléfono debe tener nueve numeros').isLength(9),
    validateFields
], usuariosEnvioPost);

router.put('/billing/:id', [
    validateJWT,
    check('id', 'El id no es valido').isMongoId(),
    check('id').custom(existsUserId),
    check('direccion.poblacion', 'La poblacion es obligatoria').not().isEmpty(),
    check('direccion.poblacion', 'La poblacion debe ser un string').isString(),
    check('direccion.pais', 'El pais es obligatorio').not().isEmpty(),
    check('direccion.pais', 'El pais debe ser un string').isString(),
    check('direccion.pais', 'El pais debe tener dos letras').isLength(2),
    check('direccion.calle', 'La calle es obligatoria').not().isEmpty(),
    check('direccion.calle', 'La calle debe ser un string').isString(),
    check('direccion.numero', 'El numero es obligatorio').not().isEmpty(),
    check('direccion.numero', 'El numero debe ser un string').isString(),
    check('direccion.codigo', 'El codigo es obligatorio').not().isEmpty(),
    check('direccion.codigo', 'El codigo debe ser un numero').isNumeric(),
    check('direccion.codigo', 'El codigo debe tener cinco numeros').isLength(5),
    check('direccion.provincia', 'La provincia es obligatoria').not().isEmpty(),
    check('direccion.provincia', 'La provincia debe ser un string').isString(),
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('nombre', 'El nombre debe ser un string').isString(),
    check('telefono', 'El telefono es obligatorio').not().isEmpty(),
    check('telefono', 'El teléfono debe ser un número').isNumeric(),
    check('telefono', 'El teléfono debe tener nueve numeros').isLength(9),
    validateFields
], usuariosEnvioPut);

router.delete('/billing/:id', [
    validateJWT,
    check('id', 'El id no es valido').isMongoId(),
    check('id').custom(existsUserId),
    validateFields
], usuariosEnvioDelete);

module.exports = router;