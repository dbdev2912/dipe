const express = require('express');
const router = express.Router()

const { TablesController } = require( '../controllers/tables-controller' );

router.get('/', (req, res) => {
    const Tables = new TablesController();
    Tables.getall( ({ success, tables }) => {
        if( success ){
            const data = tables.map( table => table.get() );
            res.send(200, { tables: data })
        }else{
            res.send(404, { tables: "No tables can be found" })
        }
    })
})

router.get('/table/:table_id', (req, res) => {
    const Tables = new TablesController();

    const criteria = [{
        field: "table_id",
        value: req.params.table_id,
        fomula: "="
    }]

    Tables.getone( criteria, ({ success, table, content }) => {
        if( success ){
            res.send(200, { table: table.get() })
        }else{
            res.send(404, { content })
        }
    })
})

router.post('/', (req, res) => {
    const Tables = new TablesController();
    const { table_name } = req.body;
    Tables.createTable( table_name, ({ success, table }) => {
        if( success ){
            res.send(200, { table: table.get() })
        }
    })
})

router.post('/delete/all', (req, res) => {
    const Tables = new TablesController();

    Tables.dropAllTables( (result) => {
        const { success, content } = result;
        if( success ){
            res.send(200, { success, content })
        }
    })
})

module.exports = { router }
