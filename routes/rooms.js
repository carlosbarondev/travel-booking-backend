const { Router } = require('express');
const { check } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');
const { existsRoomId } = require('../middlewares/validate-db');
const { checkAdmin } = require('../middlewares/validate-roles');

const {
    roomsGet,
    roomGet,
    roomPost,
    roomUpdate,
    roomDelete,
} = require('../controllers/rooms');

const router = Router();

router.get('/', roomsGet);

router.get('/:id', [
    validateFields
], roomGet);

router.post('/', [
    validateJWT,
    check('roomId', 'EL roomId es obligatorio').not().isEmpty(),
    check('hotel', 'El hotel es obligatorio').not().isEmpty(),
    check('category', 'La categoría es obligatoria').not().isEmpty(),
    validateFields
], roomPost);

router.put('/:id', [
    validateJWT,
    check('id', 'Id is not valid').isMongoId(),
    check('id').custom(existsRoomId),
    validateFields
], roomUpdate);

router.delete('/:id', [
    validateJWT,
    checkAdmin,
    check('id', 'Id is not valid').isMongoId(),
    check('id').custom(existsRoomId),
    validateFields
], roomDelete);

module.exports = router;