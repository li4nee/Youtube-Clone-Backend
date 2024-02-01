import { Router } from "express";
import { getCurrentUser, logOutUser, refreshAccessToken, registerUser, updateCurrentUserText } from "../controllers/user.controller.js";
import { loginUser } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import multer from "multer";

const router = Router();
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverimage",
            maxCount: 1
        }
    ]),
    registerUser
    )
router.route("/login").post(loginUser);

//routes after login

router.route("/logout").post(verifyJwt,logOutUser);

router.route("/refreshAcessToken101").post(refreshAccessToken);

router.route("/update/email-fullname").post(verifyJwt,updateCurrentUserText);

router.route("/getuser").get(verifyJwt,getCurrentUser);



export default router;