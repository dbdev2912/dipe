const express = require('express');
const router = express.Router()
const { connector } = require('../db/connector');
const { Table } = require('../module/table');

router.get('/all', (req, res) => {
    const query = `
        SELECT * FROM ACCOUNTS WHERE account_role = 'user'
    `;
    connector( query, (result) => {
        res.send({
            success: "true",
            content: "All account existed",
            data: result,
        })
    })
});
router.post('/', (req, res) => {
    const { user } = req.body;

    const accounts = new Table('accounts');
    accounts.insertOne([
        { field: "account_string", value: user.account_string },
        { field: "pwd_string", value: user.pwd_string },
        { field: "account_status", value: "1" },
        { field: "credential_string", value: user.credential_string }
    ], result => {
        res.send({ success: true, data: result })
    })
});
module.exports = { router }
