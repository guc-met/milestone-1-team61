require('dotenv').config();

const express = require('express');

let gucStaff = require('../../models/gucstaff.model');
let gucHR = require('../../models/guchr.model');
let attendanceSheets = require('../../models/attendance');

let router = express.Router();

const jwt = require('jsonwebtoken');
const { findOne } = require('../../models/gucstaff.model');


//////////////////////////////////////////////////TEST//////////////////////////////////////////

router.post('/test',async function(req,res){
    
    const newStaff  = new gucHR(req.body);
            newStaff.password = newStaff.hashPassword("123456");
            newStaff.save().then(function(){
                return res.status(200).json({
                    message:"user added successfuly by " ,
                    
                    
                });
            });
});








/////////////////////////////////////////////LOGIN//////////////////////////////////////////////

router.post('/login',async function(req,res){
    const {email,password} = req.body;

    let staff = await gucStaff.findOne({email: email});
   
   

        if (staff===null){
             staff = await gucHR.findOne({email: email});
            if (staff === null){
                return res.send("please enter the correct Email");
            }
        }
        if (staff.firstLogin){
            console.log("please change password");
       }
        if (password === undefined){
            return res.json('Please Enter A Password')
        }
        
//
            if (!staff.validatePassword(password)){
                return res.status(404).send("invalid password");
            }else{
                const accessToken = jwt.sign({staff_id:staff.staff_id,type:staff.type},process.env.TOKEN_SECRET);
                return res.status(200).json(accessToken);
            }
});

/////////////////////////////////////////////LOGOUT/////////////////////////////////////////////////////////////////////////////

router.post('/logout',getToken,function(req,res){
    
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){
        if(err) return  res.sendStatus(403);
        
        if (data.type = 'HR'){
            console.log(data.staff_id)
                let hr = await gucHR.findOne({staff_id:data.staff_id});
                    hr.expiredTokens.push(req.token);
                    hr.save();
        }else{
                let staff = await gucStaff.findOne({staff_id:data.staff_id});
                staff.expiredTokens.push(req.token);
                staff.save();   
        }
        return res.json("log out success");
    })
});

/////////////////////////VIEW PROFILE//////////////////////////////////////////////////////////////////////////////////////////////

router.get('/:username',getToken,function(req,res){
        jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){
            if(err) return  res.sendStatus(403);
                if (data.type ==='HR'){
                    staff = await gucHR.findOne({username:req.params.username});
                }else{
                    staff = await gucStaff.findOne({username:req.params.username});
                }
                expire = await checkTokenIfExpired(staff.expiredTokens , req.token);
                console.log(expire);
                if (expire === true){
                    return res.json('Token Expired');
                }
                return res.json(staff);
        });
});
///////////////////////////////////////UPDATE PROFILE///////////////////////////////////////////////////////////////////////////////////


router.put('/update/', getToken , function (req , res){
   
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){

        if (err) return  res.sendStatus(403);


        if (data.type === 'HR'){

            if (req.body.staff_id !== undefined ||req.body.username !== undefined || req.body.salary !== undefined || req.body.password!==undefined ||
                req.body.type!==undefined || req.body.daysOff!==undefined|| req.body.annualLeave!==undefined||req.body.accidentalLeaves!==undefined||
                req.body.sickLeaves!==undefined||req.body.maternityLeaves!==undefined ||
                req.body.startWorking!==undefined|| req.body.acceptedAbscence!==undefined||req.body.missedDays!==undefined|| req.body.missingHours!== undefined
                || req.body.extraHours !== undefined|| staff.firstLogin !== undefined || staff.MonthSalary !== undefined||staff.missingMins!==undefined){

                    return res.sendStatus(401);
            }else{
                let staffMember = await gucHR.findOne({staff_id:data.staff_id});

                expire = await checkTokenIfExpired(staffMember.expiredTokens , req.token);
                if (expire === true){
                    return res.json('Token Expired');
                }

                staffMember = await gucHR.findOneAndUpdate({staff_id:data.staff_id},req.body,function (err,suc){
                    if (err) return res.send(err);
                    return res.send("Update Successfully")
                });

            }
        }else{
            if (req.body.staff_id !== undefined|| req.body.username !== undefined || req.body.salary !== undefined || 
                req.body.faculty !== undefined || req.body.department !== undefined || req.body.password!==undefined||req.body.type!==undefined ||
                 req.body.daysOff!==undefined|| req.body.annualLeave!==undefined||req.body.accidentalLeaves!==undefined||
                req.body.sickLeaves!==undefined||req.body.maternityLeaves!==undefined||req.body.courses!==undefined||req.body.office!==undefined||
                req.body.startWorking!==undefined|| req.body.acceptedAbscence!==undefined||req.body.missedDays!==undefined|| req.body.missingHours!== undefined
                || req.body.extraHours !== undefined || staff.firstLogin !== undefined || staff.MonthSalary !== undefined||staff.missingMins!==undefined)
                {
                        
                    return res.sendStatus(401);
                
                
                }else{
                    let staffMember = await gucStaff.findOne({staff_id:data.staff_id});

                    expire = await checkTokenIfExpired(staffMember.expiredTokens , req.token);
                    if (expire === true){
                        return res.json('Token Expired');
                    }
                    staffMember = await gucStaff.findOneAndUpdate({staff_id:req.params.id},req.body,function (err,suc){
                        if (err) return res.send(err);
                        return res.send("Update Successfully")
                    });
                }       
                }

    });
});
///////////////////////////////////////RESET PASSWORD///////////////////////////////////////////////////////////////////////////////////

