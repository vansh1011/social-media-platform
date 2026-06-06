import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    username: { type: String, required: true }, 
    content: { type: String, default: "" },
    imgUrl: { type: String, default: "" },
    imageName: String,
    imageOriginalName: String,
    likes: [{ type: String }], 
    comments: [{
        username: { type: String, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

const Post = mongoose.model('Post', PostSchema);
export default Post;