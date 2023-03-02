var express = require('express');
var JWT = require('../Connect/_JWT');
var router = express.Router();

router.get('/make', async function (req, res) {
    var user = {
        name: "Username",
        email: "email@example.com"
    };
    // req từ csdl
    const _token = await JWT.make(user);
    res.send({ token: _token });
});
router.get('/check', async function (req, res) {
    try {
        const _token = req.headers.authorization;

        const data = await JWT.check(_token);
        res.send({ data: data });
    } catch (error) {
        res.send({ data: null });
    }
});
module.exports = router;
