const { Router } = require('express');
const { check } = require('express-validator');

const { login, revalidarToken } = require('../controllers/auth');
const { validateFields } = require('../middlewares/validate-fields');
const { validateJWT } = require('../middlewares/validate-jwt');

const router = Router();

router.post('/', [
    check('email', 'Email is required').not().isEmpty(),
    check('email', 'Email is not valid').isEmail(),
    check('password', 'Password is required').not().isEmpty(),
    check('password', 'The password must be at least 6 characters long').isLength({ min: 6 }),
    validateFields
], login);

router.get('/renew', [
    validateJWT,
    validateFields
], revalidarToken);

module.exports = router;