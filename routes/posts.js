import Express from "express";
import postCollection from "../models/postModel.js";
import userCollection from "../models/userModel.js";
import {authenticateToken} from "auth.js";
const router = Express.Router();

//CREATE a post
router.post("/", async (req, res) => {

    try{

        //Creating new postCollection
        const newPost = new postCollection(req.body);

        //saving the post/ inserting into schema;  
        const savedPost = await newPost.save();
        // "savedPost" is a promise and is parsed to json and sent as as response
        res.status(200).json(savedPost);
    }
    catch(err){
        res.status(500).json(err)
    }
})



//UPDATE a post
router.put("/:id", async (req, res) => {

    try{

        //retruns the specific post that matches the id
        const selectedPost = await postCollection.findById(req.params.id);

        //if the userId of the params and req body are same, only then we allow updating
        if(selectedPost.userId === req.body.userId){

            //Whatever key/values we passed in the req body ,will be set/assigned/updated in the selectedPost
            const updatedPost = await selectedPost.updateOne({$set: req.body});

            res.status(200).json("post updated");


        }
        else{
            res.status(403).json("you can only update your posts");   
        }
    }

    catch(err){
        res.status(500).json(err);   
    }
})


//DELETE a post
router.delete("/:id", async (req, res) => {

    try{
        //retruns the specific post that matches the id
        const selectedPost = await postCollection.findById(req.params.id);

        //if the userId of the params and req body are same, only then we allow updating
        if(selectedPost.userId === req.body.userId){

            //Whatever key/values we passed in the req body ,will be set/assigned/updated in the selectedPost
            const updatedPost = await selectedPost.deleteOne();

            res.status(200).json("post deleted");
        }
        else{
            res.status(403).json("you can only delete your posts");   
        }
    }

    catch(err){
        res.status(500).json(err);   
    }
})

//LIKE / UNLIKE a post
router.put("/:id/like", async (req, res) => {

    try{
        const currentPost = await postCollection.findById(req.params.id);

        // if hte "likes" array of the currentPost does not include the userId who is liking the post, then this code executes
        if(!currentPost.likes.includes(req.body.userId)){
            await currentPost.updateOne({$push: {likes: req.body.userId}});
            res.status(200).json("post has been liked");
        }

        else{
            await currentPost.updateOne({$pull: {likes: req.body.userId}});
            res.status(200).json("post has been unliked")
        }
    }

    catch(err){
        res.status(500).json(err);   
    }
})

//GET a post
router.get("/:id", async (req, res) => {

    try{
        const selectedPost = await postCollection.findById(req.params.id);
        res.status(200).json(selectedPost);
    }
    catch(err){
        res.status(500).json(err);   
    }
});


//GET timeline posts
router.get("/timeline/:userId", authenticateToken, async (req, res) => {
            
    try{
        //We will get the user using the userId from req body
        const currentUser = await userCollection.findById(req.params.userId);
        
        //Using the same userId, we will get all the posts of that user
        const userPosts = await postCollection.find({userId: currentUser._id});

        //We are mapping through the "following" array to display the post of the people who are followed by the user.
        const followingsPosts = await Promise.all(

            currentUser.following.map((item) => {
                //the "item" is the userId of the folloed people. so in the postCollection all the post having userId same as "item", will be returned
                return postCollection.find({userId: item});
            }));
        
        res.status(200).json(userPosts.concat(...followingsPosts));

        
    }
    catch(err){
        res.status(500).json(err);   
    }
});

//GET current user's all posts
router.get("/profile/:username", async (req, res) => {
            
    try{
        console.log(req.params.username)
        const fetchedCurrentUser = await userCollection.findOne({userName: req.params.username})
        // console.log("user: "+user)
        const fetchedCurrentUserPosts = await postCollection.find({userId: fetchedCurrentUser._id});
        // console.log("posts: " +posts)

        res.status(200).json(fetchedCurrentUserPosts); 
    }
    catch(err){
        console.log("wee")
        res.status(500).json(err);   
    }
});

// router.get("/profile/:username", async (req, res) => {
         
//     try{
//         const currentUserProfile = await userCollection.findOne({userName: req.params.username})
        
//         console.log(currentUserProfile._id)
//         const currentUserPosts = await postCollection.find({userId: currentUserProfile._id})
//         console.log("this " +currentUserPosts)

//         res.status(200).json(currentUserPosts);
//     }

//     catch(err){
//         console.log("heeeeeeeeeeeee")
//         res.status(500).json(err);  
//         console.log("weeee")
 
//     }
// });







export default router;
