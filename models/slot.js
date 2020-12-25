const { Int32 } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var slot = new Schema({
    course_id:{type:String,required:true,default:'empty'},
    teacher_id:{type:String,required:true,default:'empty'},
    day:{type:String},
    Slotnumber:{type:Number}
})

module.exports = mongoose.model('slot',slot);