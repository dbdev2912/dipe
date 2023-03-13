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
//@route GET api/${ unique_string }/table/:table_id/fields
//@desc Xem tất cả trường của bảng có id là table_id
//@access Public

router.get('/:table_id/fields', (req, res) => {
    const { table_id } = req.params;
    // console.log(table_id)
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
                    table.getConstraints(({ success, constraints }) => {
                        res.status(200).send( { success: true, content: "Thành công", fields: data, constraints } )
                    })
                } else {
                    res.status(404).send( { success: false, content: "Thất bại" })
                }
            })
        } else {
            res.status(404).send( { success: false, content: `Không tìm thấy bảng có ID: ${table_id} ` })
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
                    res.status(200).send( { success: true, content: "Thành công", field: field.get() })
                } else {
                    res.status(404).send( { success: false, content: `Không tìm thấy trường có ID: ${field_id}` })
                }
            })
        } else {
            res.status(404).send( { success: false, content: `Không tìm thấy bảng có ID: ${table_id} ` })
        }
    })
})
// tạo mới trường + ràng buộc
router.post('/create/field_constraint', (req, res) => {

    const { table_id } = req.body;
    const {
        field_name,
        nullable,
        field_props,
        field_data_type,
        default_value,

        constraint_type,
        reference_on,
        check_fomular,
        check_on_field,
        default_check_value
    } = req.body;
    // console.log(req.body);
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
                    field.createConstraint({
                        constraint_type,

                        reference_on,
                        check_fomular,
                        check_on_field,              /*---*/
                        default_check_value
                    }, ({ success, id }) => {
                        table.getConstraint(id, ({ success, constraint }) => {
                            res.status(200).json({ success: true, content: "Thêm thành công", data: field, constraint });
                        })
                    })

                } else {
                    res.status(500).json({ success: true, content: "Thất bại" });
                }
            })
        } else {
            res.status(404).send( { success: false, content: `Không tìm thấy bảng có ID: ${table_id} ` })
        }
    })
})
// tạo mới trường
router.post('/create/field', (req, res) => {
    const { table_id } = req.body;
    const { field_name, nullable, field_props, field_data_type, default_value } = req.body;
    // console.log(req.body);
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
            res.status(404).send( { success: false, content: `Không tìm thấy bảng có ID: ${table_id} ` })
        }
    })
})
///Xóa trường
router.delete('/field_drop/:field_id', (req, res) => {

    const { field_id } = req.params;
    const field = new FieldController({ field_id })
    field.drop(({ success, content }) => {
        if (!success) {
            res.status(200).send( { success: true, content: "Xóa trường thành công" });
        }
        else{
              res.status(404).send( { success: false, content: "Xóa trường thất bại" });
        }

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
                    res.status(200).send( { success: true, content: "Thành công", constraints: data })
                } else {
                    res.status(200).send( { success: false, content: "Thất bại" })
                }
            })
        } else {
            res.status(200).send( { success: false, content: `Không tìm thấy bảng có ID: ${table_id} ` })
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
                res.status(200).send({ success: true, content: "Thành công", data: constraint.get() })
            })
        } else {
            res.status(404).send({ success: false, content: `Không tìm thấy bảng có ID: ${table_id}  ` })
        }
    })
})
// Xóa tất cả ràng buộc
router.delete('/dropall/constraints', (req, res) => {
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
                res.status(200).send( { success, content: "Xóa tất cả ràng buộc thành công " })
            })
        } else {
            res.status(200).send( { success: false, content: `Không tìm thấy bảng có ID: ${table_id} ` })
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
            res.send({ success: false, content: `Không tìm thấy bảng có ID: ${table_id}` })
        }
    })
})

///// Xóa ràng 1 buộcc
router.delete('/drop_id/constraints', (req, res) => {
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
                if (!success) {
                    res.send({ success: false, content: "Không thấy mã ràng buộc" });
                } else {
                    constraint.drop(({ success, content }) => {
                        // console.log(success, content);
                        if (success) {
                            res.status(200).send( { success: true, content: "Xóa ràng buộc thành công" })
                        } else {
                            res.status(200).send( { success: false, content: "Xóa ràng buộc thất bại" });
                        }
                    });
                }
            })
        } else {
            res.status(200).send( { success: false, content: "Không tìm thấy bảng" })
        }
    })
})
// Thay đổi ràng buộc
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
                        res.status(200).send( { success: true, content: "Thành công", data: constraint.get() })
                    })
                } else {
                    res.status(404).send( { success: false, content: "Không tìm thấy ràng buộc" })
                }
            })
        } else {
            res.status(404).send( { success: false, content: `Không tìm thấy bảng có ID: ${table_id} ` })
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

    console.log(req.body)

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
                        field_props: JSON.parse( field_props ),
                        field_data_type,
                        default_value
                    }, ({ success, content, field }) => {
                        res.status(200).send( { success: true, content: "Thành công", field: field.get() })
                    })
                } else {
                    res.status(404).send({ success: false, content: `Không tìm thấy trường có ID: ${field_id} ` })
                }
            })
        } else {
            res.status(404).send( { success: false, content: `Không tìm thấy bảng có ID: ${table_id} ` })
        }
    })
})

//thay đổi thông tin trường + ràng buộc
// router.put('/modify/field_cons', (req, res) => {
//     const { table_id } = req.body;
//     const {
//         field_id,
//         field_name,
//         nullable,
//         field_props,
//         field_data_type,
//         default_value,
//         constraint_id,
//         constraint_type,
//         reference_on,
//         check_fomular,
//         check_on_field,
//         default_check_value
//     } = req.body;

//     const Tables = new TablesController();
//     const criteria = [{
//         field: "table_id",
//         value: table_id,
//         fomula: "="
//     }]
//     Tables.getone(criteria, ({ success, table }) => {
//         if (success) {
//             table.getField(field_id, ({ success, field }) => {
//                 if (success) {
//                     field.modify({
//                         field_name,
//                         nullable,
//                         field_props,
//                         field_data_type,
//                         default_value
//                     }, ({ success, content, field }) => {
//                     table.


//                         res.send(200, { success: true, content: "Thành công", field: field.get() })
//                     })
//                 } else {
//                     res.send(404, { success: false, content: `Không tìm thấy trường có ID: ${field_id} ` })
//                 }
//             })
//         } else {
//             res.send(404, { success: false, content: `Không tìm thấy bảng có ID: ${table_id} ` })
//         }
//     })
// })


router.post('/:table_id/data/input', ( req, res ) => {

    const { table_id } = req.params;
    const { data } = req.body;

    const criteria = [{
           field: "table_id",
           value: table_id,
           fomula: "="
    }]

    const Tables = new TablesController();
    
    Tables.getone(criteria, ({ success, table }) => {
        if (success) {
            table.insert( data, ({ success, content }) => {

                res.status(200).send({ success, content })
            })
        } else {
            res.status(404).send( { success: false, content: `Không tìm thấy bảng có ID: ${table_id} ` })
        }
    })
})
module.exports = { router }
