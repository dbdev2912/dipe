var express = require('express');
const Field= require('../../Model/Field');
var router = express.Router();

//@route POST api/field/add_field
//@desc  add Field
//@access Public
router.post('/add_field',function(req,res){
    Field.add_field(req.body,function(err,count){
    
    if(err){ return res.status(500).json({ success: false, message: err.message  });
       
    } else{
        return res.status(201).json({ data: count });
    }
    });
});

//@route POST api/field/modify_field
//@desc 
//@access Public
router.post('/modify_field',function(req,res){
    Field.modify_field(req.body,function(err,count){
    
    if(err){ return res.status(500).json({ success: false, 
    });
       
    } else{
        return res.status(201).json({ data: count });
    }
    });
});


//@route POST api/field/delete
//@desc Drop Field
//@access Public
router.post('/drop_field',function(req,res){
    Field.drop_field(req.body,function(err,count){
    
    if(err){ return res.status(500).json({ success: false, message: err.message});
       
    } else{
        return res.status(201).json({ data: count });
    }
    });
});

module.exports=router;