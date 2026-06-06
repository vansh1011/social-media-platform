import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'node:path';
import multer from 'multer';
import fs from 'fs';
import bcrypt from 'bcryptjs';

import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import MongoStore from 'connect-mongo';

import Post from './models/Post.js';
import User from './models/User.js';

dotenv.config();

const app = express();
const port = 8000;

app.set('trust proxy', 1);

app.use(cors({ 
    origin: process.env.CLIENT, 
    credentials: true 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.DB_URL)
    .then(() => console.log('Connected with DB'))
    .catch(err => console.log('DB Connection Error:', err));

app.use(session({
    secret: process.env.SESSION_SECRET ,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DB_URL,
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false, { message: 'Incorrect email.' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: 'Incorrect password.' });
        
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ error: "Unauthorized access" });
};

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) return res.status(400).json({ error: "All fields required" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({ username, email, password: hashedPassword });
        
        req.login(newUser, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.status(201).json({ username: newUser.username });
        });
    } catch (error) {
        res.status(400).json({ error: "Username or Email already exists" });
    }
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(400).json({ error: info.message || "Login failed" });
        
        req.login(user, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.json({ username: user.username });
        });
    })(req, res, next);
});

app.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.json({ message: "Logged out successfully" });
    });
});

app.get('/me', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ username: req.user.username });
    } else {
        res.status(401).json({ error: "Not logged in" });
    }
});

app.get('/feed', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skipAmount = (page - 1) * limit;

        const posts = await Post.find().sort({ createdAt: -1 }).skip(skipAmount).limit(limit);
        const totalPosts = await Post.countDocuments();
        const hasMore = skipAmount + posts.length < totalPosts;

        res.json({ posts, hasMore });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/post', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
        const { content } = req.body;
        if (!content && !req.file) return res.status(400).json({ error: "Post content or image required" });

        let imgUrl = req.file ? `${process.env.BACKEND_URL}/uploads/${req.file.filename}` : "";

        const newPost = await Post.create({
            username: req.user.username,
            content: content || "",
            imgUrl,
            imageName: req.file?.filename || "",
            imageOriginalName: req.file?.originalname || "",
            likes: [],
            comments: []
        });
        res.status(201).json({ message: "Done", data: newPost });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/like', isAuthenticated, async (req, res) => {
    try {
        const { postID } = req.body;
        const username = req.user.username;

        const post = await Post.findById(postID);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const hasLiked = post.likes.includes(username);
        const updateOperation = hasLiked ? { $pull: { likes: username } } : { $addToSet: { likes: username } };

        const updatedPost = await Post.findByIdAndUpdate(postID, updateOperation, { new: true });
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/comment', isAuthenticated, async (req, res) => {
    try {
        const { postID, text } = req.body;
        if (!text || !text.trim()) return res.status(400).json({ error: "Comment text cannot be blank" });

        const updatedPost = await Post.findByIdAndUpdate(
            postID,
            { $push: { comments: { username: req.user.username, text } } },
            { new: true }
        );
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => console.log(` http://localhost:${port}`));