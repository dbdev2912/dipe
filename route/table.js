const express = require('express');
const router = express.Router()

const { TableController } = require('../controller/table-controller');
const { TablesController } = require('../controller/tables-controller');
const { FieldController } = require('../controller/field-controller');
const { ConstraintController } = require("../controller/constraint-controller")
// router.post('/modify', (req, res) => {

//     const { table_id, table_name } = req.body;
//     const Tables = new TablesController();
//     const criteria = [{
//         field: "table_id",
//         fomula: "=",
//         value: table_id

//     }]

//     Tables.getone( criteria, ({ success, table }) => {
//         if(success){
//             table.modify( table_name, ( { success, table } ) => {
//                 res.send({ success, table: table.get() })
//             })
//         }else{
//             res.send({ success: false, content: `No table with ID: ${ table_id } can be found so we cannot modify it` })
//         }
//     })
// })
///Xem tất cả trường của bảng có id là table_id
router.get('/:table_id/fields', (req, res) => {

    const { table_id } = req.params;
    const Tables = new TablesController();
    const criteria = [{
        field: "table_id",
        value: table_id,
        fomula: "="
    }]

    Tables.getone(criteria, ({ success, table }) => {
        if (success) {
            table.getFields(({ success, fields }) => {
                if (success) {
                    const data = fields.map(field => field.get())
                    res.send(200, { success: true, content: "Thành công", fields: data })
                } else {
                    res.send(200, { success: false, content: "Thất bại" })
                }
            })
        } else {
            res.send({ success: false, content: `No table with ID: ${table_id} can be found!` })
        }
    })
})

// z
router.get('/:table_id/field/:field_id', (req, res) => {

    const { table_id, field_id } = req.params;
    const Tables = new TablesController();
    const criteria = [{
        field: "table_id",
        value: table_id,
        fomula: "="
    }]

    Tables.getone(criteria, ({ success, table }) => {
        if (success) {
            table.getField(field_id, ({ success, field }) => {
                if (success) {
                    res.send(200, { success: true, content: "Thành công", field: field.get() })
                } else {
                    res.send(200, { success: false, content: `Không tìm thấy trường có ID: ${field_id}` })
                }
            })
        } else {
            res.send({ success: false, content: `No table with ID: ${table_id} can be found!` })
        }
    })
})

// tạo mới trường + ràng buộc
router.post('/create/field_constraint', (req, res) => {

    const { table_id } = req.body;
    const { field_name, nullable, field_props, field_data_type, default_value, constraint_type,
        field_id,
        reference_on,
        check_fomular,
        check_on_field,
        default_check_value} = req.body;

    const Tables = new TablesController();
    const criteria = [{
        field: "table_id",
        value: table_id,
        fomula: "="
    }]

    Tables.getone(criteria, ({ success, table }) => {
        if (success) {
            table.createField({
                field_name, nullable, field_props, field_data_type, default_value}, ({ success, field, content }) => {
                if (success) {
                    field.createConstraint({
                        constraint_type,
                        field_id,
                        reference_on,
                        check_fomular,
                        check_on_field,              /*---*/
                        default_check_value
                    }, ({ success, constraint }) => {
                        res.send({ success: true, content: "Thành công", data: constraint.get() })
                    })
                    res.status(200).json({ success: true, content: "Thêm thành công", data: field });
                } else {
                    res.status(500).json({ success: true, content: "Thất bại" });
                }
            })
        } else {
            res.send({ success: false, content: `No table with ID: ${table_id} can be found!` })
        }
    })
})













// tạo mới trường
router.post('/create/field', (req, res) => {

    const { table_id } = req.body;
    const { field_name, nullable, field_props, field_data_type, default_value } = req.body;

    const Tables = new TablesController();
    const criteria = [{
        field: "table_id",
        value: table_id,
        fomula: "="
    }]

    Tables.getone(criteria, ({ success, table }) => {
        if (success) {
            table.createField({
                field_name, nullable, field_props, field_data_type, default_value
            }, ({ success, field, content }) => {
                if (success) {
                    res.status(200).json({ success: true, content: "Thêm thành công", data: field });
                } else {
                    res.status(500).json({ success: true, content: "Thất bại" });
                }
            })
        } else {
            res.send({ success: false, content: `No table with ID: ${table_id} can be found!` })
        }
    })
})


