const { response } = require("express")

const validateFileUpload = (req, res = response, next) => {

    if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
        return res.status(400).json({
            msg: 'There are no files to upload'
        });
    }
    next();
}

module.exports = {
    validateFileUpload
}