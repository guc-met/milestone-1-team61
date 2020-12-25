const { Int32 } = require('mongodb');
const mongoose = require('mongoose');

const Schema  = mongoose.Schema;


var locations = new Schema({

    locationName:{type:String,required:true},
    building:{type:String,required:true},
    floor:{type:String,required:true},
    roomNumber:{type:String,required:true},
    capacity:{type:Number,required:true},
    type:{type:String,required:true},
    teachers_in_office:[{
        name:{type:String} 
    }],
    occupant:{type:Number, default:0 , required : true}
});

module.exports = mongoose.model('location',locations);