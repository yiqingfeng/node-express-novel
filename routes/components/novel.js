const path = require('path');
const express = require('express');
const router = express.Router();
const model = require('../../models/index');

const rootPath = path.join(__dirname, '../../');

/* GET users listing. */
router.get('/', function (req, res) {
    res.sendFile(path.join(rootPath, 'webs/novel/index.html'));
});

// 获取所有小说祝愿
router.get('/info/booksources', (req, res) => {
    model.getAllBookSource().then(data => {
        res.send(data);
    });
});

module.exports = router;
