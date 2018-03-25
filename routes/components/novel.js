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
router.get('/data/getAllBookSources', (req, res) => {
    model.getAllBookSource()
        .then(data => {
            res.send({
                errCode: 0,
                errMsg: '',
                data,
            });
        })
        .catch(err => {
            res.send({
                errCode: 1,
                errMsg: `数据查询失败${err}`,
            });
        });
});

// 获取书籍信息
router.get('/data/getBooks', (req, res) => {
    model.getALlBooks()
        .then(data => {
            res.send({
                errCode: 0,
                errMsg: '',
                data,
            });
        })
        .catch(err => {
            res.send({
                errCode: 1,
                errMsg: `数据查询失败${err}`,
            });
        });
});

// 添加书籍信息
router.post('/data/addBook', (req, res) => {
    // const { name, author, url, source_id, remark } = req.body;
    const book = req.body;
    model.addBook(book)
        .then(data => {
            if (data.affectedRows) {
                res.send({
                    errCode: 0,
                    errMsg: '',
                });
            } else {
                res.send({
                    errCode: 2,
                    errMsg: `数据插入失败${data.message}`,
                });
            }
        })
        .catch(err => {
            res.send({
                errCode: 2,
                errMsg: `数据插入失败${err}`,
            });
        });
});

module.exports = router;
