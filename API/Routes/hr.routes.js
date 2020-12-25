let express = require('express');

let gucStaff = require('../../models/gucstaff.model');
let gucHR = require('../../models/guchr.model');
let attendanceSheets = require('../../models/attendance');

let router = express.Router();

let jwt = require('jsonwebtoken');
let locationsModel = require('../../models/locations.model');
let facultyModel = require('../../models/faculty.model');
let departments = require('../../models/department.model');
let courseModel = require('../../models/course.model');




////////////////////////////////////////////ADD STAFF MEMBER//////////////////////////////////////////////////////////////////////////

router.post('/add-staff',getToken,  function(req,res){
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){
        if(err) return res.sendStatus(403);
        let hr = await gucHR.findOne({staff_id:data.staff_id});
       let expire = await checkTokenIfExpired(hr.expiredTokens , req.token);
                     if (expire === true){
                         return res.json('Token Expired');
                     }  
        if (data.type !=="HR") return res.json("Non HR users are not allowed to add new Staff");

        

       

      var message = await validateNewStaff(req.body);

        console.log(message);
        if(message!=='OK'){
              return res.json(message);
        }else{
            const {email} = req.body;   
        let  staff = await gucStaff.findOne({email:email});
        if (staff===null){
            var office = await locationsModel.findOne({locationName:req.body.office});
            
            office.teachers_in_office.push({name:req.body.staff_id});
            office.occupant++;    
            office.save();
            req.body.daysOff.push("friday");
            let  newStaff  = new gucStaff(req.body);
            let newSheet = new attendanceSheets({staff_id:req.body.staff_id});
            newSheet.save();
            newStaff.password = newStaff.hashPassword("123456");
            newStaff.save().then(function(){
              return res.status(200).json({
                    message:"user added successfuly by " ,
                    data
                    
                });
            });
        }else{
          return res.send("this email already exists");
        }
        }
        
        });
    
    });

