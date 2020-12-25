const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var faculties = new Schema({

    name:{type:String,required:true},
    dean_id:{type:String,required:true},
    dean_name:{type:String,required:true},
    departments:{type:Array,required:true,default:[""]}
    

});

module.exports  = mongoose.model('fac',faculties);

