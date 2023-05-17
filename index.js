import Express from "express";
import Mongoose from "mongoose";
import Dotenv from "dotenv";
import Helmet from "helmet";
import Morgan from "morgan";
import cors from "cors";
// we installed multer package. Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files.
import multer from "multer";
import path from "path";
import userRoute from "./routes/users.js";
import authRoute from "./routes/authicateUser.js";
import postRoute from "./routes/posts.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = new Express();
const PORT =  process.env.PORT || 8008;

// reads the .env file
Dotenv.config();

//accesses the variable from .env file using "process.env.VARIBLE_NAME"
// Connecting to Mongoose
// Mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true}, () => {
//     console.log(connected)});

Mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("Mongoose Connected")}).catch((err)=>{console.log("Error:" + err.response)})


// middleware
app.use(Express.json());
app.use(Express.urlencoded({extended: true}))
app.use(Helmet());
app.use(Morgan("common"));

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});
const corsOptions = {
  origin: 'https://facebookclone-vv1k.onrender.com/', 
  methods: ['GET', 'POST'], 
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// console.log(__filename)
// console.log(__dirname)
app.use("/images", Express.static(path.join(__dirname, "/public/images")));


const storage = multer.diskStorage({
                                    destination:(req, file, cb)=>{
                                        //the destination where we want to save/store the file
                                        cb(null, "public/images");
                                    },
                                    filename: (req, file, cb) => {
                                        //file.original name means we want to save file with its original name
                                        cb(null, file.originalname );
                                    }
})
const upload = multer({ storage });
app.post("/api/upload", upload.single("file"), (req, res) => {

    try{  
                // Return a response indicating success or failure
        res.status(200).json("File uploaded successfully");
    }

  catch(err){
    console.log(err)
  }})
    // try{

    //     console.log(req.file)
    //     // console.log(req.body.name)
    //     return res.status(200).json("successfully upload")
    // }
    // catch(err){
    //     console.log(err)
    // }



//When we got to "/api/users" address, "userRoutes" will run

// app.use("/api/users", userRoute)
app.use("/users", userRoute)
app.use("/auth", authRoute)
app.use("/posts", postRoute)



//When the request path is "/images" we want "public/images" directory to open




app.listen(PORT, ()=> {
    console.log("backend server is running. Server started on PORT " + PORT)
});

// GET request
// app.get("/", (req, res) => {
//     res.send("welcome to homepage")
// })

