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


router.put('/collection/:col_id/name', ( req, res ) => {
    const { col_id } = req.params;
    const collection_id = parseInt( col_id );
    const { collection_name } = req.body;
    mongo( dbo => {
        dbo.collection('api_collection').updateOne({ collection_id }, { $set: { collection_name } }, (err, result) => {
            res.send({ success: true })
        })
    })
})

router.post('/api', (req, res) => {
    const { data } = req.body;
    const { tables, fields, name, collection, fullurl, type } = data;
    delete data["collection"]
    const { collection_id } = collection;
    const newCollection = collection;
    newCollection[ type.value ].push(data);


    mongo( dbo => {
        dbo.collection("api_collection").updateOne({ collection_id: parseInt(collection_id) }, { $set: {
             get: newCollection.get,
             post: newCollection.post,
             put: newCollection.put,
             delete: newCollection.delete,
         } }, (err, result) => {
             dbo.collection("apis").insertOne( data, (err, result) => {
                 res.send({ success: true })
             })
        })
    })
})

router.put('/api/status', ( req, res ) => {
    const { url, status } = req.body;
    mongo( dbo => {        
        dbo.collection('apis').updateOne({ "url.url": url }, { $set: { status } },(err, result) => {
            res.send({ success: true })
        })
    })
})

module.exports = router;
