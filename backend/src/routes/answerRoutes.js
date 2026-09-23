const express = require("express");

const {
  acceptAnswer,
} = require("../controllers/answerController");

const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/posts/:postId/comments/:commentId/accept",
  authenticate,
  acceptAnswer
);

module.exports = router;
