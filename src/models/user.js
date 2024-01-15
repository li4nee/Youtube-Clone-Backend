import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


 
let userSchema = mongoose.Schema({
username:{
    type:String,
    unique:true,
    lowercase:true,
    required:true,
    trim:true,
    index:true,
    minlength:1
},
email:{
    type:String,
    unique:true,
    lowercase:true,
    required:true,
    trim:true
},
fullname:{
    type:String,
    required:true,
    trim:true,
    index:true
},
avatar:{
    type:String ,  //cloudinary url
    required :true 
},
coverimage:{
    type:String        //cloudinary url
},
watchhistory:[
    {type:mongoose.Schema.Types.ObjectId,ref:"Video"}
],
password:{
    type:String,
    required:[true,"password is mandatory"]
},
refreshToken:{
    type:String
}

},{timestamps:true})

userSchema.pre("save",async function(next){
        if(!this.isModified("password"))
        {
            return next();
        }   

        this.password= bcrypt.hash(this.password,10);
        next();
});

userSchema.methods.isPasswordCorrect = async function(password)
{
return await bcrypt.compare(password, this.password); // returns true or false
}

userSchema.methods.generateAccessToken = function()
{
    let token = jwt.sign({_id:this._id, email:this.email},process.env.ACCESSTOKEN_PRIVATEKEY,{expiresIn:process.env.ACCESSTOKEN_EXP});
    return token;
}

userSchema.methods.generateRefreshToken =  function()
{
    let token =  jwt.sign({_id:this._id}, process.env.REFRESHTOKEN_PRIVATEKEY,{expiresIn:process.env.REFRESHTOKEN_EXP});
    return token;
}





export const User = mongoose.model("User",userSchema);