const express = require('express');
const router = express.Router()
const Table = require('../Model/Table');
const { TablesController } = require('../controller/tables-controller');

//@route GET api/${ unique_string }/tables/getall
//@desc Xem tất cả các bảng

router.get('/getall', (req, res) => {
    const Tables = new TablesController();
    Tables.getall(({ success, tables }) => {
        if (success) {
            res.status(200).json({ success: true, content: "Thành công", data: tables });
        } else {
            res.status(500).json({ success: false, content: "Thất bại" });
        }
    })
})
//@route GET api/${ unique_string }/tables/getall_credential/:credential_string
//@desc Xem tất cả các bảng theo credentials_string

router.get('/getall_credential/:credential_string', (req, res) => {
    const credential_string = req.params.credential_string
    const Tables = new TablesController();
    Tables.getAllUsingCredentialString(credential_string, ({ success, tables }) => {
        if (success) {
            const data = tables.map(table => table.get());
            res.status(200).json({ success: true, content: "Thành công", data: data });

        } else {
            res.status(500).json({ success: false, content: "Không tìm thấy" });
        }
    })
})
// router.get('/',function(req,res){
//      const Tables = new TablesController();
//     Tables.getall(function(err,count){

//     if(err){ return res.status(500).json({ success: false, error: err });

//     } else{
//         return res.status(201).json({ data: count });
//     }
// });
// });
//@route GET api/${ unique_string }/tables/table/:table_id
//@desc Xem tất cả các bảng theo table_id

router.get('/table/:table_id', (req, res) => {
    const Tables = new TablesController();

    const criteria = [{
        field: "table_id",
        value: req.params.table_id,
        fomula: "="
    }]
    Tables.getone(criteria, ({ success, table, content }) => {
        if (success) {
            res.status(200).json({ success: true, content: "Thành công", data: table });
        } else {
            res.status(404).json({ success: true, content: "Thất bại" });
        }
    })
})
//@route POST api/${ unique_string }/tables/create
//@desc Tạo bảng mới

router.post('/create', (req, res) => {
    const Tables = new TablesController();
    const { table_name, credential_string } = req.body;
    Tables.createTable({ table_name, credential_string }, ({ success, table }) => {
        if (success) {
            res.status(200).json({ success: true, content: "Thêm bảng thành công", data: table });
        }
        else {
            res.status(404).json({ success: false, content: "Thêm bảng thất bại" });
        }
    })
})
//sửa bảng
router.put('/modify', function (req, res) {
    const { table_id, table_name } = req.body;

    const Tables = new TablesController();
    const criteria = [{
        field: "table_id",
        value: table_id,
        fomula: "="
    }]
    Tables.getone(criteria, ({ success, table }) => {
        if (success) {
            table.modify(table_name, ({ success }) => {
                res.send({ success: true, content: "Sửa bảng thành công " })
            })
        } else {
            res.send({ success: false, content: `Không tìm thấy bảng có ID: ${table_id}` })
        }
    })
});
//xóa bảng
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
                res.status(200).send({ success: true, content: "Xóa bảng thành công" })
            })
        } else {
            res.status(404).send({ success: false, content: `Không tìm thấy bảng có ID: ${table_id}` })
        }
    })
})
//xóa tất cả bảng
router.delete('/delete/all', (req, res) => {
    const Tables = new TablesController();

    Tables.dropAllTables((result) => {
        const { success, content } = result;
        if (success) {
            res.send(200, { success, content })
        }
    })
})
module.exports = { router }
