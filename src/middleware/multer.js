import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null,"./public/temp")
    },
    filename: function (req, file, callback) {
      callback(null, file.originalname) // original name isn's teti good approach tei ni we doing here anyway
    }
  })
  
 export const upload = multer({ storage: storage })
