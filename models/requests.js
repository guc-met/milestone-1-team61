const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var requests = new Schema ({
    request_id: {type:String, required:true},
    issuer : {type:String, required:true},
    issuee : {type:String, required:true},
    type : {type:String, required:true},
    extra_info : {type:String},
    accepted: {type:Boolean},
    comments: {type:String}
})

module.exports = mongoose.model('requests',requests);
