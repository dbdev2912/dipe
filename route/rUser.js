var express = require('express');
const User = require('../Model/User');
var router = express.Router();
var db = require("../Connect/Dbconnection")

const { cropIMG } = require('../module/crop');

const { mysql } = require('../Connect/conect');
//@route GET api/user/GetAll
//@desc GetAll or GetById user
//@access Public
router.get('/getall/:credential_string?', function (req, res) {
    if (req.params.credential_string) {
        try {
            User.getUser_detail(req.params.credential_string, function (err, rows) {
                if (err) {
                    return res.status(404).json({ success: false, error: "Lỗi!" });
                } else {
                    return res.status(200).json({ success: true, content: "Thành công", data: rows });
                }
            });
        } catch (error) {
            return res.status(500).json({ success: false, content: "Không tìm thấy!" });
        }
    } else {
        User.getAllUser(function (err, rows) {
            if (err) {
                return res.status(404).json({ success: false, error: "Lỗi!" });
            } else {
                return res.status(200).json({ success: true, content: "Thành công", data: rows });
            }

        });
    }
});
//@route POST api/auth/register
//@desc Register user
//@access Public
// router.post('/register',function(req,res){
//     try {
//         User.addUser(req.body,function(err,count){

//             if(err){ return res.status(500).json({ success: false, error: "Vui lòng nhập dữ liệu!" });
//             } else{
//                 return res.status(201).json({ data: count });
//             }
//         });
//     } catch (error) {
//        return res.status(500).json({success: false, message: error.message});
//     }

// });
//@route POST api/user/active
//@desc Update Role user
//@access Public
router.put('/active', function (req, res) {
    User.activeUser(req.body, function (err, count) {
        if (err) {
            return res.status(500).json({ success: false, content: "Cập nhật thất bại!" });
        } else {
            return res.status(201).json({ success: true, content: "Cập nhật thành công!" });
        }
    });
});
//@route POST api/user/changePassword
//@desc changepass user
//@access Public
router.put('/changePassword', async (req, res) => {
    User.user_change_password(req.body, function (err, count) {
        if (err) {
            return res.status(500).json({ success: false, content: "Cập nhật thất bại!" });
        } else {
            return res.status(201).json({ success: true, content: "Cập nhật thành công!" });
        }
    });
})
//@route POST api/user/changeInfo
//@desc change Info user
//@access Public
router.put('/changeInfo', async (req, res) => {
    User.user_change_info(req.body, function (err, count) {
        if (err) {
            return res.status(500).json({ success: false, content: "Cập nhật thất bại!" });
        } else {
            return res.status(201).json({ success: true, content: "Cập nhật thành công!" });
        }
    });
})
router.delete('/delete/:credential_string', async (req, res) => {
    const { credential_string } = req.params;
    User.delete_user(req.params, function (err, result) {
        const { success, content } = result[0][0]
        if (success) {
            // Xoa o day ne
            const query = `DELETE FROM accounts WHERE credential_string = '${credential_string}';`;
            db.query(query);
            if (err) {
                return res.status(500).json({ success: false, content: "Xóa thất bại!" });
            } else {
                return res.status(201).json({ success: true, content: "Xóa thành công!" });
            }
        }
        else {
            return res.status(404).json({ success: false, content: "Không tìm thấy người dùng" });
        }
    });
})


router.put(`/prop/:credential_string`, (req, res) => {
    const { key, value } = req.body;
    const { credential_string } = req.params;
    const query = `
        UPDATE ACCOUNT_DETAIL SET ${ key } = '${ value }'
            WHERE CREDENTIAL_STRING = '${credential_string}';
    `;
    mysql( query, result => {
        res.status(200).send({ success: true })
    })
})
router.put(`/:credential_string/changeava`, (req, res) => {
    const { img } = req.body;
    const { credential_string } = req.params;
    cropIMG( img, credential_string, ({ success, avatar }) => {
        const query = `
            UPDATE ACCOUNT_DETAIL SET AVATAR = '${ avatar }'
            WHERE CREDENTIAL_STRING = '${ credential_string }'
        `;
        mysql( query, result => {
            res.send({  success: true })
        })
    })
})
module.exports = router;
