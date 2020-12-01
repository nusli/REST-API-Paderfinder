const express = require('express')
const router = express.Router()
const Post = require('../models/post')

// got the code from here:
// https://www.youtube.com/watch?v=EVIGIcm7o2w
const mongoose = require('mongoose')
var Schema = mongoose.Schema;
// establish mongodb connection
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true})
var conn = mongoose.connection;
var path = require('path');
// require GridFS
const Grid = require('gridfs-stream');
const fs=require('fs');

// connect GridFS and Mongo
Grid.mongo = mongoose.mongo

// Getting all
router.get('/', async (req, res) => {
    try{
        const posts = await Post.find();
        res.json(posts);
    } catch (err){
        res.status(500).json({ message: err.message });
    }
})
// Getting one
router.get('/:id', getPost, (req, res) => {
    res.json(res.post)
})
// creating one
router.post('/', async (req, res) => {
    // required fields
    const post = new Post({
        titel: req.body.titel,
        änderungsDatum: req.body.änderungsDatum
    })

    // optional fields
    if (req.body.stamm_id != null) post.stamm_id = req.body.stamm_id
    if (req.body.autor != null) post.autor = req.body.autor
    if (req.body.inhalt != null) post.inhalt = req.body.inhalt
    if (req.body.tags != null) post.tags = req.body.tags
    if (req.body.image != null) {
        // TODO: how to check of connection is open?
        conn.once('open', function () {
        console.log('- Connection open -');
        var gfs = Grid(conn.db);
        // when connection is open, create write stream with
        // the name to store file as in the DB
        var writestream = gfs.createWriteStream({
            // TODO: get file ending
            filename: req.body.titel + "_image.jpg"
        });
        // TODO: does image need to be piped?
        // create a read_stream for the image and pipe into db
        fs.createReadStream(req.body.image).pipe(writestream);

        /*
        writestream.on('close', function(file) {
            //do sth. with 'file'
            
        })*/
    })
    }
    try {
        const newPost = await post.save();
        res.status(201).json(newPost)
    } catch (err) {
        res.status(400 /* wrong user input */).json({message: err.message})
    }
})
// updating one
router.patch('/:id', getPost, async (req, res) => {
    if (req.body.titel != null) {
        res.post.titel = req.body.titel
    }
    if (req.body.autor != null) {
        res.post.autor = req.body.autor
    }
    if (req.body.änderungsDatum != null) {
        res.post.änderungsDatum = req.body.änderungsDatum
    }
    if (req.body.stamm_id != null) {
        res.post.stamm_id = req.body.stamm_id
    }
    if (req.body.inhalt != null) {
        res.post.inhalt = req.body.inhalt
    }
    if (req.body.tags != null) {
        res.post.tags = req.body.tags
    }
    try {
        const updatedPost = await res.post.save()
        res.json(updatedPost)
    } catch (err) {
        res.status(400).json({message: err.message})
    }

})
// deleting one
router.delete('/:id', getPost, async (req, res) => {
    try {
        await res.post.remove()
        res.json({ message: "Post gelöscht"})
    } catch (err) {
        res.status(500).json({ message: err.message})
    }
})

async function getPost(req, res, next) {
    try {
        var post = await Post.findById(req.params.id)
        if (post == null){
            return res.status(404).json({message: 'Post konnte nicht gefunden werden.'})
        }
    } catch (err) {
        return res.status(500).json( { message: err.message})
    }
    res.post = post
    next()
}

module.exports = router;