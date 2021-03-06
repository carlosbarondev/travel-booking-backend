const { Router } = require('express');
const { check } = require('express-validator');

const { paymentGet, paymentPost, userGet } = require('../controllers/payments');
const { validateFields } = require('../middlewares/validate-fields');
const { existsUserId } = require('../middlewares/validate-db');
const { validateJWT } = require('../middlewares/validate-jwt');

const router = Router();

router.get("/user/:id", [
    validateJWT,
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(existsUserId),
    validateFields
], userGet);

router.get("/:payment_intent", [
    validateJWT,
], paymentGet);

router.post("/:id", [
    validateJWT,
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(existsUserId),
    validateFields
], paymentPost);

module.exports = router;