//////////////////////////////////////////////UPDATE NEW STAFF///////////////////////////////////////////////////////////////////////////////

    router.put('/update-staff/:staff_id',getToken,function(req,res){
        jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){
            let hr = await gucHR.findOne({staff_id:data.staff_id})
           let expire = await checkTokenIfExpired(hr.expiredTokens , req.token);
                     if (expire === true){
                         return res.json('Token Expired');
                     }  
            if (err){
              return res.sendStatus(403);
            }else{
                if(data.type!=="HR"){
                      return res.status(401).json("NON HR Members are not allowed to update others information.");
                }else{
                    if ((req.body.daysOff!== undefined && req.params.staff_id.split('-')[0]==="hr")){
                        return res.json("hr days off are fixed");
                    }
                    if (req.body.staff_id !== undefined || req.body.email!==undefined){
                      return res.json("you can't change id or email");
                    }else{
                        if (req.params.staff_id.split('-')[0]==="ac"){
                            var staff = await gucStaff.findOne({staff_id:req.params.staff_id});
                        }else{
                            var staff = await gucHR.findOne({staff_id:req.params.staff_id});
                        }
                        if (req.body.office!== undefined){
                            var office = await locationsModel.findOne({locationName:req.body.office});
                            if (office === null){
                              return res.json("office "+req.body.office+" doesn't exist");
                            }else{
                                if (office.type!=='office'){
                                  return res.json("office "+req.body.office+" is not an office space");
                                }else{
                                      
                                    if (office.occupant === office.capacity){
                                   return res.json("Not enough space");       
                                    }else{
                                        var old_office = await locationsModel.findOne({locationName:staff.office});
                                        old_office.teachers_in_office.pop({name:req.params.staff_id});
                                        old_office.occupant--;
                                        old_office.save();
                                        office.teachers_in_office.push({name:req.params.staff_id});
                                        office.occupant++;
                                        office.save();
                                    }
                                }
                            }
                        }

                        let updated_Staff = staff.update(req.body);
                        updated_Staff.save();
                      return res.status(200).json("staff updated successfully");
                    }   
                }
            }
        })

    });

    ////////////////////////////////////////////////DELETE STAFF MEMBER///////////////////////////////////////////////////////////////////////////////////////////

    router.delete('/delete-staff/:staff_id',getToken,function(req,res){
        jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){
            let hr = await gucHR.findOne({staff_id:data.staff_id})
           let expire = await checkTokenIfExpired(hr.expiredTokens , req.token);
                     if (expire === true){
                         return res.json('Token Expired');
                     }  
            if (err){
              return res.sendStatus(403);
            }else{
                if (data.type!=="HR"){
                  return res.status(401).json("only HR can delete staff.");
                }else{
                    if (req.params.staff_id.split('-')[0]==='ac'){
                        var deletedStaff = await gucStaff.findOneAndRemove({staff_id:req.params.staff_id});
                    }else{
                        var deletedStaff = await gucHR.findOneAndRemove({staff_id:req.params.staff_id});
                    }

                    if (deletedStaff === null){
                      return res.json('user does not exist' );
                    }else{
                        var office = await locationsModel.findOne({locationName:deletedStaff.office});
                        office.teachers_in_office.pop({name:req.params.staff_id});
                        office.occupant++;
                        office.save();
                      return res.status(200).json('staff ' + req.params.staff_id +'deleted successfully' );
                    }
                }
            }

        })
    })

    /////////////////////////////////////////////////////ADD NEW LOCATION///////////////////////////////////////////////////////////////
    
    router.post('/add-location',getToken,function(req,res){
        jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){
            if(err) return res.sendStatus(403);
            let hr = await gucHR.findOne({staff_id:data.staff_id})
           let expire = await checkTokenIfExpired(hr.expiredTokens , req.token);
                     if (expire === true){
                         return res.json('Token Expired');
                     }  
            
            if (data.type ==="HR"){ 
                if (req.body.roomNumber === undefined||req.body.capacity === undefined||req.body.floor === undefined||req.body.building === undefined||
                    req.body.type === undefined){
                      return res.json("please Enter all relevant information");
                    }else{
                      var  locationNumber = req.body.roomNumber;
                      var  locationType = req.body.type;
                      var  locationCapacity = req.body.capacity;
                      var  locationFloor = req.body.floor;
                      var  locationBuilding = req.body.building;
                      var  locationRoomName = locationBuilding+'-'+locationFloor+locationNumber;
        
                        let location = await locationsModel.findOne({locationName:locationRoomName});
                        if (location!==null){
                          return res.json("room already exists");
                        }else{
                           const location1 = {
                                roomNumber:locationNumber,
                                type:locationType,
                                capacity:locationCapacity,
                                floor: locationFloor,
                                locationName:locationRoomName,
                                building:locationBuilding
                            }
                            let location = new locationsModel(location1);
                            location.save().then(function(){
                              return res.status(200).json({
                                    message:"Location added successfuly by " ,
                                    data
                                    
                                });
                            });
                        
                        }
                    }
              

                }else{
                  return res.sendStatus(401);

            
        
                }

    });
});

