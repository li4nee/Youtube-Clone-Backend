import { asyncHandler } from "../utils/asyncHandler.js";
import { generateErrorResponse} from "../utils/apiError.js";
import { validationRules} from "../utils/validation.utils.js";
import { User } from "../models/user.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import apiResponse  from "../utils/apiResponse.js";
import jwt from 'jsonwebtoken';
const generateAccessAndRefreshToken = async (userId)=>{
    try
    {
      const  user = await User.findOne(userId);
      const accessToken = await user.generateAccessToken();
      const refreshToken = await user.generateRefreshToken();

      user.refreshToken= refreshToken;
      user.save({validateBeforeSave: false});


      return {accessToken,refreshToken};
    }
    catch(err)
    {
        throw generateErrorResponse(500,"Something went wrong in GAART");
    }
}

const registerUser = asyncHandler(async(req,res)=>{
 

const {username,email,fullname,password}= await req.body;


const fieldsToValidate = {
    username: 'Username should contain only letters, numbers, underscores, and be between 3 and 20 characters',
    email: 'Invalid email',
    fullName: 'Fullname should contain only letters and spaces and be between 2 and 50 characters',
    password: 'Password should contain at least 8 characters, including at least one uppercase letter, one lowercase letter, and one digit',
  };

  for (const field in fieldsToValidate) {
    if (!validationRules[field](req.body[field])) {
      throw generateErrorResponse(400, fieldsToValidate[field]);
    }
  }



const existedUser = await User.findOne({
    $or: [{ username }, { email }]
})

if (existedUser) {
    throw generateErrorResponse(409, "User with email or username already exists")
}



const avatarLocalPath = await req.files?.avatar[0]?.path;

const coverimageLocalPath =await req.files?.coverimage?.[0]?.path;




if (!avatarLocalPath) {
    throw generateErrorResponse(400, "Avatar file is required ok")
}

const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverimage = await uploadOnCloudinary(coverimageLocalPath)

if (!avatar) {
    throw new generateErrorResponse(400, "Avatar file is required")
}



const userdetails = await User.create({
    fullname:fullname,
    email:email,
    username:username.toLowerCase(),
    avatar:avatar.url,
    coverimage:coverimage?.url || " ",
    password:password
})

const createdUser = await User.findById(userdetails._id).select("-password -refreshToken");

if(!createdUser)
{
 throw generateErrorResponse(500,"User Registration Went Wrong");
}

console.log("User created")

return res.json(
    new apiResponse(201,createdUser,"User sucessfully registered")
)
})

const loginUser = asyncHandler(async(req,res)=>{
const {email,username,password}= req.body;
if(!email && !username)
{
    throw generateErrorResponse(400,"Either username or email is required");
}
const validuser= await User.findOne({
    $or:[{username:username},{email:email}]
})

if (!validuser)
{
    throw generateErrorResponse(400,"Please register before loging")
}

const isPasswordValid = await validuser.isPasswordCorrect(password)

if(!isPasswordValid)
{
    throw generateErrorResponse(400,"Wrong Password")
}
const {accessToken,refreshToken}=await generateAccessAndRefreshToken(validuser._id);

const loggedInUser = await User.findById(validuser._id).select("-password -refreshToken");

const options={
    httpOnly:true,
    secure:true
}

return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new apiResponse(200,{user:loggedInUser,accessToken,refreshToken},"User logged in sucessfully"));
});


const logOutUser = asyncHandler(async (req,res)=>{
    const userId = await req.user._id;
    await User.findByIdAndUpdate(
        userId
    ,{$set:{refreshToken:undefined}},{new:true})
    const options={
        httpOnly:true,
        secure:true
    }
    return await res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new apiResponse(200,{},"logged out successfully"));
});


const refreshAccessToken = asyncHandler(async(req,res)=>{
  try {
      const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken;
      if(!incomingRefreshToken)
      {
          throw generateErrorResponse(400,"Unauthorized Error");
      }
      const decoded =  jwt.verify(incomingRefreshToken, process.env.REFRESHTOKEN_PRIVATEKEY);
      const decodedUser = await User.findById(decoded._id);
      if(!decodedUser)
      {
          throw generateErrorResponse(400,"Invalid refresh token")
      }
      if(incomingRefreshToken!==decodedUser.refreshToken)
      {
          throw generateErrorResponse(400,"Refresh Token invalid or expired")
      }
      const options={
          httpOnly:true,
          secure:true
      };
      const {accessToken,refreshToken}=await generateAccessAndRefreshToken(validuser._id);
      return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new apiResponse(200,{accessToken,refreshToken}));
  } catch (error) {
    throw generateErrorResponse(400,"Invalid  refresh token")
  }
});


const changePassword= asyncHandler(async(req,res)=>{
const {oldPassword,newPassword}=await req.body;
const {_id}=await req.user;
const user = await User.findById(_id);
const isPasswordCorrect=await user.isPasswordCorrect(oldPassword);
if(!isPasswordCorrect)
{
    throw generateErrorResponse(400,"Password is incorrect");
}
user.password=await newPassword;
await user.save({validateBeforeSave:false});
return res.status(200).json(new apiResponse(200,{},"Password Sucessfully Chnaged"));
});

const getCurrentUser = asyncHandler(async(req,res)=>{
    const user = await req.user;
    return res.status(200).json(new apiResponse(200,user,"Current User Details Sent"))
});

const updateCurrentUserText = asyncHandler(async(req,res)=>{
    const {fullname,email}=await res.body;
    if(!(fullname && email))
    {
        throw generateErrorResponse(400,"Nothing to update");
    }
    const _id= await req.user?._id;
   const updatedUser = await User.findByIdAndUpdate({_id},{
    $set:{fullname,email}
   },{new:true}).select("-password -token");
   return res.status(200).json(new apiResponse(200,updatedUser,"User is updated"))

});


const updateCurrentUserAvatar= asyncHandler(async(req,res)=>{
    const localpath = await req.file?.path;
    if(!localpath)
    {
        throw generateErrorResponse(400,"File is missing");
    }
    const avatar = await uploadOnCloudinary(localpath);
    if(!avatar.url)
    {
        throw generateErrorResponse(500,"Some Error in uploading avatar");
    }
    const updateduser = await User.findByIdAndUpdate(req.user?._id,{
        $set:{avatar:avatar.url}
    },{new:true}).select("-password , -token");

    return res.status(200).json(new apiResponse(200,updateduser,"Avatar Updated"));
});


const updateCurrentUserCoverImage= asyncHandler(async(req,res)=>{
    const localpath = await req.file?.path;
    if(!localpath)
    {
        throw generateErrorResponse(400,"File is missing");
    }
    const coverimage = await uploadOnCloudinary(localpath);
    if(!coverimage.url)
    {
        throw generateErrorResponse(500,"Some Error in uploading avatar");
    }
    const updateduser = await User.findByIdAndUpdate(req.user?._id,{
        $set:{coverimage:coverimage.url}
    },{new:true}).select("-password , -token");

    return res.status(200).json(new apiResponse(200,updateduser,"CoverImage Updated"));
});

export {registerUser,loginUser,logOutUser,refreshAccessToken,changePassword,updateCurrentUserAvatar,updateCurrentUserText,updateCurrentUserCoverImage,getCurrentUser} ;