var express = require('express');
const { mongo } = require('../Connect/conect');

var router  = express.Router();

router.get('/version/:version_id', ( req, res ) => {
    const { version_id } = req.params;
    const id = parseInt(version_id);
    mongo( dbo => {
        dbo.collection("api_collection").find({ version_id: id }).toArray((err, result) => {
            res.status(200).send({ success: true, collections: result })
        })
    })
})

router.post('/collection', (req, res) => {
    const { collection, version_id } = req.body;
    mongo( dbo => {
        dbo.collection("ids").findOne({ name: "api_collection_id" }, ( err, result ) => {
            let id = 0;
            if( result ){
                id = result.id + 1;
                dbo.collection('ids').updateOne({ name: "api_collection_id" }, { $set: { id }} ,( err, result ) => {
                    dbo.collection('api_collection').insertOne({...collection, collection_id: id, version_id}, (err, result) => {
                        res.send({ success: true, collection_id: id })
                    })
                })
            }else{
                dbo.collection('ids').insertOne({ name: "api_collection_id", id }, ( err, result ) => {
                    dbo.collection('api_collection').insertOne({...collection, collection_id: id, version_id}, (err, result) => {
                        res.send({ success: true, collection_id: id })
                    })
                })
            }
        })
    })
})
router.delete('/collection/:collection_id', (req, res) => {
    const { collection_id } = req.params;
    mongo( dbo => {
        dbo.collection("api_collection").deleteOne({ collection_id: parseInt( collection_id ) }, (err, result) => {
            res.send({ success: true })
        })
    })
})


module.exports = router;
