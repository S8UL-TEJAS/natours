const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // This only works on CREATE and SAVE!!!
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords are not the same!'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});
UserSchema.pre('save',async function(next){
    console.log('First document middleware enter')
    // Before saving document to database always check whether the password is changed or not
    if(!this.isModified('password')) return next();
    console.log('First document middleware stage 1')
    // If password is changed then hash it and store it to database
    this.password = await bcrypt.hash(this.password,12);
    // also set passwordConfirm=undefined in database
    this.passwordConfirm = undefined;
    next();
});
UserSchema.pre('save',function(next){
    console.log('Second document middleware enter')
    if(!this.isModified('password') || this.isNew) return next();
    console.log('Second document middleware stage-1')
    this.passwordChangedAt = Date.now();
    next();
});
UserSchema.pre(/^find/,function(){
    this.find({active:{$ne:false}});
   // this.set({role:'admin'});
})
UserSchema.methods.correctPassword =async (userTypedPassword,databasePassword)=>{
    return await bcrypt.compare(userTypedPassword,databasePassword);  
};
UserSchema.methods.createResetPasswordToken =function(next){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    //HACK: token will expire after 10 minutes
    this.passwordResetExpires =Date.now()+10*60*1000;
    //HACK: We store encrypted reset token to our database but sends normal token to user
    console.log('qswdwdwd'.yellow)
    return resetToken;
}
const UserModel = mongoose.model('UserModel',UserSchema);
module.exports = UserModel;