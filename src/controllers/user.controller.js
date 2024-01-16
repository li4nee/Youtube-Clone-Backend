import { asyncHandler } from "../utils/asyncHandler.js";
import { generateErrorResponse} from "../utils/apiError.js";
import { validateEmail,validateFullName,validatePassword,validateUsername } from "../utils/validation.utils.js";
import { User } from "../models/user.js";



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
console.log(existingUser);


res.send("ok boss");
})

export {registerUser} ;