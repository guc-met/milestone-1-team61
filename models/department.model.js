const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var departments = new Schema({
    name:{type:String,required:true},
    coordinator_id:{type:String,required:true},
    department_head_id:{type:String,required:true},
    faculty:{type:String,required:true},
    courses:{type:Array , required:true,default:[""]},
    department_members:{type:Array ,required:true , default:[""]}
});


module.exports = mongoose.model('department',departments);


