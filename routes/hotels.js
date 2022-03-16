const { Router } = require('express');
const { check } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');
const { existsHotelId, existsUserId } = require('../middlewares/validate-db');
const { checkAdmin } = require('../middlewares/validate-roles');

const {
    hotelsGet,
    hotelGet,
    hotelPost,
    hotelUpdate,
    hotelDelete,
    commentPost,
    obtenerComentarioProducto,
    borrarComentarioProducto
} = require('../controllers/hotels');

const router = Router();

router.get('/', hotelsGet);

router.get('/:id', [
    validateFields
], hotelGet);

router.post('/', [
    validateJWT,
    check('name', 'Name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('country', 'Country is required').not().isEmpty(),
    check('city', 'City is required').not().isEmpty(),
    validateFields
], hotelPost);

router.put('/:id', [
    validateJWT,
    checkAdmin,
    check('id', 'Id is not valid').isMongoId(),
    check('id').custom(existsHotelId),
    validateFields
], hotelUpdate);

router.delete('/:id', [
    validateJWT,
    checkAdmin,
    check('id', 'Id is not valid').isMongoId(),
    check('id').custom(existsHotelId),
    validateFields
], hotelDelete);

router.get('/comment/:id', [
    validateJWT,
    check('id', 'Id is not valid').isMongoId(),
    check('id').custom(existsUserId),
    validateFields
], obtenerComentarioProducto);

router.post('/comment/:id', [
    validateJWT,
    check('id', 'Id is not valid').isMongoId(),
    check('id').custom(existsHotelId),
    check('title', 'Title is required').not().isEmpty(),
    check('text', 'Text is required').not().isEmpty(),
    check('rating', 'Rating is required').not().isEmpty(),
    check('user', 'User is required').not().isEmpty(),
    check('user').custom(existsUserId),
    check('date', 'Date is required').not().isEmpty(),
    validateFields
], commentPost);

router.delete('/comment/:id', [
    validateJWT,
    check('id', 'Id is not valid').isMongoId(),
    check('id').custom(existsUserId),
    validateFields
], borrarComentarioProducto);

module.exports = router;