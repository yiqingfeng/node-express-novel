const path = require('path');
const express = require('express');
const router = express.Router();

const rootPath = path.join(__dirname, '../../');

/* GET users listing. */
router.get('/', function (req, res) {
    res.sendFile(path.join(rootPath, 'webs/novel/index.html'));
});

router.get('/test', function (req, res, next) {
    // res.sendFile(path.join(rootPath, 'webs/novel/index.html'));
    res.send('hello');
});

module.exports = router;
