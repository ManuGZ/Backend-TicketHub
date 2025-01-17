const router = require("express").Router();
const Post = require("../models/Post")
const User = require("../models/User");
const Comment = require("../models/Comment");

///create a post

router.post("/", async (req, res) => {
    const newPost = new Post(req.body);
    try {
      const savedPost = await newPost.save();
      res.status(200).json(savedPost);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  //update a post
  
  router.put("/:id", async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (post.userId === req.body.userId) {
        await post.updateOne({ $set: req.body });
        res.status(200).json("the post has been updated");
      } else {
        res.status(403).json("you can update only your post");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  });
  //delete a post
  
  router.delete("/:id", async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (post.userId === req.body.userId) {
        await post.deleteOne();
        res.status(200).json("the post has been deleted");
      } else {
        res.status(403).json("you can delete only your post");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  });
  //like / dislike a post
  
  router.put("/:id/like", async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post.likes.includes(req.body.userId)) {
        await post.updateOne({ $push: { likes: req.body.userId } });
        res.status(200).json("The post has been liked");
      } else {
        await post.updateOne({ $pull: { likes: req.body.userId } });
        res.status(200).json("The post has been disliked");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  });
  //get a post
  
  router.get("/:id", async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      res.status(200).json(post);
    } catch (err) {
      res.status(500).json(err);
    }
  });
//Get timeline posts

router.get("/timeline/all", async (res, req) => {
    try{
        const currentUser = await User.findById(req.body.userId);
        const userPosts = await Post.fin({userId: currentUser._id});
        const friendPosts = await Promise.all(
            currentUser.followings.map(friendId => {
                return Post.find({userId: friendId});
            })
        )
        res.json(userPosts.concat(...friendPosts))
    }catch (err) {
      res.status(500).json(err);
    }
})

//Comentarios o feedback
// Crear un nuevo comentario en una publicación
router.post("/:id/comments", async (req, res) => {
  const newComment = new Comment(req.body);
  newComment.postId = req.params.id;
  try {
    const savedComment = await newComment.save();
    res.status(200).json(savedComment);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Obtener comentarios de una publicación por su ID
router.get("/:id/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.id });
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router