const express = require('express');
const router = express.Router()

const { Collection } = require('../mongo/collection');

router.get("/", (req, res) => {
    const col = new Collection("id1676947730032");
    col.connect((col) => {
        col.find().toArray((err, result) => {

            res.send({ success: true, result })
        })
    })
})

router.get('/get/all', (req, res) => {
    const col = new Collection("id1676947730032");
    col.findAll( ({ success, data }) => {
        res.send({ success, data })
    })
})

router.post('/', (req, res) => {
    const col = new Collection("id1676947730032");
    const { id1677050416272,
            id1677050436301,
            id1677050476779,
            id1677050525226,
            id1677050560301 } = req.body
    col.insert(
        {   id1677050416272,
            id1677050436301,
            id1677050476779,
            id1677050525226,
            id1677050560301  },
            ({ success, content }) => {
        res.send({ success, content })
    })
})

module.exports = { router }
