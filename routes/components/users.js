var express = require('express');
var router = express.Router();

var Novel = require('../../src/novel');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.get('/test', (req, res, next) => {
    new Novel({
        url: 'http://www.aiquxs.com/read/38/38721/index.html',
    });
    res.json({
        user: 'tobi'
    });
})

module.exports = router;
