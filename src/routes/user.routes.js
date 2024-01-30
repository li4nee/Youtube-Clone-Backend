import { Router } from "express";
import { logOutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { loginUser } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

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

export default router;