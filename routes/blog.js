const { Router } = require("express");
const router = Router();
const multer = require("multer");
const path = require("path");
const blog = require("../models/blog");
const Comment = require("../models/comment");

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

router.get("/blog/:id", async (req, res) => {
  try {
    const blogData = await blog.findById(req.params.id).populate("createdBy");
    const comments = await Comment.find({ blogId: req.params.id }).populate('createdBy');
    console.log(comments);
    // Render the page, passing the blogData and comments arrays
    return res.render("blog", {
      user: req.user,  // Make sure this is set correctly
      blogData,
      comments: comments || []  // Make sure comments is always an array
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error fetching blog or comments.');
  }
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
      return res.redirect(`/blog/${req.params.blogId}`);
  } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).send("Server Error");
  }
});


router.get('/explain/:id',async (req,res)=>{
  const comments = await Comment.find({ blogId: req.params.id }).populate('createdBy');
  const blogData= await blog.findById(req.params.id).populate('createdBy');
  res.render('blog',{
    user: req.user,
    blogData,
    comments: comments || []
  })
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
