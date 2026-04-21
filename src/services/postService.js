const postModel = require('../models/postModel');

class PostService {
    async getAllPosts() {
        return await postModel.findAll();
    }
}

module.exports = new PostService();
