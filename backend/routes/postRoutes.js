const express = require("express");
const { createPost, getPosts, addComment } = require("../controllers/postController");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", auth(), createPost);
router.get("/", getPosts);
router.post("/:id/comments", auth(), addComment);

module.exports = router;
