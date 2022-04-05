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
    userDelete
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

module.exports = router;