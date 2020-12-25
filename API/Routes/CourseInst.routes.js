
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
let gucStaff = require('../../models/gucstaff.model');
let gucHR = require('../../models/guchr.model');
let attendanceSheets = require('../../models/attendance');
let course = require('../../models/course.model');
let slot = require('../../models/slot.model');
let router = express.Router();

const jwt = require('jsonwebtoken');
const { findOne } = require('../../models/gucstaff.model');


//////////////////////////////////////////////////////////////////////////////////////////////

router.get('/viewcourses', getToken , function (req , res){
   
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){

        if (err){ 
            return  res.sendStatus(403);
        }

        if (data.type === 'CI'){
            let staffMember = await gucStaff.findOne({staff_id:data.staff_id});
            
            if (staffMember === undefined){
                return res.json('No ci found');
            }

            else {
                res.json({CoveredCourses:staffMember.courses}); 
            }
        }
      
    })

});

/////////////////////////////////////////////////////////////////////////////////////////////////////


router.get('/assignedslots', getToken , function (req , res){
   
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){

        if (err){ 
            return  res.sendStatus(403);
        }

        if (data.type === 'CI'){
            let staffMember = await gucStaff.findOne({staff_id:data.staff_id});
            
            if (staffMember === undefined){
                return res.json('No ci found');
            }

            else {
                let assignedslots = await slot.find({teacher_id:staffMember.username})
                res.json({assignedslots}); 
            }

        }
      
    })

});





/////////////////////////////////////////////////////////////////////////////////////////////////





router.get('/viewCoStaff', getToken , function (req , res){
   
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){

        if (err){ 
            return  res.sendStatus(403);
        }

        if (data.type === 'CI'){
            let staffMember = await gucStaff.findOne({staff_id:data.staff_id});
            let department = staffMember.department;
            if (staffMember === undefined){
                return res.json('No ci found');
            }
         
            else {
                let departmentcourses = await department.courses;
                let coStaff = await departmentcourses.course_teachers ;
                let profs = await departmentcourses.course_professors;
                res.json(coStaff,profs); 
            }
        }
      
    })

});

////////////////////////////ASSIGN SLOTS////////////////////////////////////////////////





router.post('/assignslot', getToken , function (req , res){
   
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){

        if (err){ 
            return  res.sendStatus(403);
        }

        if (data.type === 'CI'){
            let staffMember = await gucStaff.findOne({staff_id:data.staff_id});
            let department = staffMember.department;
            if (staffMember === undefined){
                return res.json('Permission denied');
            }
         
            else {
               var name = req.body.teacher_id;
               var course = req.body.course_id;
               var day = req.body.day;
               var Slotnumber = req.body.Slotnumber;

               let NewSlot = new slot({teacher_id:name,course_id:course,day:day,Slotnumber:Slotnumber})

               NewSlot.save();
                
            }


        }
      
    })

});

















////////////////////////Delete/update asssigment///////////////////////////////


router.post('/deleteassignment', getToken , function (req , res){
   
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){

        if (err){ 
            return  res.sendStatus(403);
        }

        if (data.type === 'CI'){
            let staffMember = await gucStaff.findOne({staff_id:data.staff_id});
            let department = staffMember.department;
            if (staffMember === undefined){
                return res.json('Permission denied');
            }
         
            else{
            let target = await slot.findOne({course_id:req.body.course_id,
           teacher_id:req.body.teacher_id,day:req.body.day,Slotnumber:req.body.Slotnumber})
           
           target.course_id = 'empty';
           target.teacher_id = 'empty';

           target.save();

            

            }

            
        }
      
    })

});








////////////////////////////update course assignment/////////////////////////






router.post('/updateassignment', getToken , function (req , res){
   
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){

        if (err){ 
            return  res.sendStatus(403);
        }

        if (data.type === 'CI'){
            let staffMember = await gucStaff.findOne({staff_id:data.staff_id});
            let department = staffMember.department;
            if (staffMember === undefined){
                return res.json('Permission denied');
            }
         
            else{
            let target = await slot.findOneAndUpdate({course_id:req.body.course_id,
           teacher_id:req.body.teacher_id,day:req.body.day,Slotnumber:req.body.Slotnumber},req.body)
           
           target.course_id = req.body.course_id;
           target.teacher_id = req.body.teacher_id;

           target.save();
      
            

            }

            
        }
      
    })

});

















//////////////////////////////////////////////////remove assigned memeber//////////////////////////


router.post('/updateassignment', getToken , function (req , res){
   
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){
     let  i = 0;
    let target = [];
        if (err){ 
            return  res.sendStatus(403);
        }

        if (data.type === 'CI'){
            let staffMember = await gucStaff.findOne({staff_id:data.staff_id});
            let department = staffMember.department;
            if (staffMember === undefined){
                return res.json('Permission denied');
            }
         
            else{
            target = await slot.find({course_id:req.body.course_id,
           teacher_id:req.body.teacher_id})
            
           while(target[i] != null){
           target[i].teacher_id = 'empty';
           target[i].save();
           i++;
           }

            }

            
        }
      
    })

});

////////////////////////////////////assign coordinator//////////////////////////////



router.post('/coordassignment', getToken , function (req , res){
   
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){
    let i = 0;
   
        if (err){ 
            return  res.sendStatus(403);
        }

        if (data.type === 'CI'){
            let staffMember = await gucStaff.findOne({staff_id:data.staff_id});
            let department = staffMember.department;
            if (staffMember === undefined){
                return res.json('Permission denied');
            }
         
            else{
            let select = await course.findOne({teacher_id:req.body.teacher_id,course_id:req.body.course_id});
            select.course_coordinator = req.body.teacher_id;
            select.save();
           

            }

            
        }
      
    })

});





