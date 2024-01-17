import { asyncHandler } from "../utils/asyncHandler.js";
import { generateErrorResponse} from "../utils/apiError.js";
import { validateEmail,validateFullName,validatePassword,validateUsername } from "../utils/validation.utils.js";
import { User } from "../models/user.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async(req,res)=>{
 

const {username,email,fullname,password}=req.body;

if(!validateUsername(username))
{
    throw generateErrorResponse(400,"Username should contain only letters, numbers, underscores, and be between 3 and 20 characters");
}

if(!validateEmail(email))
{
    throw generateErrorResponse(400,"Invalid email");
}

if(!validateFullName(fullname))
{
    throw generateErrorResponse(400,"Fullname should contain only letters and spaces and be between 2 and 50 characters");
}

if(!validatePassword(password))
{
    throw generateErrorResponse(400,"Password should contain at least 8 characters, including at least one uppercase letter, one lowercase letter, and one digit");
}


const existingUser = await User.findOne({
    $or: [{ email: email }, { username: username }]
});

if (existingUser) {
    throw generateErrorResponse(400, "User Already Exists, Please log in");
}

const avatarlocalpath = req.file?.avatar[0]?.path;
const coverlocalpath = req.file?.coverImage[0]?.path;

if(!avatarlocalpath)
{
    throw generateErrorResponse(400,"avatar file is required")
}

const avatar = await uploadOnCloudinary(avatarlocalpath);
const coverimage= await uploadOnCloudinary(coverlocalpath);

if(!avatar)
{
    throw generateErrorResponse(400,"avatar file is required")
}


const userdetails = User.create({
    fullname:fullname,
    email:email,
    username:username.toLowerCase(),
    avatar:avatar.url,
    coverimage:coverimage?.url || " ",
    password:password
})

const createdUser = await User.findById(User._id).select("-password -refreshToken");

if(!createdUser)
{
 throw generateErrorResponse(500,"User Registration Went Wrong");
}

return res.status(201).json(
    new apiResponse(201,createdUser,"User sucessfully registered")
)
})
export {registerUser} ;