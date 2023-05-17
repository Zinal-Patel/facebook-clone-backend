import mongoose from "mongoose";

//Define Schema Structure means declaring database. 
const userSchema = new mongoose.Schema({
    userName: {
                type: String,
                required: true,
                unique: true,
                min: 3,
                max: 20
               },
    email:{
            type: String,
            required: true,
            unique: true,
            max: 50
              },
    password:{
            type: String,
            required: true,
            min: 6
             },
    profilePicture:{
            type: String,
            default: ""
          },
    coverPicture:{
            type: String,
            default: ""
          },
    followers:{
            type: Array,
            default: []
          },
    following:{
            type: Array,
            default: []
          },
    isAdmin:{
        type: Boolean,
        default: false
         },
    desc:{
        type: String,
        max: 50
         },
    city:{
        type: String,
        max: 50
         },
    from:{
        type: String,
        max: 50
        },
     relationship:{
        type: Number,
        enum: [1, 2, 3]
        }
     },

     {timestamps: true}
);

//Schema Model, model in a way is a collection(like a table). We are making/creating a collection names "userCollection" in "userSchema" database.
const userCollection = mongoose.model("userCollection", userSchema);

export default userCollection;

 