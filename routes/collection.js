const express = require('express');
const router = express.Router()

const { Collection } = require('../mongo/collection');

router.get("/", (req, res) => {
    const col = new Collection("test");
    col.connect((col) => {
        col.find().toArray((err, result) => {

            res.send({ success: true, result })
        })
    })
})

module.exports = { router }