///////////////////////////////////////////////////UODATE LOCATION/////////////////////////////////////////////////////////////////////////////////////

    router.put('/update-location/:roomName',getToken,function(req,res){
        jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){
            if(err) return res.sendStatus(403);
            let hr = await gucHR.findOne({staff_id:data.staff_id})
           let expire = await checkTokenIfExpired(hr.expiredTokens , req.token);
                     if (expire === true){
                         return res.json('Token Expired');
                     }  
            
            if (data.type ==="HR"){ 

                if (req.body.occupant){
                    return res.json("You have to add or remove a teacher");
                }

                var location = await locationsModel.findOneAndUpdate({locationName:req.params.roomName},req.body);

           
            
            if (location===null){
              return res.json("wrong location name");
            }else{
              return res.json("location Updated");
    
            }
            

            }
            else{
              return res.sendStatus(401);
            }
    });
    });
    ///////////////////////////////////////////////////////DELETE LOCATION//////////////////////////////////////////////////////////////////////////////////////

    router.delete('/delete-location/:roomNumber',getToken,function(req,res){
        jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){
            if(err) return res.sendStatus(403);
            let hr = await gucHR.findOne({staff_id:data.staff_id})
           let expire = await checkTokenIfExpired(hr.expiredTokens , req.token);
                     if (expire === true){
                         return res.json('Token Expired');
                     }  
            
            if (data.type ==="HR"){ 

                var  location = await locationsModel.findOneAndRemove({locationName:req.params.roomNumber});
                console.log(location);
            

            if (location===null){
              return res.json("wrong location name");
            }else{
              return res.json("location delete");
    
            }
            
            }
            else{
              return res.sendStatus(401);
            }
    });

    });


///////////////////////////////////////////////////////ADD FACULTY/////////////////////////////////////////////////////////////////////////////////

router.post('/add-faculty',getToken,function(req,res){
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){
        if(err) return res.sendStatus(403);
        let hr = await gucHR.findOne({staff_id:data.staff_id})
           let expire = await checkTokenIfExpired(hr.expiredTokens , req.token);
                     if (expire === true){
                         return res.json('Token Expired');
                     }  
        
        if (data.type ==="HR"){ 

            if (req.body.dean_id=== undefined||req.body.dean_name=== undefined || req.body.name===undefined){
              return res.json("please Enter all information");
            }else{
                var   dean_id = req.body.dean_id;
                var  dean_name = req.body.dean_name;
                var  faculty_name = req.body.name;

                var faculty = await facultyModel.findOne({name:faculty_name})
                if (faculty!== null){

                  return res.json("faculty of "+ faculty_name+" already exists");

                }else{

                    if (req.body.departments === null){
                        faculty = {
                            dean_id:eq.body.dean_id,
                            dean_name:req.body.dean_name,
                            name:req.body.name
                        }
                    let    newFaculty = new facultyModel(faculty);
                    newFaculty.save();
                  return res.json("faculty of "+faculty.name+" created");
                    }else{
                        faculty = {
                            dean_id:req.body.dean_id,
                            dean_name:req.body.dean_name,
                            name:req.body.name,
                            departments:req.body.departments
                        }    
                        newFaculty = new facultyModel(faculty);
                    newFaculty.save();
                  return res.json("faculty of "+faculty.name+" created");
                }
                   
                }

            }
           
            

        }else{
          return res.sendStatus(401);
        }
});
    })
/////////////////////////////////////////////////////////////////////////////////////////////////////UPDATE FACULTY/////////////////////////////////////////////////
router.put('/update-faculty/:facultyName',getToken,function(req,res){
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){
        if(err) return res.sendStatus(403);
        let hr = await gucHR.findOne({staff_id:data.staff_id})
           let expire = await checkTokenIfExpired(hr.expiredTokens , req.token);
                     if (expire === true){
                         return res.json('Token Expired');
                     }  
        
        if (data.type ==="HR"){ 

            if (req.body.departments!==undefined){
                var faculty = await facultyModel.findOne({name:req.params.facultyName});

                if (faculty===null){
                  return res.json("wrong faculty name");
                }else{
                    var   check = false;
                    var   allDepartments = faculty.departments;
                        for(i = 0 ; i< req.body.departments.length;i++){
                            for( j = 0 ; j <allDepartments.length;j++){
                                if (req.body.departments[i]===allDepartments[j]){

                                    check  = true;
                                    break;
                                }

                            }
                            if (check  === false){

                                allDepartments.push(req.body.departments[i])
                            }

                        }
                        req.body.departments = allDepartments;
                        faculty = await facultyModel.findOneAndUpdate({name:req.params.facultyName},req.body);
                        faculty.save()
                  return res.json("faculty Updated");
        
                }
            
            }else{
                faculty = await facultyModel.findOneAndUpdate({name:req.params.facultyName},req.body);

                if (faculty===null){
                  return res.json("wrong faculty name");
                }else{
                  return res.json("faculty Updated");
        
                }
            }

        }
        else{
          return res.sendStatus(401);
        }
});
});
////////////////////////////////////////////////////////////////////////////////////////DELETE FACULTY///////////////////////////////////////////////////////////////

