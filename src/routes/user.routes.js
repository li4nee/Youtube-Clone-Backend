import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.js";



const router = Router();
router.route("/register").post(upload.fields([
{name:"Avatar",
 maxCount:1 
},
{name:"Cover",
 maxCount:1 
}
]
),registerUser);

export default router;