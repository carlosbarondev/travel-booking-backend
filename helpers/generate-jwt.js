const jwt = require('jsonwebtoken');

const generateJWT = (uid, name, email, role, img, state) => {

    return new Promise((resolve, reject) => {

        const payload = { uid, name, email, role, img, state };

        jwt.sign(payload, process.env.SECRETORPRIVATEKEY, {
            expiresIn: '1h'
        }, (err, token) => {
            if (err) {
                console.log(err);
                reject('Failed to generate token')
            } else {
                resolve(token);
            }
        })
    })
}

module.exports = {
    generateJWT
}