router.delete('/delete-faculty/:facName',getToken,function(req,res){
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){
        if(err) return res.sendStatus(403);
        let hr = await gucHR.findOne({staff_id:data.staff_id})
           let expire = await checkTokenIfExpired(hr.expiredTokens , req.token);
                     if (expire === true){
                         return res.json('Token Expired');
                     }  
        
        if (data.type ==="HR"){ 

        faculty = await facultyModel.findOneAndRemove({name:req.params.facName});

        if (faculty===null){
          return res.json("wrong faculty name");
        }else{
          return res.json("faculty deleted");

        }
        }
        else{
          return res.sendStatus(401);
        }
})
});
/////////////////////////////////////////////////////////////***////////////////////////////////////////////////////////// 



 router.post('/add-department',getToken,function(req,res){
     jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){
        let hr = await gucHR.findOne({staff_id:data.staff_id})
           let expire = await checkTokenIfExpired(hr.expiredTokens , req.token);
                     if (expire === true){
                         return res.json('Token Expired');
                     }      
        if (err){
              return res.sendStatus(401);
            }else{

                if (data.type === "HR"){
                    if (req.body.name === undefined||req.body.coordinator_id === undefined||
                        req.body.department_head_id === undefined|| req.body.faculty ===undefined){
                          return res.json('please enter all relevent info.');

                    }else{

                        faculty = await facultyModel.findOne({name:req.body.faculty})
                        if (faculty===null){
                          return res.json("no "+req.body.faculty+" exists");
                        }else{
                            departmentCheck = await departments.findOne({name:req.body.name});
                            if (departmentCheck ===null){
                                department = {
                                    name:req.body.name,
                                    coordinator_id:req.body.coordinator_id,
                                    department_head_id:req.body.department_head_id,
                                    faculty:req.body.faculty,
                                    courses:req.body.courses
                                }
                                newDepartment = new departments(department);
                                newDepartment.save();
    
                                faculty.departments.push(newDepartment.name);
                                faculty.save();
    
                              return res.json("department added successfuly");
                            }else{
                              return res.json("department already exists");

                            }
                          
                        }
                       
                    }
                }
                else{
                  return res.sendStatus(401);
                }
            }

     });
    });




