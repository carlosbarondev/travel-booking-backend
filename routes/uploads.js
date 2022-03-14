const { Router } = require('express');
const { check } = require('express-validator');

const { validateFields } = require('../middlewares/validate-fields');
const { allowedCollections } = require('../middlewares/validate-db');
const { validateFileUpload } = require('../middlewares/validate-file');
const { validateJWT } = require('../middlewares/validate-jwt');

const { updateImageCloudinary } = require('../controllers/uploads');

const router = Router();

router.put('/:collection/:id/:roomType', [
    validateJWT,
    check('id', 'El id no es valido').isMongoId(),
    check('collection').custom(c => allowedCollections(c, ['users', 'hotels', 'rooms'])),
    validateFileUpload,
    validateFields
], updateImageCloudinary);

router.put('/:collection/:id', [
    validateJWT,
    check('id', 'El id no es valido').isMongoId(),
    check('collection').custom(c => allowedCollections(c, ['users', 'hotels', 'rooms'])),
    validateFileUpload,
    validateFields
], updateImageCloudinary);

module.exports = router;