import Express from "express";
// "bcrypt" library allows us to encrypt passwords
import bcrypt from "bcrypt";
import userCollection from "../models/userModel.js";

const router = Express.Router();

// REGISTER
router.post("/register", async (req, res) => {
    

    try{
        //A salt is a random string. By hashing a plain text password plus a salt, the hash algorithm's output is no longer predictable. The same password will no longer yield the same hash. The salt gets automatically included with the hash, so you do not need to store it in a database.
        const salt = await bcrypt.genSalt(10);
        // encrypting the password
        const hashedPassword= await bcrypt.hash(req.body.password, salt);

        //creating instance/obejct of a model
        //in simple words, we are creating a new user (think of it as a document in a collection or a row in a table and assigning the values to the fields from the data that we recieve from post request.
        // "newUser" is a document in a collection named "userCollection" 
        const newUser = await new userCollection({
                userName: req.body.userName,
                email: req.body.email,
                password: hashedPassword 
               })

        // saving the document "newUser".
        // .save() returns a promise and it inserts/creates the document.
        const savedUser = await newUser.save();
        // "savedUser" is a promise and is parsed to json and sent as as response
        res.status(200).json(savedUser);
    }
    catch(err){
        res.status(500).json(err);
    }
})


//LOGIN
router.post("/login", async (req, res) => {

    try{

        //Checking Username: 
            // The email we recieved from post request, we will find that email in the collection.
            // It returns the entire document of the user is the email is found and we are storing it in the variable "checkUser".
            const checkUser = await userCollection.findOne({email : req.body.email});
            // If checkUser is false or not found in the collection then we respond with 404 status.
            !checkUser && res.status(404).json("user not found");

        //Checking Password:
            // comapring the password we recieve from psot request and the password of the "checkUser". "checkUser" is a document which has all the user info.
            const ispasswordValid = await bcrypt.compare(req.body.password, checkUser.password)

            //If password is not valid, we return 400 status.
            !ispasswordValid && res.status(400).json("In valid password");

        // If email and password are valid, we will respond the user.
            res.status(200).json(checkUser)
           
    }
    catch(err){
        res.status(500).json(err);
    }
})



export default router;
