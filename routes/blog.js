const { Router } = require("express");
const router = Router();
const multer = require("multer");
const path = require("path");
const blog = require("../models/blog");
const Comment = require("../models/comment");
const Reply = require('../models/reply')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads`));
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

router.get("/addNew", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});


router.post("/comment/:blogId", async (req, res) => {
  try {
      // Create a new comment
      const comment = await Comment.create({
          content: req.body.content,
          blogId: req.params.blogId,
          createdBy: req.user.id,
      });

      // Redirect to the blog page after creating the comment
      return res.redirect(`/explain/${req.params.blogId}`);
  } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).send("Server Error");
  }
});


router.get('/explain/:id',async (req,res)=>{
  const comments = await Comment.find({ blogId: req.params.id }).populate('createdBy');
  const replies = await Reply.find({ blogId: req.params.id }).populate('createdBy');
  const commentsWithReplies = comments.map(comment => {
    // Find replies for this comment
    const commentReplies = replies.filter(reply => reply.commentId.toString() === comment._id.toString());
    
    return {
      ...comment.toObject(),  // Converts the Mongoose document to a plain object
      replies: commentReplies  // Attach replies to this comment
    };
  });
  
  const blogData= await blog.findById(req.params.id).populate('createdBy');
  res.render('blog',{
    user: req.user,
    blogData,
    commentsWithReplies: commentsWithReplies || [],
  })
})


router.post("/reply/:blogId/:commentId", async (req,res) => {
  const comments = await Comment.find({ blogId: req.params.commentId }).populate('createdBy');
  const blogData= await blog.findById(req.params.blogId).populate('createdBy');
  // const reply= await blog.findById(req.params.id).populate('createdBy');
  try{
  const reply = await Reply.create({
    content: req.body.content,
    blogId: req.params.blogId,
    commentId: req.params.commentId,
    createdBy: req.user.id,
});
     // Redirect to the blog page after creating the comment
     return res.redirect(`/explain/${req.params.blogId}`);
    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).send("Server Error");
    }
})


router.post("/blog", upload.single("CoverImage"), async (req, res) => {
  const { title, body } = req.body;

  const blogs = blog.create({
    body,
    title,
    createdBy: req.user.id,
    coverImageURL: `/uploads/${req.file.filename}`,
  });


  
  return res.render("addBlog", {
    user: req.user,
  });

 
});

module.exports = router;
