const express = require('express');
const router = express.Router()
const { mongo } = require('../Connect/Dbconnection');

router.get(`/all`, (req, res) => {
    mongo((dbo) => {
        dbo.collection('json').find().toArray((err, result) => {
            if (result.length !== 0) {
                res.send(200, { success: true, pages: result })
            } else {
                res.send(404, { success: false, pages: "No pages can be found!" })
            }
        })
    })
})
router.get(`/:page_id`, (req, res) => {
    const page_id = req.params.page_id;
    mongo((dbo) => {
        dbo.collection('json').find({ page_id }).toArray((err, result) => {

            if (err) {
                res.send({ success: false })
            }
            else {
                if (result.length !== 0) {
                    res.send(200, { success: true, page: result })
                } else {
                    res.send(404, { success: false, page: "No page can be found!" })
                }
            }
        })
    })
})

router.post(`/add`, (req, res) => {
    const { data } = req.body;
    console.log(data)
    mongo((dbo) => {
        dbo.collection("json").insertOne(data, (err, result) => {
            res.send({ success: true, content: "SUCCESSFULY INSERTED A NEW PAGE" })
        })
    })
})

router.put(`/update/:page_id`, (req, res) => {
    const { title, description } = req.body;
    try {
        mongo((dbo) => {
            dbo.collection("pages").updateOne(
                {
                    page_id: req.params.page_id
                },
                {
                    $set: {
                        title,
                        description
                    }
                },
                (err, result) => {
                    if (err) {
                        res.send({ success: false })
                    }
                    else {
                        res.send(200, { success: true, page: result })
                    }
                });
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
})

router.delete(`/delete/:page_id`, (req, res) => {
    try {
        mongo((dbo) => {
            dbo.collection("pages").deleteOne(
                {
                    page_id: req.params.page_id
                },
                (err, result) => {
                    if (err) {

                        res.send({ success: false })
                    }
                    else {
                        res.send(200, { success: true, page: result })
                    }
                });
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
})
module.exports = { router }