router.put('/update-department/:depName',getToken,function(req,res){
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){
        if(err) return res.sendStatus(403);
        let hr = await gucHR.findOne({staff_id:data.staff_id})
           let expire = await checkTokenIfExpired(hr.expiredTokens , req.token);
                     if (expire === true){
                         return res.json('Token Expired');
                     }  
        
        if (data.type ==="HR"){ 
        let    department = await departments.findOne({name:req.params.depName});

        if (req.body.faculty !== undefined){
            return res.json("not allowed to change faculty");
        }

            if (req.body.courses!==undefined){

                if (department===null){
                  return res.json("wrong department name");
                }else{
                    check = false;
                    allCourses = department.courses;
                        for(i = 0 ; i< req.body.courses.length;i++){
                            for( j = 0 ; j <allCourses.length;j++){
                                if (req.body.courses[i]===allCourses[j]){
                                    check  = true;
                                    break;
                                }
                            }
                            if (check  === false){
                                allCourses.push(req.body.courses[i])
                            }

                        }
                        req.body.courses = allCourses;
                        if (req.body.name !== undefined){
                            let faculty  = await facultyModel.findOne({name:department.faculty});
                        
                            for (i = 0 ; i < faculty.departments.length;i++){
        
                                if (faculty.departments[i]===department.name){
        
        
                                   faculty.departments.pop(faculty.departments[i]); 
                                   faculty.departments.push(req.body.name)
        
        
                                    faculty.save();
        
                                }
                            }
        
                        }
                        
                        department = await departments.findOneAndUpdate({name:req.params.depName},req.body);
                        
                  return res.json("department Updated");
        
                }
            
            }else{
                if (department === null){
                    return res.json("department doesn't exist");
                }
                if (req.body.name !== undefined){
                    let faculty  = await facultyModel.findOne({name:department.faculty});
                
                    for (i = 0 ; i < faculty.departments.length;i++){

                        if (faculty.departments[i]===department.name){


                           faculty.departments.pop(faculty.departments[i]); 
                           faculty.departments.push(req.body.name)



                        }
                    }
                    faculty.save();


                }
               
                    
                
                department = await departments.findOneAndUpdate({name:req.params.depName},req.body);

                if (department===null){
                  return res.json("wrong department name");
                }else{
                  return res.json("department Updated");
        
                }
            }

        
                

        }
        else{
          return res.sendStatus(401);
        }
});
});
router.delete('/delete-department/:depName',getToken,function(req,res){
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){
        if(err) return res.sendStatus(403);
        let hr = await gucHR.findOne({staff_id:data.staff_id})
           let expire = await checkTokenIfExpired(hr.expiredTokens , req.token);
                     if (expire === true){
                         return res.json('Token Expired');
                     }  
        
        if (data.type ==="HR"){ 

    let    department = await departments.findOneAndRemove({name:req.params.depName});

        if (department===null){
          return res.json("wrong department name");
        }else{

         
                let faculty  = await facultyModel.findOne({name:department.faculty});
            
                for (i = 0 ; i < faculty.departments.length;i++){

                    if (faculty.departments[i]===department.name){


                       faculty.departments.pop(faculty.departments[i]); 


                     

                    }
                }
                faculty.save();

            








          return res.json("department deleted");

        }

        }
        else{
          return res.sendStatus(401);
        }
})

});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


router.post('/add-courses',getToken,function(req,res){
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){
        if(err) return res.sendStatus(403);
        let hr = await gucHR.findOne({staff_id:data.staff_id})
           let expire = await checkTokenIfExpired(hr.expiredTokens , req.token);
                     if (expire === true){
                         return res.json('Token Expired');
                     }  
        
        if (data.type ==="HR"){ 

            if (req.body.course_name=== undefined||req.body.course_id=== undefined|| req.body.credit_hours=== undefined||req.body.department=== undefined){
              return res.json("please Enter all information");
            }else{
                course_id = req.body.course_id;
                course_name = req.body.course_name;
                department_name = req.body.department;
                course = await courseModel.findOne({course_name:course_name})
                if (course!== null){

                  return res.json("Course of "+ course_name+" already exists");

                }else{

                    if (req.body.course_teachers!== undefined || req.body.course_professors!== undefined){
                      return res.status(401).json("you are not authorized to assign academic staff");
                    }else{
                        let department = await departments.findOne({name:req.body.department});
                        if (department === null){
                            return res.json("wrong department");
                        }else{
                            department.courses.push(req.body.course_name);
                            department.save();

                            course = new courseModel(req.body);
                            course.save();
                          return res.json("course added");
                        }

                      
                    }
                   
                }

            }
           
            

        }else{
          return res.sendStatus(401);
        }
});
    })

