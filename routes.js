const express = require("express");
const userController = require("./apps/user/controller");

// cài đặt router
const router = express.Router();

// Home route
router.get("/", (req, res) => {
  res.render("home", {
    user: req.user,
  });
});

router.get('/user/id=:id', (req, res) => {
    res.render('personProfile', {});
});

// Login route
router.get("/login", (req, res) => {
  res.render("login", {});
});

// Signup route
router.get("/signup", (req, res) => {
  res.render("signup", {});
});

// friendRequest route
// router.get("/friends", (req, res) => {
//   res.render("friendRequest", {});
// });

// friend route
router.get("/friends", (req, res) => {
  res.render("friendList", {});
});

// google route
router.get("/LoginGoogle", (req, res) => {
  res.render("LoginGoogle", {});
});

// ForgetPassword route
router.get("/ForgetPassword", (req, res) => {
  res.render("ForgetPassword", {});
});

// CodeGoogle route
router.get("/CodeGoogle", (req, res) => {
  res.render("CodeGoogle", {});
});

router.get("/message", (req, res) => {
  res.render("message", {
    user: req.user,
  });
});



router.get("/group", (req, res) => {
  res.render("group", {});
});

router.get("/block", (req, res) => {
  res.render("block", {});
});

router.get("/Dang/test", (req, res) => {
    const posts = [{ id: 1, content: "Post 1" }, { id: 2, content: "Post 2" }];
    const reviewers = [{ id: 1, name: "Reviewer 1" }, { id: 2, name: "Reviewer 2" }];
    const user = req.user;
    res.render("personProfile", {user, posts, reviewers});
});

router.get("/Dang/test2", (req, res) => {
    const newPosts = [{ id: 1, content: "Post 1" }, { id: 2, content: "Post 2" }];
    const user = req.user;
    const postHtml = res.render('partials/posts', { posts: newPosts }, (err, html) => {
        if (err) {
          return res.status(500).send('Error rendering post');
        }
        res.json({ html: html });
      });
});

router.get("/search", userController.searchFriends);
router.get("/notification", userController.getNotifications);



module.exports = router;
