const express = require('express');
const router = express.Router()
const { mongo } = require('../db/connector');
const { Table } = require('../module/table');

router.get(`/all`, (req, res) => {
    mongo( (dbo) => {
    dbo.collection('pages').find().toArray((err, result) => {
        if(result.length !== 0){
            res.send(200, {success: true,pages:result })
        }else{
            res.send(404, {success: false, pages: "No pages can be found!"})
        }
    })
    })
})

router.get(`/:page_id`, (req, res) => {
    const page_id = req.params.page_id;
    mongo( (dbo) => {
        dbo.collection('pages').find({page_id}).toArray((err, result) => {
           
            if (err){
                res.send({success: false})
            }
            else{
                if(result.length !== 0){
                    res.send(200, {success: true, page:result})
                }else{
                    res.send(404, {success: false, page: "No page can be found!"})
                }
                
            }
            
        })
    })
})

router.post(`/add`, (req, res) => {
    const { page } = req.body;

    mongo( (dbo) => {

        dbo.collection("pages").insertOne(page, (err, result) => {
            res.send({success: true, content: "SUCCESSFULY INSERTED A NEW PAGE"})
        })        
    })   
})


module.exports = { router }