router.put('/update-course/:courseName',getToken,function(req,res){
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){
        if(err) return res.sendStatus(403);
        let hr = await gucHR.findOne({staff_id:data.staff_id})
           let expire = await checkTokenIfExpired(hr.expiredTokens , req.token);
                     if (expire === true){
                         return res.json('Token Expired');
                     }  
        

        if (data.type ==="HR"){ 

            if (req.body.course_professors !==undefined || req.body.course_teachers!=undefined ||req.body.department!=undefined){

              return res.status(401).json("HR personnerl can't assign teachers or professors to courses or change course departments");

            }else{

            
            course = await courseModel.findOne({course_name:req.params.courseName});

            if (course===null){
              return res.json("No Course Exists with this name");
            }else{
                if (req.body.course_name !== undefined){
                    let checkCourse = await courseModel.findOne({course_name:req.body.course_name});
                    if (checkCourse !== null){
                        return res.json("A course with this name already exists");
                    }
                }
                course = await courseModel.findOneAndUpdate({course_name:req.params.courseName},req.body);

                let department  = await departments.findOne({name:course.department});
                
                for (i = 0 ; i < department.courses.length;i++){

                    if (department.courses[i]===req.params.courseName){


                        department.courses.pop(department.courses[i]); 
                       department.courses.push(req.body.course_name);


                     

                    }
                }
                department.save();
                return res.json("course updated")

        }
    }
    }else{
      return res.sendStatus(401);
    }
    })
})

            

router.delete('/delete-course/:courseName',getToken,function(req,res){
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){
        if(err) return res.sendStatus(403);
        let hr = await gucHR.findOne({staff_id:data.staff_id})
           let expire = await checkTokenIfExpired(hr.expiredTokens , req.token);
                     if (expire === true){
                         return res.json('Token Expired');
                     }  
        
        if (data.type ==="HR"){ 

        course = await courseModel.findOneAndRemove({course_name:req.params.courseName});

        if (course===null){
          return res.json("wrong course name");
        }else{
            let department  = await departments.findOne({name:course.department});
                
            for (i = 0 ; i < department.courses.length;i++){

                if (department.courses[i]===req.params.courseName){

                    department.courses.pop(department.courses[i]); 
                }
            }
            department.save();
          return res.json("course deleted");
        }
        }
        else{
      return res.sendStatus(401);
    }
        
})
});








//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/view-attendance/:staff_id',getToken,function(req,res){

    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){
        if(err){
          return res.sendStatus(403);
        }else{
            let hr = await gucHR.findOne({staff_id:data.staff_id})
           let expire = await checkTokenIfExpired(hr.expiredTokens , req.token);
                     if (expire === true){
                         return res.json('Token Expired');
                     }  
            if (data.type!=="HR"){
              return res.status(401).json("you are not authorized");
            }else{
                if (req.params.staff_id.split('-')[0]==='ac'){
                    let staff = await gucStaff.findOne({staff_id:req.params.staff_id});
                    if (staff === null){
                      return res.json("no staff exists with this id");
                    }else{
                        let attendance = await attendanceSheets.findOne({staff_id:req.params.staff_id});
                      return res.json(attendance.signIn_out_history);
                    }
                }else{
                    let staff = await gucHR.findOne({staff_id:req.params.staff_id});
                    if (staff === null){
                      return res.json("no staff exists with this id");
                    }else{
                        let attendance = await attendanceSheets.findOne({staff_id:req.params.staff_id});
                      return res.json(attendance.signIn_out_history);
                    }
                }
            }
        }

    })
});


router.put('/update-salary/:staff_id', getToken,function(req,res){
    jwt.verify(req.token, process.env.TOKEN_SECRET,async function(err,data){
        if(err){
          return res.sendStatus(403);
        }else{
            let hr = await gucHR.findOne({staff_id:data.staff_id})
           let expire = await checkTokenIfExpired(hr.expiredTokens , req.token);
                     if (expire === true){
                         return res.json('Token Expired');
                     }  
            if (data.type == "HR"){
                if (req.params.staff_id.split('-')[0]==='ac'){
                    var staff = await gucStaff.findOneAndUpdate({staff_id: req.params.staff_id},req.body.salary);
                    if (staff=== null){
                      return res.json("In correct Id")
                    }
                }else{
                    
                    var staff = await gucHR.findOneAndUpdate({staff_id: req.params.staff_id},req.body.salary);

                }

            }else{
              return res.sendStatus(401)
            }
        }
    });
})
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

