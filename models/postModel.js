import mongoose from "mongoose";

//Define Schema Structure means declaring database. 
const postSchema = new mongoose.Schema({
    
        userId:{
            type: String,
            required: true  
            },
        desc:{
            type: String,
            max: 500
            },
        img:{ 
            type: String
            },
        likes:{
            type: Array,
            default: []
           },
        

      },
     {timestamps: true}
);

//Schema Model, model in a way is a collection(like a table). We are making/creating a collection names "userCollection" in "userSchema" database.
const postCollection = mongoose.model("postCollection", postSchema);

export default postCollection;

 