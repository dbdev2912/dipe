var express = require('express');
const Table = require('../../Model/Table');
var router = express.Router();
const Str = require('@supercharge/strings')


//@route GET api/table
//@desc getall table 
//@access Public
router.get('/',function(req,res){
    Table.getAllTable(function(err,count){
    
    if(err){ return res.status(500).json({ success: false, error: err });
       
    } else{
        return res.status(201).json({ data: count });
    }
});
});

//@route POST api/table/create
//@desc create table 
//@access Public
router.post('/create',function(req,res){
        Table.table_add(req.body,function(err,count){
        
        if(err){ return res.status(500).json({ success: false, error: "Vui lòng nhập dữ liệu!" });
           
        } else{
            return res.status(201).json({ data: count });
        }
    });
});
//@route POST api/table/modify
//@desc modify table 
//@access Public
router.post('/modify',function(req,res){
    Table.table_modify(req.body,function(err,count){
    
    if(err){ return res.status(500).json({ success: false, error: "Vui lòng nhập dữ liệu!" });
       
    } else{
        return res.status(201).json({ data: count });
    }
    });
});


router.post('/drop',function(req,res){
    Table.drop_table(req.body,function(err,count){
    
    if(err){ return res.status(500).json({ success: false, error: "Vui lòng nhập dữ liệu!" });
       
    } else{
        return res.status(201).json({ data: count });
    }
    });
});
module.exports=router;