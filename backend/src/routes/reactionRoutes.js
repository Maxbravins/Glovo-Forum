const express = require("express");

const {
  togglePostReaction,
  toggleCommentReaction,
} = require("../controllers/reactionController");

const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/posts/:postId",
  authenticate,
  togglePostReaction
);

router.post(
  "/comments/:commentId",
  authenticate,
  toggleCommentReaction
);

module.exports = router;