router.put('/reset-password',getToken,function(req,res){
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){
        if (err) {
            return res.sendStatus(401);
        }else{

            if (data.type === 'HR'){
               let staffMember = await gucHR.findOne({staff_id:data.staff_id});
               expire = await checkTokenIfExpired(staffMember.expiredTokens , req.token);
               if (expire === true){
                   return res.json('Token Expired');
               }                
              await  resetPassword(gucHR , req , res);
              if ( staffMember.firstLogin) {
                staffMember.firstLogin = false;
                staffMember.save();
            } 

            }else{
                let staffMember = await gucStaff.findOne({staff_id:data.staff_id});
                expire = await checkTokenIfExpired(staffMember.expiredTokens , req.token);
                if (expire === true){
                    return res.json('Token Expired');
                }                
                await resetPassword(gucStaff , req , res);
                if ( staffMember.firstLogin) {
                    staffMember.firstLogin = false;
                    staffMember.save();
                } 
            }      
        }
        
    });
});

///////////////////////////////////////SIGN-IN ON CAMPUS////////////////////////////////////////////////////////////////////////////////

router.put('/sign-in',async function(req,res){
         message =  await signInOut(0,req);
         if (message ==='OK'){
            return res.status(200).json("attendance updated")
        }else{
            return res.sendStatus(500);
        }
    
});

//////////////////////////////////////SIGN_OUT OFF CAMPUS/////////////////////////////////////////////////////////////////////////////////

router.put('/sign-out', async function(req,res){
    message =  await signInOut(1,req);
        

    if (message ==='OK'){
        return res.status(200).json("attendance updated")
    }
    return res.sendStatus(500);

});

////////////////////////////////////GET MISSED DAYS////////////////////////////////////////////////////////////////////////////////////////////

router.put('/missed-days',getToken,function(req,res){

    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){

        if (err){
            return res.sendStatus(401);
        }else{
            if (data.type ==='HR'){
               let staff =  await gucHR.findOne({staff_id:data.staff_id});

            }else{
                let staff =  await gucStaff.findOne({staff_id:data.staff_id});

            }
            
           
            if (staff === null){
                return res.json("staff no longer existed");
            }else{
                expire = await checkTokenIfExpired(staffMember.expiredTokens , req.token);
                if (expire === true){
                    return res.json('Token Expired');
                }  
                if (staff.startWorking === "pending"){
                    return res.json("this staff member hasn't startet working yet");
                }else{
                    res.json({missedDays:staff.missedDays,missedHours:staff.missingHours});
                }
            }
        }

    })
});

////////////////////////////////////////////////////////GET ATTENDANCE////////////////////////////////////////////////////////////////////////////
router.get('/attendance/:month',getToken,function(req,res){
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){
                if (err) return res.sendStatus(401);
                if (data.type === 'HR'){
                    staff = await gucHR.findOne({staff_id:data.staff_id})
                    expire = await checkTokenIfExpired(staff.expiredTokens , req.token);
                    console.log(expire);
                if (expire === true){
                    return res.json('Token Expired');
                }  
                    attendance = await attendanceSheets.findOne({staff_id:data.staff_id})

                } else{
                    staff = await gucStaff.findOne({staff_id:data.staff_id})
                    expire = await checkTokenIfExpired(staff.expiredTokens , req.token);
                    if (expire === true){
                        return res.json('Token Expired');
                    }                      attendance = await attendanceSheets.findOne({staff_id:data.staff_id})

                }
                
                results = [];
                if (req.params.month ==="all"){
                
                    return res.json(attendance.sign_In_Out_history);
                }else{
                        for(i = 0 ; i < attendance.sign_In_Out_history.length ; i++){
                            if (attendance.sign_In_Out_history[i].day.split('-')[2]===req.params.month){
                                while(attendance.sign_In_Out_history[i].day.split('-')[2]===req.params.month){
                                    results.push(attendance.sign_In_Out_history[i]);
                                }
                                break;
                            }       
                        }
                        return res.json(results);
                }
    });
});
///////////////////////////////////////////////////////View Missing Hours And Extra Hours//////////////////////////////////////////////////

