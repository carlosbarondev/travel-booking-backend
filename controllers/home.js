const path = require('path');


const publicPath = path.join(__dirname, '..', 'public');


const redirectHome = (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html')), function (err) {
        if (err) {
            res.status(500).send(err)
        }
    };
}


module.exports = {
    redirectHome
}