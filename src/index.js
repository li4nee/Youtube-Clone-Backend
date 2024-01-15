import dotenv from 'dotenv';
import connectDB from './db/index.js';
import app from './app.js';

dotenv.config();

connectDB()
.then(()=>
{   
 app.on("error",(err)=>{
        throw err;
    })
    app.listen(process.env.PORT||8000,()=>{
        console.log(`Server Running At Port : ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log(`Server setup failed !!!! ${process.env.PORT}`);
})
