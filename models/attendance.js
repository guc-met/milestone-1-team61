const mongoose = require ('mongoose');

const schema  = mongoose.Schema;




let attendance = new schema({

        staff_id:{type:String , required:true},
        signIn_out_history : {
            type:Array,
            day:{ type:String, required:true},
            signIn:{type:String},
            signOut:{type:String}
        }

});

module.exports  = mongoose.model('attendance',attendance);
