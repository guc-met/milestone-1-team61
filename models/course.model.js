const { Int32 } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var courses = new Schema({
    course_name:{type:String,required:true},
    course_id:{type:String, required:true},
    course_teachers:{type:Array,default:[""]},
    course_professors:{type:Array,default:[""]},
    credit_hours:{type:Number, default:0},
    department:{type:String , required:true},
    course_coordinator:{type:String}
});

module.exports = mongoose.model('course',courses)
