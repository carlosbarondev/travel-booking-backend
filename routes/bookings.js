const { Router } = require('express');
const { check, body } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');
const { existsUserId, existsBookingId } = require('../middlewares/validate-db');

const {
    bookingPost, bookingsGet, bookingDelete,
} = require('../controllers/bookings');

const router = Router();

router.get('/:id', [
    validateJWT,
    check('id', 'Id is not valid').isMongoId(),
    check('id').custom(existsUserId),
    validateFields
], bookingsGet);

router.post('/', [
    validateJWT,
    body('user', 'User id is not valid').isMongoId(),
    body('user').custom(existsUserId),
    check('date', 'Date is required').not().isEmpty(),
    check('payment_method', 'The payment_method is required').not().isEmpty(),
    check('digits', 'Digits are required').not().isEmpty(),
    validateFields
], bookingPost);

router.delete('/:id', [
    validateJWT,
    check('id', 'Id is not valid').isMongoId(),
    check('id').custom(existsBookingId),
    validateFields
], bookingDelete);

module.exports = router;