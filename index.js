const express = require ('express');
const app = express();
const mongoose = require('mongoose');
const connection = mongoose.connection;
const staffroutes = require('./API/Routes/gucstaff.routes');
const hrroutes = require('./API/Routes/hr.routes');

let gucStaff = require('./models/gucstaff.model');
let gucHr = require('./models/guchr.model');
let attendance = require('./models/attendance');
var schedule = require('node-schedule');


app.use(express.json());

connection.once('open',  function(){
  console.log("MongoDB connection established");
})
////////////////////////////////////////////////////////ATTENDANCE SYSTEM///////////////////////////////////////////////////////////////////////////////////////////////////

function returnDay(day){
  var days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  return days[day];
}
function attendanceSystemEngine(model){

  var currentDay = new Date();
  var day = currentDay.getDate();
  var date = returnDay(currentDay.getDay())+'-'+currentDay.getFullYear()+'-'+(currentDay.getMonth()+1)+'-'+currentDay.getDate();






  model.find({} , function (err,docs){
    if (err){
      console.log('error finding files');
    }else{
      docs.forEach( async function(doc){
        if (doc.startWorking !== "pending"){

          let found = false
          if (day == 10){
            doc.extraHours += returnZero(doc.totalMonthlyTime - 168);
          }
          if (day === 11){
            doc.missingDays = [] ; 
            doc.missingHours = 0;
            doc.missingMins = 0;
            doc.annualLeaves += 2.5;
          }
         staffAttendance =  await attendance.findOne({staff_id: doc.staff_id});
         for(i = 0 ; i < staffAttendance.sign_In_Out_History.length ; i++ ){
           if (staffAttendance.sign_In_Out_History[i].day===date){
                 found = true; 
                 let signInHr = staffAttendance.sign_In_Out_History[i].signIn.split(':')[0];
                 let signInMin = staffAttendance.sign_In_Out_History[i].signIn.split(':')[1];
                 let signOutHr = staffAttendance.sign_In_Out_History[i].signOut.split(':')[0];
                 let signOutMin = staffAttendance.sign_In_Out_History[i].signOut.split(':')[1];
                 if (signInHr<7 ){
                   signInHr = 7;
                   signInMin = 0;
                 }
                 if (signOut>= 19 ){
                   signOutHr = 19;
                   signOutMin = 0;
                 }
                 doc.totalMonthlyTime  += ((signOutHr + (signOutMin/60)) - (signInHr + (signInMin/60)))  ;
           }
         }
            if (found === false){
               let vacation = false;
               for(i = 0 ; i < doc.daysOff.length ; i++){
                 if (returnDay(currentDay.getDay())===doc.daysOff[i]){
                   vacation = true;
                   break;
                 }
               }
               if (vacation === flase){
                 for(i = 0 ; i< doc.acceptedAbscence.length;i++){
                     if (doc.acceptedAbscence[i].date === date) vacation = true;
                 }
                 if (vacation === false){
                  doc.missingHours = 8;
                  doc.missingMins = 24;
                  doc.missingDays.push(date)
                 } 
               }
           }
           doc.Monthsalary = doc.salary -((doc.missingDays.length  * (doc.salary/60)) - 
            ((returnZero(doc.missingHours-2)* (doc.salary/180)) + (returnZero(doc.missingMins - 59))*(doc.salary/(180*60))));  
         await   doc.save();
          }
      })

    }
  
    
    });

}
function returnZero(num){
  if (num< 0){
    return 0 ;
  }else{
    return num;
  }
}

function attndanceSystem (){
  attendanceSystemEngine(gucHr);
  attendanceSystemEngine(gucStaff);
}



var dailyJob = schedule.scheduleJob("0 22 * * *",  function() {
  console.log("sfsffs");
  attndanceSystem();
  
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


mongoose.connect('mongodb://localhost:27017/Toty', { useNewUrlParser: true,useUnifiedTopology: true  }).catch(error => handleError(error));


app.use('/',staffroutes);
app.use('/hr',hrroutes);

app.listen(3000,function(){
  console.log("Server running on port 3000");
}) 



  