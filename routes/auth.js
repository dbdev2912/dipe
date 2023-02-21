const express = require('express');
const router = express.Router()

const { Table } = require('../module/table');

router.get(`/session`, (req, res) => {
    const { auth } = req.session;
    res.send({ session: auth })
})

router.post(`/login`, (req, res) => {
    const { username, password } = req.body;
    const accounts = new Table("accounts");
    accounts.selectOne("account_string", username, ( result ) => {
        if(result.length > 0){
            const account = result[0]

            if( account.pwd_string === password ){

                req.session.auth = { ...account, pwd_string: "a hi hi sao biet dc :>" };
                res.send({ success: true, msg: "", role: account.account_role })

            }else{
                res.send({ success: false, msg: "Sai mật khẩu gòi.", role: null })
            }
        }else{
            res.send({ success: false, msg: "Người dùng khum tồn tại.", role: null })
        }
    })
})

module.exports = { router }
