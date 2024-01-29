import { asyncHandler } from "../utils/asyncHandler.js";
import { generateErrorResponse} from "../utils/apiError.js";
import { validationRules} from "../utils/validation.utils.js";
import { User } from "../models/user.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

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
if(!email || !username)
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
})


const logOutUser = asyncHandler(async (req,res)=>{
    const userId = await req.user._id;
    await User.findByIdAndUpdate(
        userId
    ,{$set:{refreshToken:undefined}},{new:true})
    const options={
        httpOnly:true,
        secure:true
    }
    return await res.status(200).clearcookie("accessToken",options).clearcookie("refreshToken",options).json(new apiResponse(200,{},"logged out successfully"));
})

export {registerUser,loginUser,logOutUser} ;