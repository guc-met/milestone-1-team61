require('dotenv').config();

const express = require('express');

let gucStaff = require('../../models/gucstaff.model');
let attendanceSheets = require('../../models/attendance');

let router = express.Router();

const jwt = require('jsonwebtoken');
const { findOne } = require('../../models/gucstaff.model');
const gucstaffModel = require('../../models/gucstaff.model');
const requests = require('../../models/requests');
const slot = require('../../models/slot');

router.put('/assign', getToken , function (req , res){
   
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){

        if (err){ 
            return  res.sendStatus(403);
        }

        if (req.body.course === undefined){
            return res.json('Bad request');
        }

        if (req.body.course_teachers === undefined){
            return res.json('Bad request');
        }


        if (data.type === 'HOD'){
            let staffMember = await gucStaff.findOne({staff_id:data.staff_id});
            let courses = await staffMember.courses.find(courses=>course===req.body.course)

            if (courses === undefined){
                return res.json('Wrong course');
            }

            else {
                let totalCourses = await courses.findOne({name:req.body.name});
                totalCourses.course_teachers.push(req.body.course_teachers);
            }
        }
        totalCourses.course_teachers.save();
    })

});        


router.delete('/delete', getToken , function (req , res){
   
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){

        if (err){ 
            return  res.sendStatus(403);
        }

        if (req.body.course === undefined){
            return res.json('Bad request');
        }

        if (req.body.course_teachers === undefined){
            return res.json('Bad request');
        }


        if (data.type === 'HOD'){
            let staffMember = await gucStaff.findOne({staff_id:data.staff_id});
            let courses = await staffMember.courses.find(courses=>course===req.body.course)

            if (courses === undefined){
                return res.json('Wrong course');
            }

            else {
                let totalCourses = await courses.findOneAndDelete({name:req.body.name});
            }
        }
        totalCourses.course_teachers.save();
    })

});        

router.get('/view/:check', getToken , function (req , res){
   
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){

        if (err){ 
            return  res.sendStatus(403);
        }

        if (data.type !== 'HOD'){
            return res.sendStatus(401);
        }


        let result = [];
        if (check === 'all'){
            let departments = await departments.findOne({department_head_id:data.staff_id});
            for (i=0; i<departments.department_members.length; i++){
                result.push(await gucStaff.findOne({staff_id:department.department_members[i]}))
            }

            }

            else {
                let courses = await courses.findOne({course_name:req.params.course_name});
                if (courses === null){
                    res.json('Wrong course');
                }
                else{
                    for (i=0; i<course.course_teachers.length; i++){
                        result.push(await gucStaff.findOne({staff_id:courses.course_teachers[i]}))
                    }
                }

            }
        })
        return result;
});

router.get('/viewOff/:check', getToken , function (req , res){
   
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){

        if (err){ 
            return  res.sendStatus(403);
        }

        if (data.type !== 'HOD'){
            return res.sendStatus(401);
        }


        let result = [];
        let resulted =[];
        if (check === 'all'){
            let departments = await departments.findOne({department_head_id:data.staff_id});
            for (i=0; i<departments.department_members.length; i++){
                result.push(await gucStaff.findOne({staff_id:department.department_members[i]}))
            }
            for (j =0; j<result.length; j++){
                resulted.push(await result.findOne({daysOff:result[j].daysOff}))
            }

            }

            else {
                let departments = await departments.findOne({department_head_id:data.staff_id});
                staffMember = await departments.findOne({staff_id:req.params.staff_id})
                resulted = await staffMember.findOne({daysOff:staffMember.daysOff})

            }
        })
        return resulted;
});

router.get('/viewrequests', getToken , function (req , res){
   
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){

        let result = [];
        let resulted = [];
        if (err){ 
            return  res.sendStatus(403);
        }

        if (data.type !== 'HOD'){
            return res.sendStatus(401);
        }
        let staffMember = await gucStaff.findOne({staff_id:data.staff_id});
        let departments = await departments.findOne({department_head_id:data.staff_id});
            for (i=0; i<departments.department_members.length; i++){
                result.push(await gucStaff.findOne({staff_id:department.department_members[i]}))
            }
            for (j=0; j<result.length; j++){
                resulted.push(await requests.findOne({issuer:result[j].staff_id}))
            }
            return resulted;
        })
});

router.put('/accrequests', getToken , function (req , res){
   
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){

        let result = [];
        let resulted = [];
        let Tresult;
        if (err){ 
            return  res.sendStatus(403);
        }

        if (data.type !== 'HOD'){
            return res.sendStatus(401);
        }
        let staffMember = await gucStaff.findOne({staff_id:data.staff_id});
        let departments = await departments.findOne({department_head_id:data.staff_id});
            for (i=0; i<departments.department_members.length; i++){
                result.push(await gucStaff.findOne({staff_id:department.department_members[i]}))
            }
            for (j=0; j<result.length; j++){
                resulted.push(await requests.findOne({issuer:result[j].staff_id}))
            }
            Tresult = await resulted.findOne({requests_id:req.params.requests_id});
            Tresult.accepted = true;
            
        })
});

router.put('/rejrequests', getToken , function (req , res){
   
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){

        let result = [];
        let resulted = [];
        let Tresult;
        if (err){ 
            return  res.sendStatus(403);
        }

        if (data.type !== 'HOD'){
            return res.sendStatus(401);
        }
        let staffMember = await gucStaff.findOne({staff_id:data.staff_id});
        let departments = await departments.findOne({department_head_id:data.staff_id});
            for (i=0; i<departments.department_members.length; i++){
                result.push(await gucStaff.findOne({staff_id:department.department_members[i]}))
            }
            for (j=0; j<result.length; j++){
                resulted.push(await requests.findOne({issuer:result[j].staff_id}))
            }
            Tresult = await resulted.findOne({requests_id:req.params.requests_id});
            Tresult.accepted = false;
            Tresult.comment = req.body.comments;
            
        })
});

//coverage
router.get('/viewCoverage', getToken , function (req , res){
   
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){

        let  Tcourse;
        let result = [];
        let Tresult = [];
        
        if (err){ 
            return  res.sendStatus(403);
        }

        if (data.type !== 'HOD'){
            return res.sendStatus(401);
        }
        let staffMember = await gucStaff.findOne({staff_id:data.staff_id});
        let courses = await staffMember.courses.find(courses=>course===req.body.course)

        if (courses === undefined){
            return res.json('Wrong course');
        }

        else {
            Tcourse = await courses.findOne({name:req.params.course_name})
            Tresult = await slot.find({course_id:Tcourse})
            result = Tresult.find({teacher_id:'empty'})
        }
        return result/Tresult;
        })
});

router.get('/viewCoverage', getToken , function (req , res){
   
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){

        let  Tcourse;
        let result = [];
        let Tresult;
        let result1 = [];
        
        if (err){ 
            return  res.sendStatus(403);
        }

        if (data.type !== 'HOD'){
            return res.sendStatus(401);
        }
        let departments = await departments.findOne({department_head_id:data.staff_id});
            for (i=0; i<departments.department_members.length; i++){
                result.push(await gucStaff.findOne({staff_id:department.department_members[i]}))
            }
        Tresult = await result.findOne({staff_id:req.params.staff_id})
        result1 = await slot.find({teacher_id:Tresult})
        return result1;

        })
});

