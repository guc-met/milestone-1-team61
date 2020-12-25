require('dotenv').config();

const express = require('express');

let gucStaff = require('../../models/gucstaff.model');
let attendanceSheets = require('../../models/attendance');

let router = express.Router();

const jwt = require('jsonwebtoken');
const { findOne } = require('../../models/gucstaff.model');
const gucstaffModel = require('../../models/gucstaff.model');
const requests = require('../../models/requests');
const slot = require('../../models/slot.model');

router.get('/viewSlotLinking', getToken , function (req , res){
   
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){

        let  Tcourse;
        let result = [];
        let Tresult;
        let result1 = [];
        
        if (err){ 
            return  res.sendStatus(403);
        }

        if (data.type !== 'CC'){
            return res.sendStatus(401);
        }
        let staffMember = await gucStaff.findOne({staff_id:data.staff_id});
        let courses = await staffMember.courses.findOne({course_coordinator:staffMember});
        result = await slot.find({course_id:courses});

        })
        return result;
});

router.get('/accSlotLinking', getToken , function (req , res){
   
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){

        let  Tcourse;
        let result = [];
        let Tresult;
        let result1 = [];
        
        if (err){ 
            return  res.sendStatus(403);
        }

        if (data.type !== 'CC'){
            return res.sendStatus(401);
        }
        let staffMember = await gucStaff.findOne({staff_id:data.staff_id});
        let courses = await staffMember.courses.findOne({course_coordinator:staffMember});
        result = await slot.find({course_id:courses});

        })
        result1 = await result.findOne({request_id:req.params.request_id});
        result1.accepted = true;
});

router.get('/accSlotLinking', getToken , function (req , res){
   
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){

        let  Tcourse;
        let result = [];
        let Tresult;
        let result1 = [];
        
        if (err){ 
            return  res.sendStatus(403);
        }

        if (data.type !== 'CC'){
            return res.sendStatus(401);
        }
        let staffMember = await gucStaff.findOne({staff_id:data.staff_id});
        let courses = await staffMember.courses.findOne({course_coordinator:staffMember});
        result = await slot.find({course_id:courses});

        })
        result1 = await result.findOne({request_id:req.params.request_id});
        result1.accepted = false;
});

router.post('/DelCourse', getToken , function (req , res){
   
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){

        let  Tcourse;
        let result = [];
        let Tresult;
        let result1 = [];
        
        if (err){ 
            return  res.sendStatus(403);
        }

        if (data.type !== 'CC'){
            return res.sendStatus(401);
        }
        let staffMember = await gucStaff.findOne({staff_id:data.staff_id});
        Tresult = await slot.findOneAndDelete({teacher_id:req.body.teacher_id, course_id:req.body.course_id, day:req.body.day, Slotnumber:req.body.Slotnumber}) 
        })
});

router.post('/UpdateCourse', getToken , function (req , res){
   
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){

        let  Tcourse;
        let result = [];
        let Tresult;
        let result1 = [];
        
        if (err){ 
            return  res.sendStatus(403);
        }

        if (data.type !== 'CC'){
            return res.sendStatus(401);
        }
        let staffMember = await gucStaff.findOne({staff_id:data.staff_id});
        Tresult = await slot.findOneAndUpdate({teacher_id:req.body.teacher_id, course_id:req.body.course_id, day:req.body.day, Slotnumber:req.body.Slotnumber}) 
        Tresult.teacher_id = req.params.teacher_id;
        Tresult.course_id = req.params.course_id;
        Tresult.day = req.params.day;
        Tresult.Slotnumber = req.params.Slotnumber;

        })
});

