const express = require("express");

const {
  toggleUserFollow,
} = require("../controllers/followController");

const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/users/:userId",
  authenticate,
  toggleUserFollow
);

module.exports = router;
