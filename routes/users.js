import Express from "express";
import Bcrypt from "bcrypt";
import userCollection from "../models/userModel.js";

const router = Express.Router();

// RESET password and UPDATE other info
router.put("/:id", async (req, res) => {
     
    // req.parmas.id means the id that's appended in the URL
    //if both id's match or if we pass isAdmin as true, then this will execute
    if(req.body.userId === req.params.id || req.body.isAdmin){
        
        //This block executes only if we passed password in the req body
        if(req.body.password){

            try{
                //Whatever password we passed in the req body, is hashed(encrypted) and salted and is assingned as new password.
                const salt = await Bcrypt.genSalt(10);
                req.body.password = await Bcrypt.hash(req.body.password, salt);

                res.status(200).json("password  apdated")

            }

            catch(err){
                return res.status(500).json(err);
            }
        }

        try{
            // From the userCollection, the user document is found by using ID. Then the value of the field is set to whatever is passed in req body.
            const updatedUser = await userCollection.findByIdAndUpdate(req.params.id, {
                $set: req.body
            });

            res.status(200).json("Your account apdated")
        }

        catch(err){
            return res.status(500).json(err);
        }
        
    }
    else{
        return res.status(403).json("You can't update only your account")
    }
})


//DELETE a user
router.delete("/", async (req, res) => {
     
    // req.parmas.id means the id that's appended in the URL
    if(req.body.userId === req.params.id || req.body.isAdmin){
        
        try{
            // From the userCollection, the user document is found by using ID and it's then deleted
            const deletedUser = await userCollection.deleteOne({_id: req.params.id});
            res.status(200).json("account deleted ")
        }
        catch(err){
            return res.status(500).json(err);
        }
        
    }
    else{
        return res.status(403).json("You can't delete only your account")
    }
})


//GET a user
router.get("/", async (req, res) => {

    // "query" is for example we write "http://localhost:3000?userId=1234444&userName="Manny"
    const userid = req.query.userId;
    const username = req.query.userName;

    try{
        //we can also use "findOne({ _id: body.params.id})"
        const fetchedUser = userid
        ? await userCollection.findById(userid) 
        : await userCollection.findOne({userName: username})
        // await userCollection.findOne({userName: userName })
        //We do not want password and createdAt to be visible. This way we will be abel to see other fields except password and createdAt
        const {password, createdAt, ...other} = fetchedUser._doc;
        res.status(200).json(other);
    }

    catch(err){
        return res.status(500).json(err);
    }
})
//GET user friends
router.get("/friends/:userId", async (req, res) => {
    try{
        //user is the whose profile is open
        const user = await userCollection.findById(req.params.userId);
        
        const userFollowers = await Promise.all(
                //we are mapping through "followers" array and returning those users from userCollection
                user.following.map((followerId) => {
                    return userCollection.findById(followerId);
                  })
        )

        //We have each and every information about the followers in "currentUserFollowers" array. But we only want _id, userName and profilePicture.
        //So we map through "currentUserFollowers" and fetch followers with only _id, userName and profilePicture and push it to followerList.
        let followerList = [];
        userFollowers.map((follower) => {
            const { _id, userName, profilePicture } = follower;

            followerList.push({userName, profilePicture, _id})
        })

        res.status(200).json(followerList);
    }
    catch(err){
        res.status(500).json(err)
    }
})

//FOLLOW a user
router.put("/:id/follow", async (req, res) => {

    //if the id we passed with URL and in req body, does not match means the user is obviously trying to follow someone else (other than himself). So following will be executed
    if(req.body.userId !== req.params.id){
        try{
            const anotherUser = await userCollection.findById(req.params.id);
            const currentUser = await userCollection.findById(req.body.userId);

            //if the currentUser's following's array does not include anotherUser, this executes
            if(!currentUser.following.includes(req.params.id)){

                //We will add the userId of the anotherUser(from URL/params) to the followings array of the currentUser
                await currentUser.updateOne({$push : { following: req.params.id}});

                //We will add the userId of the currentUser(from req body) to the followers array of the anotherUser
                await anotherUser.updateOne({$push : { followers: req.body.userId}});

                res.status(200).json("You are now following this user")
            }

            else{
                res.status(403).json("already following the user")
            }
        }
        
        catch(err){
            return res.status(500).json(err);
        }
    }
    else{
        res.status(403).json(" you can't follow yourself");
    }
})

//UNFOLLOW a user
router.put("/:id/unfollow", async (req, res) => {

    //if the id we passed with URL and in red body, does not match means the user is obviously trying to follow someone else (other than himself). So following will be executed
    if(req.body.userId !== req.params.id){
        try{
            const anotherUser = await userCollection.findById(req.params.id);
            const currentUser = await userCollection.findById(req.body.userId);

            //if the currentUser's following's array does not include anotherUser, this executes
            if(currentUser.following.includes(req.params.id)){

                //We will add the userId of the anotherUser(from URL/params) to the followings array of the currentUser
                await currentUser.updateOne({$pull : { following: req.params.id}});

                //We will add the userId of the currentUser(from req body) to the followers array of the anotherUser
                await anotherUser.updateOne({$pull: { followers: req.body.userId}});

                res.status(200).json("You unfollowed this user")
            }

            else{
                res.status(403).json("you don't follow the user")
            }
        }
        
        catch(err){
            return res.status(500).json(err);
        }
    }
    else{
        res.status(403).json(" you can't follow/unfollow yourself");
    }
})

export default router;
