const express = require('express');
const router = express.Router()

const { Table } = require('../module/table');

router.get(`/all`, (req, res) => {
    res.send({success: true, msg: "Nothing"})
})

router.post(`/add`, (req, res) => {
    const { page } = req.body;

    console.log(page);
    res.send({success: true, msg: "Nothing"})
})

module.exports = { router }
