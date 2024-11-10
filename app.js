require('dotenv').config()
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const userRouter = require("./routes/user");
const blogRouter = require("./routes/blog");
const cookiePaser = require("cookie-parser");
const { checkForAuthentication } = require("./middleware/auth");

const path = require("path");
const blog = require("./models/blog");

mongoose
  .connect(process.env.MongoDB_URL)
  .then((e) => console.log("Mongodb connected"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookiePaser());
app.use(checkForAuthentication("token"));
app.use(express.static(path.resolve("./public")));

const PORT = process.env.PORT || 8000;

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.get("/", async (req, res) => {
  const allBlogs = await blog.find({});

  res.render("home", {
    user: req.user,
    blogs: allBlogs,
  });
});

app.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

app.use("/user", userRouter);
app.use("/", blogRouter);

app.listen(PORT, () => console.log("Server started"));
