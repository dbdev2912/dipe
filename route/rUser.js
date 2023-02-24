var express = require('express');
const User = require('../Model/User');
var router = express.Router();

//@route GET api/user/GetAll
//@desc GetAll or GetById user 
//@access Public
router.get('/getall/:credential_string?',function(req,res){
    if(req.params.credential_string){
        try {
            User.getUserById(req.params.credential_string,function(err,rows){
            return res.status(200).json({ success: true, content: "Thành công",data:rows });
            });
            } catch (error) {
            return res.status(500).json({ success: false, content: "Không tìm thấy!"});
            }
  
        }else{
            User.getAllUser(function(err,rows){
            if(err){
                return res.status(404).json({ success: false, error: "Lỗi!" });
            } else {
                return res.status(200).json({ success: true, content: "Thành công", data:rows});
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
router.put('/active',function(req,res){
    User.activeUser(req.body, function(err,count){
        if(err){
             return res.status(500).json({ success: false, content: "Cập nhật thất bại!"  });
        } else{
            return res.status(201).json({ success: true, content: "Cập nhật thành công!"});
        }
    });
});
//@route POST api/user/changePassword
//@desc changepass user 
//@access Public
router.put('/changePassword', async(req, res)=>{
    User.user_change_password(req.body, function(err,count){
        if(err){
             return res.status(500).json({ success: false, content: "Cập nhật thất bại!"  });
        } else{
            return res.status(201).json({ success: true, content: "Cập nhật thành công!" });
        }
    });
})
//@route POST api/user/changeInfo
//@desc change Info user 
//@access Public
router.put('/changeInfo', async(req, res)=>{
    User.user_change_info(req.body, function(err,count){
        if(err){
             return res.status(500).json({ success: false, content: "Cập nhật thất bại!"  });
        } else{
            return res.status(201).json({ success: true, content: "Cập nhật thành công!" });
        }
    });
})
module.exports=router;

