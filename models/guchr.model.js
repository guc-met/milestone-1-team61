const { Decimal128 } = require('bson');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');



var gucHR = new Schema({
    staff_id:{type:String,required:true},
    username:{type:String,required: true},
    password:{type:String,required:true, default:"123456"},
    email:{type:String,required:true},
    type:{type:String,required:true,default:"HR"},
    salary:{type:Number,required:true},
    daysOff:{type:Array,default:['friday','saturday'],required:true},
    annualLeave:{type:Decimal128,required:true,default:2.5},
    accidentalLeaves:{type:Number,required:true,default:0},
    sickLeaves:{type:Number,required:true,default:0},
    maternityLeaves:{type:Number,required:true,default:0},
    extraInformation:{type:String},
    expiredTokens:{
        type:Array,
        expiredToken:{type:String},
        default:[{expiredToken:""}]},
    startWorking:{type:String,required:true,default:"pending"},
    acceptedAbscence:{
        type:Array,
        default:[{"cause":"" , "date":""}],
        required:true,
        cause:{type:String,required:true,default:""},
        date:{type:String,required:true,default:""},
    },
    missedDays:{type:Array , required:true , default:[""]},
    totalTime : {type:Decimal128,required:true,default:0},
    missingHours: {type:Number,required:true,default:0},
    missingMins: {type:Number,required:true,default:0},
    extraHours: {type:Decimal128,required:true,default:0},
    firstLogin:{type:Boolean , required:true , default:true},
    Monthsalary:{type:Number,required:true, default:0}





});

gucHR.methods.hashPassword = function(password){
    return bcrypt.hashSync(password,bcrypt.genSaltSync(9));
}
gucHR.methods.validatePassword = function(password){
    return bcrypt.compareSync(password, this.password);
}


module.exports = mongoose.model('hr',gucHR);