const express = require('express');
const router = express.Router()

const { Collection } = require('../mongo/collection');
const { TablesController } = require( '../controllers/tables-controller' );

router.post('/', (req, res) => {
    const tables = new TablesController();
    const { table_id, data } = req.body;

    const criteria = [{
        field: "table_id",
        value: table_id,
        fomula: "="
    }]


    // {
    //     "table_id": 8,
    //     "data": {
    //         "id1677567100002": "1",
    //         "id1677567219038": "SP02",
    //         "id1677567242452": 12,
    //         "id1677567285759": 12.39
    //     }
    // }





    /* Works but not optimized yet */

    tables.getone( criteria, ({ success, table, content }) => {
        if( success ){
            table.insert(
                data,
                    ({ success, content })=> {
                    res.send(200, { success, content })
                }
            )
        }else{
            res.send(404, { content })
        }
    })

})

router.get('/:table_id', (req, res) => {
    const tables = new TablesController();
    const { table_id } = req.params;

    const criteria = [{
        field: "table_id",
        value: table_id,
        fomula: "="
    }]

    /* Works but not optimized yet */

    tables.getone( criteria, ({ success, table, content }) => {
        if( success ){
            table.findAll( ({ success, content, data })=> {
                res.send(200, { success, content, data })
            })
        }else{
            res.send(404, { content })
        }
    })

})

router.get('/:table_id/:makh', (req, res) => {
    const tables = new TablesController();
    const { table_id, makh } = req.params;

    const criteria = [{
        field: "table_id",
        value: table_id,
        fomula: "="
    }]

    /* Works but not optimized yet */

    tables.getone( criteria, ({ success, table, content }) => {
        if( success ){
            table.find( { id1677050416272: makh }, ({ success, content, data })=> {
                res.send(200, { success, content, data })
            })
        }else{
            res.send(404, { content })
        }
    })

})


router.put('/:table_id', (req, res) => {
    const tables = new TablesController();
    const { table_id } = req.params;

    const {
        oldValue,
        newValue
    } = req.body

    const criteria = [{
        field: "table_id",
        value: table_id,
        fomula: "="
    }]

    /* Works but not optimized yet */

    tables.getone( criteria, ({ success, table, content }) => {
        if( success ){
            table.update(  oldValue, newValue ,({ success, content })=> {
                res.send(200, { success, content })
            })
        }else{
            res.send(404, { content })
        }
    })

})

router.delete('/:table_id/:makh', (req, res) => {
    const tables = new TablesController();
    const { table_id, makh } = req.params;

    const criteria = [{
        field: "table_id",
        value: table_id,
        fomula: "="
    }]

    /* Works but not optimized yet */

    tables.getone( criteria, ({ success, table, content }) => {
        if( success ){
            table.delete( { id1677050416272: makh }, ({ success, content })=> {
                res.send(200, { success, content })
            })
        }else{
            res.send(404, { content })
        }
    })

})

router.delete('/:table_id', (req, res) => {
    const tables = new TablesController();
    const { table_id } = req.params;

    const criteria = [{
        field: "table_id",
        value: table_id,
        fomula: "="
    }]

    /* Works but not optimized yet */

    tables.getone( criteria, ({ success, table, content }) => {
        if( success ){
            table.deleteAll( ({ success, content })=> {
                res.send(200, { success, content })
            })
        }else{
            res.send(404, { content })
        }
    })

})

module.exports = { router }