validateNewStaff = async function(Staff){

        var message = 'OK';
     
        if (Staff.type===undefined){
                message = "please choose the type of staff";
                return message;
        }else{
            if (Staff.type!=="HR"){
                await gucStaff.find({},  function(err,staffs){
                    if (staffs.length ===0){
                        Staff.staff_id =  'ac-1'
                    }else{
                        Staff.staff_id =  'ac-'+(parseInt(staffs[staffs.length-1].staff_id.split('-')[1])+1);

                    }
                    });
            }else{
                await gucHR.find({},  function(err,staffs){
                    Staff.staff_id =  'hr-'+(parseInt(staffs[staffs.length-1].staff_id.split('-')[1])+1);
                    });
            }
        }

        if (Staff.courses !== undefined){
            message = "HR users are not allowed to assign courses.";
            return message;
        }

        if (Staff.daysOff !== undefined && Staff.type == 'HR'){
            message = "Not ALLOWED.";
            return message;
        }
        if (Staff.annualLeave !== undefined){
            message = "Not Allowed.";
            return message;
        }
        if (Staff.sickLeaves !== undefined){
            message = "Not Allowed.";
            return message;
        }
        if (Staff.maternityLeaves !== undefined){
            message = "Not ALLOWED.";
            return message;
        }
        if (Staff.acceptedAbscenence !== undefined){
            message = "Not Allowed.";
            return message;
        }
        if (Staff.missedDays !== undefined){
            message = "Not Allowed.";
            return message;
        }
        if (Staff.startWorking !== undefined){
            message = "Not Allowed.";
            return message;
        }
        if (Staff.password!== undefined){
            message = "Not Allowed.";
            return message;
        }

        if (Staff.office === undefined){
            message = 'please enter the staff office.';
            return message;
        }else{
            office = await locationsModel.findOne({locationName:Staff.office});
            if (office === null){
                message = 'Office '+Staff.office+" doesn't exist.";
                return message;
            }else{
                if (office.type !=="office"){
                    console.log(office.type)
                    message = 'Office '+Staff.office+" is not an office space.";
                    return message;
                }else{
                    if (office.capacity === office.occupant){
                    message = 'Office '+Staff.office+" is full.";
                    return message;
                    }
                }
            }
        }
        if (Staff.daysOff === undefined && Staff.type !== 'HR'){
            message = "Please Enter Days Off.";
            return message;
        }
        
        if ( Staff.email ===undefined){
         message = 'please Enter Email.'
            return message;
        }
        if ( Staff.username ===undefined){
            message = 'please Enter username.'
            return message;
        }
        if (Staff.salary === undefined){
            message = 'please Enter Salary.'
                return message
        }
        if (Staff.type === undefined){
            message = 'please Enter the Type of Staff.'
                return message
        }
        if (Staff.type !== "HR"){
            if (Staff.department === undefined){
                message = 'please Enter Department.'
            }
            if (Staff.faculty === undefined){
                message = 'please Enter Faculty.'
            }
             message = checkDepFaculty(Staff.department.name , Staff.faculty.name);
        }
      
            return message;
        
    }

    function getToken(req,res,next){
        let authHeader  = req.headers['authorization'];
        if(typeof authHeader!=='undefined'){
            let token  = authHeader.split(' ')[1];
           req.token  = token;
            next();
    
        }else{
            return res.sendStatus(401);
        }
    }


    async function checkTokenIfExpired (expiredTokens , token){

        rejectedToken = await expiredTokens.find(expiredToken => expiredToken === token);
    
        if (rejectedToken === undefined) return false;
    
        return true;
    }

async function checkDepFaculty (depName , facName){
    let message = 'OK'
    let faculty = await facultyModel.findOne({name:facName});
    let department = await departments.findOne({name:depName});

    
    if (faculty === null){
        message = 'Faculty does not exist';

    }
    if (department === null){
        message = 'department does not exist';
    }
        return message; 


}

module.exports = router;