router.get('/missing-extra-hours',getToken,function(req,res){
    jwt.verify(req.token,process.env.TOKEN_SECRET,async function(err,data){
                if (err) return res.sendStatus(401);
                let staff;
                if (data.type === 'HR'){
                     staff = await gucHR.findOne({staff_id:data.staff_id});
                     expire = await checkTokenIfExpired(staff.expiredTokens , req.token);
                     if (expire === true){
                         return res.json('Token Expired');
                     }  
                } else{
                     staff = await gucStaff.findOne({staff_id:data.staff_id});
                     expire = await checkTokenIfExpired(staff.expiredTokens , req.token);
                     if (expire === true){
                         return res.json('Token Expired');
                     }  
                }
                return res.json({MissingHours:staff.missingHours , extraHours: staff.extraHours})
          
    });
});
//////////////////////////////////////////////////////Function///////////////////////////////////////////

function returnDay(day){
    var days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    return days[day];
}

async function signInOut(signIn_Out,req){
    let currentDay = new Date();
        var date = returnDay(currentDay.getDay())+'-'+currentDay.getFullYear()+'-'+(currentDay.getMonth()+1)+'-'+currentDay.getDate();
        let currentTime = currentDay.getHours() + ":" + currentDay.getMinutes() + ":" + currentDay.getSeconds();
    var message = "OK";
        if (signIn_Out === 0){
            
        signIn = {
            day:date,
            signIn:currentTime,
            sign_out:""
        }
        attendaceRecord = await attendanceSheets.findOne({staff_id:req.body.staff_id},function(err,success){
            if (err){
                console.log(err);
                message = "error";
                return message;
            };
        });

        signInRecordLength = attendanceRecord.sign_In_Out_history.length;

        if (attendanceRecord.sign_In_Out_history[signInRecordLength-1].signOut===""){
            return res.json("you can't sign in before signing out");
        }
        
        attendanceRecord.sign_In_Out_history.push(signIn)
        attendanceRecord.save();
        attendanceUpdate = await attendanceSheets.findOneAndUpdate({staff_id:req.body.staff_id},{attendaceRecord});   
        
        }else{
            attendaceRecord = await attendanceSheets.findOne({staff_id:req.body.staff_id},function(err,success){
                if (err) return res.sendStatus(404);
            });
            signInRecordLength = attendanceRecord.sign_In_Out_history.length;

            if (attendanceRecord.sign_In_Out_history[signInRecordLength-1].signOut!==""){
                return res.json("you can't sign out before signing in");
            }
            
            for(i=0;i<attendanceRecord.sign_In_Out_history.length;i++){
                if (attendanceRecord.sign_In_Out_history[i].day===date){
                    attendanceRecord.sign_In_Out_history[i].sign_out = currentTime;
                }
                attendanceUpdate = await attendanceSheets.findOneAndUpdate({staff_id:req.body.staff_id},{attendaceRecord});      
            }

        }
        return message;

}

function getToken(req,res,next){
    const authHeader  = req.headers['authorization'];
    if(typeof authHeader!=='undefined'){
        const token  = authHeader.split(' ')[1];
       req.token  = token;
        next();
    }else{
        return  res.sendStatus(401);
    }
}

async function  checkTokenIfExpired (expiredTokens , token){
console.log(expiredTokens)
    rejectedToken = await expiredTokens.find(expiredToken => expiredToken === token);
    console.log(rejectedToken)

    if (rejectedToken === undefined) return false;

    return true;
}

async function resetPassword (model,req,res){
    if (req.body.oldPassword === undefined || req.body.confirmPassword === undefined ||
        req.body.newPassword === undefined){
            return res.json("please enter all fields");
        }
    oldPassword = req.body.oldPassword;
    confirmPassword = req.body.confirmPassword;
    newPassword = req.body.newPassword;

    staff = await model.findOne({staff_id:data.staff_id});

    if (!staff.validatePassword(oldPassword)){
        return res.json("old password is incorrect")
    }else{
        if (!staff.validatePassword(confirmPassword)){
            return res.json("passwords has to match");
        }else{
            staff.password = staff.hashPassword(newPassword);
            console.log(data.staff_id);
            staff.save();
            return res.status(200).json("success");
        }
    }
}


module.exports = router;