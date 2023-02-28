const express = require('express');
const router = express.Router()

const { Collection } = require('../mongo/collection');
const { TablesController } = require( '../controllers/tables-controller' );

router.post('/', (req, res) => {
    const tables = new TablesController();
    const { table_id } = req.body;

    const { table_18_id_alias,
            id1677468440939,
            id1677468455577,
            id1677468623631,
            id1677468745340,
            id1677468875879, } = req.body

    const criteria = [{
        field: "table_id",
        value: table_id,
        fomula: "="
    }]

    /* Works but not optimized yet */

    tables.getone( criteria, ({ success, table, content }) => {
        if( success ){
            table.insert(
                {   table_18_id_alias,
                    id1677468440939,
                    id1677468455577,
                    id1677468623631,
                    id1677468745340,
                    id1677468875879
                },
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


router.put('/:table_id/:makh', (req, res) => {
    const tables = new TablesController();
    const { table_id, makh } = req.params;

    const {
        id1677050436301,
        id1677050476779,
        id1677050525226,
        id1677050560301,
    } = req.body

    const criteria = [{
        field: "table_id",
        value: table_id,
        fomula: "="
    }]

    /* Works but not optimized yet */

    tables.getone( criteria, ({ success, table, content }) => {
        if( success ){
            table.update( { id1677050416272: makh }, {
                id1677050436301,
                id1677050476779,
                id1677050525226,
                id1677050560301,
            } ,({ success, content, data })=> {
                res.send(200, { success, content, data })
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
