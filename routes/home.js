const { Router } = require('express');

const { redirectHome } = require('../controllers/home');


const router = Router();

router.get('*', redirectHome);


module.exports = router;