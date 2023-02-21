const express = require('express');
const router = express.Router()

const { TableController } = require( '../controllers/table-controller' );
const { TablesController } = require( '../controllers/tables-controller' );

router.post('/modify', (req, res) => {

    const { table_id, table_name } = req.body;
    const Tables = new TablesController();
    const criteria = [{
        field: "table_id",
        value: table_id,
        fomula: "="
    }]

    Tables.getone( criteria, ({ success, table }) => {
        if(success){
            table.modify( table_name, ( { success, table } ) => {
                res.send({ success, table: table.get() })
            })
        }else{
            res.send({ success: false, content: `No table with ID: ${ table_id } can be found so we cannot modify it` })
        }
    })
})

router.get('/:table_id/fields', (req, res) => {

    const { table_id } = req.params;
    const Tables = new TablesController();
    const criteria = [{
        field: "table_id",
        value: table_id,
        fomula: "="
    }]

    Tables.getone( criteria, ({ success, table }) => {
        if(success){
            table.getFields( ({ success, fields }) => {
                if( success ){
                    const data = fields.map( field => field.get() )
                    res.send(200, { success, fields: data })
                }else{
                    res.send(200, { success, fields: "No fields can be found" })
                }
            })
        }else{
            res.send({ success: false, content: `No table with ID: ${ table_id } can be found!` })
        }
    })
})


router.get('/:table_id/field/:field_id', (req, res) => {

    const { table_id, field_id } = req.params;
    const Tables = new TablesController();
    const criteria = [{
        field: "table_id",
        value: table_id,
        fomula: "="
    }]

    Tables.getone( criteria, ({ success, table }) => {
        if(success){
            table.getField( field_id, ({ success, field }) => {
                if( success ){
                    res.send(200, { success, field: field.get() })
                }else{
                    res.send(200, { success, fields: `No field with id ${ field_id } can be found` })
                }
            })
        }else{
            res.send({ success: false, content: `No table with ID: ${ table_id } can be found!` })
        }
    })
})


router.post('/create/field', (req, res) => {

    const { table_id } = req.body;
    const { field_name, nullable, field_props, field_data_type, default_value } = req.body;

    const Tables = new TablesController();
    const criteria = [{
        field: "table_id",
        value: table_id,
        fomula: "="
    }]

    Tables.getone( criteria, ({ success, table }) => {
        if(success){
            table.createField({
                field_name, nullable, field_props, field_data_type, default_value
            }, ({ success, field, content }) => {
                if( success ){
                    res.send(200, { success, field: field.get() })
                }else{
                    res.send(500, { success, content })
                }
            })
        }else{
            res.send({ success: false, content: `No table with ID: ${ table_id } can be found!` })
        }
    })
})

router.get('/:table_id/constraints', (req, res) => {

    const { table_id, field_id } = req.params;
    const Tables = new TablesController();
    const criteria = [{
        field: "table_id",
        value: table_id,
        fomula: "="
    }]

    Tables.getone( criteria, ({ success, table }) => {
        if(success){
            table.getConstraints( ({ success, constraints }) => {
                if( success ){
                    const data = constraints.map( constr => constr.get() )
                    res.send(200, { success, constraints: data })
                }else{
                    res.send(404, { success, fields: `No constraints can be found` })
                }
            })
        }else{
            res.send({ success: false, content: `No table with ID: ${ table_id } can be found!` })
        }
    })
})

router.post('/constraint', (req, res) => {

    const { table_id } = req.body;

    const {
        constraint_type,
        field_id,
        reference_on,
        check_fomular,
        check_on_field,
        default_check_value
    } = req.body;


    const Tables = new TablesController();
    const criteria = [{
        field: "table_id",
        value: table_id,
        fomula: "="
    }]

    Tables.getone( criteria, ({ success, table }) => {
        if(success){
            table.createConstraint( {
                constraint_type,
                field_id,
                reference_on,
                check_fomular,
                check_on_field,
                default_check_value
            }, ({ success, constraint }) => {
                res.send({ success, constraint: constraint.get() })
            })
        }else{
            res.send({ success: false, content: `No table with ID: ${ table_id } can be found!` })
        }
    })
})


router.post('/drop/constraints', (req, res) => {

    const { table_id } = req.body;

    const Tables = new TablesController();
    const criteria = [{
        field: "table_id",
        value: table_id,
        fomula: "="
    }]

    Tables.getone( criteria, ({ success, table }) => {
        if(success){
            table.dropAllConstraints( ({ success})=>{
                res.send({ success, content: "SUCCESSFULLY DROP ALL CONSTRAINTS" })
            })
        }else{
            res.send({ success: false, content: `No table with ID: ${ table_id } can be found!` })
        }
    })
})


router.post('/modify/constraint', (req, res) => {

    const { table_id } = req.body;

    const {
        constraint_id,
        constraint_type,
        field_id,
        reference_on,
        check_fomular,
        check_on_field,
        default_check_value
    } = req.body;


    const Tables = new TablesController();
    const criteria = [{
        field: "table_id",
        value: table_id,
        fomula: "="
    }]

    Tables.getone( criteria, ({ success, table }) => {
        if(success){
            table.getConstraint( constraint_id, ({ success, constraint }) => {
                if( success ){
                    constraint.modify( {
                        constraint_type,
                        field_id,
                        reference_on,
                        check_fomular,
                        check_on_field,
                        default_check_value
                    }, ({ success, constraint }) => {
                        res.send({ success, constraint: constraint.get() })
                    })
                }else{
                    res.send(404, { content: "CONSTRAINT NOT FOUND" })
                }
            })
        }else{
            res.send({ success: false, content: `No table with ID: ${ table_id } can be found!` })
        }
    })
})

router.post('/modify/field', (req, res) => {
    const { table_id } = req.body;

    const {
        field_id,
        field_name,
        nullable,
        field_props,
        field_data_type,
        default_value
    } = req.body;

    const Tables = new TablesController();
    const criteria = [{
        field: "table_id",
        value: table_id,
        fomula: "="
    }]

    Tables.getone( criteria, ({ success, table }) => {
        if(success){
            table.getField( field_id, ({ success, field }) => {
                if( success ){
                    field.modify({
                        field_name,
                        nullable,
                        field_props,
                        field_data_type,
                        default_value
                    }, ({ success, content, field }) => {
                        res.send(200, { success, field: field.get()})
                    })
                }else{
                    res.send(404, { success, fields: `No field with id ${ field_id } can be found` })
                }
            })
        }else{
            res.send({ success: false, content: `No table with ID: ${ table_id } can be found!` })
        }
    })
})

module.exports = { router }