///drop files
router.delete('/field_drop/:field_id', (req, res) => {

    const { field_id } = req.params;
    const field = new FieldController({ field_id })
    field.drop(({ success, content }) => {
        res.send({ success: true, content });
    });
})
//xem ràng buộc của bảng
router.get('/:table_id/constraints', (req, res) => {

    const { table_id, field_id } = req.params;
    const Tables = new TablesController();
    const criteria = [{
        field: "table_id",
        value: table_id,
        fomula: "="
    }]

    Tables.getone(criteria, ({ success, table }) => {
        if (success) {
            table.getConstraints(({ success, constraints }) => {
                if (success) {
                    const data = constraints.map(constr => constr.get())
                    res.send(200, { success: true, content: "Thành công", constraints: data })
                } else {
                    res.send(404, { success: false, content: "Thất bại" })
                }
            })
        } else {
            res.send({ success: false, content: `No table with ID: ${table_id} can be found!` })
        }
    })
})




//tạo ràng buộc cho bảng
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

    Tables.getone(criteria, ({ success, table }) => {
        if (success) {
            table.createConstraint({
                constraint_type,
                field_id,
                reference_on,
                check_fomular,
                check_on_field,
                default_check_value
            }, ({ success, constraint }) => {
                res.send({ success: true, content: "Thành công", data: constraint.get() })
            })
        } else {
            res.send({ success: false, content: `No table with ID: ${table_id} can be found!` })
        }
    })
})


router.delete('/drop/constraints', (req, res) => {

    const { table_id } = req.body;

    const Tables = new TablesController();
    const criteria = [{
        field: "table_id",
        value: table_id,
        fomula: "="
    }]

    Tables.getone(criteria, ({ success, table }) => {
        if (success) {
            table.dropAllConstraints(({ success }) => {
                res.send({ success, content: "SUCCESSFULLY DROP ALL CONSTRAINTS" })
            })
        } else {
            res.send({ success: false, content: `No table with ID: ${table_id} can be found!` })
        }
    })
})

///// xóa bảng

router.delete('/drop/:table_id', (req, res) => {

    const { table_id } = req.params;

    const Tables = new TablesController();
    const criteria = [{
        field: "table_id",
        value: table_id,
        fomula: "="
    }]
    Tables.getone(criteria, ({ success, table }) => {
        if (success) {
            table.drop(({ success }) => {
                res.send({ success: true, content: "Xóa thành công " })
            })
        } else {
            res.send({ success: false, content: `Không tìm thấy bảng có id ${table_id}` })
        }
    })
})



/////
router.delete('/drop/constraintsid', (req, res) => {

    const { table_id } = req.body;
    const constraint_id = req.body.constraint_id;
    const Tables = new TablesController();

    const criteria = [{
        field: "table_id",
        value: table_id,
        fomula: "="
    }]

    Tables.getone(criteria, ({ success, table }) => {
        if (success) {
            table.getConstraint(constraint_id, ({ success, constraint }) => {
                constraint.drop(({ success, content }) => {

                    res.send({ success, content: "SUCCESSFULLY DROP CONSTRAINTS" })
                });

            })
        } else {
            res.send({ success: false, content: `No table with ID: ${table_id} can be found!` })
        }
    })
})

router.put('/modify/constraint', (req, res) => {

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

    Tables.getone(criteria, ({ success, table }) => {
        if (success) {
            table.getConstraint(constraint_id, ({ success, constraint }) => {
                if (success) {
                    constraint.modify({
                        constraint_type,
                        field_id,
                        reference_on,
                        check_fomular,
                        check_on_field,
                        default_check_value
                    }, ({ success, constraint }) => {
                        res.send({ success: true, content: "Thành công", data: constraint.get() })
                    })
                } else {
                    res.send(404, { success: false, content: "CONSTRAINT NOT FOUND" })
                }
            })
        } else {
            res.send({ success: false, content: `No table with ID: ${table_id} can be found!` })
        }
    })
})
//thay đổi thông tin trường
router.put('/modify/field', (req, res) => {
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

    Tables.getone(criteria, ({ success, table }) => {
        if (success) {
            table.getField(field_id, ({ success, field }) => {
                if (success) {
                    field.modify({
                        field_name,
                        nullable,
                        field_props,
                        field_data_type,
                        default_value
                    }, ({ success, content, field }) => {
                        res.send(200, { success: true, content: "Thành công", field: field.get() })
                    })
                } else {
                    res.send(404, { success: false, content: `Không tìm thấy trường có ID: ${field_id} ` })
                }
            })
        } else {
            res.send({ success: false, content: `No table with ID: ${table_id} can be found!` })
        }
    })
})

module.exports = { router }
