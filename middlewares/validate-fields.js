const { response } = require('express');
const { validationResult } = require('express-validator');

const validateFields = (req, res = response, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array().shift().msg; //Devuelve el primer error encontrado
        return res.status(400).send({ msg: error });
    }

    next();
}

module.exports = {
    validateFields
}