const express = require('express');
const postController = require('../controllers/postController');

const router = express.Router();

router.get('/', postController.getPosts);
router.post('/:postId/publish', postController.publishPost);

module.exports = router;
