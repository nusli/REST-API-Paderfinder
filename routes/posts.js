if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config
}

const express = require('express')
const router = express.Router()
const Post = require('../models/post')
const Image = require('../models/image')
var nodeUuid = require('node-uuid');
const fs = require('fs');

// got the code from here:
// https://www.youtube.com/watch?v=EVIGIcm7o2w
const mongoose = require('mongoose')
var Schema = mongoose.Schema;
var Gridfs = require('gridfs-stream');
// establish mongodb connection
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true})
var path = require('path');


var mongoDriver = mongoose.mongo;
var gfs;

mongoose.connection.once('open', function () {
    
    gfs = Gridfs(mongoose.connection.db, mongoDriver);
   
    // all set!
  })


/* gridfs
// require GridFS
const Grid = require('gridfs-stream');
const fs=require('fs');

// connect GridFS and Mongo
Grid.mongo = mongoose.mongo
*/

// Getting all
router.get('/', async (req, res) => {
    try{
        const posts = await Post.find();
        for (p of posts) {
            if (p.image_id != null) {
                p.image = (await getImage(p.image_id)).img
            } 
        }
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
    if (req.body.titel == null) return res.status(400 /* wrong user input */).json({message: '"titel" is missing.'})
    const post = new Post({
        titel: req.body.titel,
        änderungsDatum: new Date()
    })

    // optional fields
    if (req.body.stamm_id != null) post.stamm_id = req.body.stamm_id
    if (req.body.autor != null) post.autor = req.body.autor
    if (req.body.inhalt != null) post.inhalt = req.body.inhalt
    if (req.body.tags != null) post.tags = req.body.tags
    if (req.body.image != null) {

        var uuid = nodeUuid.v4();
        post.image_id = uuid;

        
        try {
            console.log(req.body.image.name)
            var writeStream = gfs.createWriteStream({
                _id: uuid,
                filename: req.body.image.name, // the name of the file
                content_type: req.body.image.type, // somehow get mimetype from request,
                mode: 'w' // ovewrite
             });
             
             req.body.image.stream().pipeTo(writeStream);

        } catch (err) {
            console.log("could not save image", err.message);
            res.status(400 /* wrong user input */).json({message: err.message});
            return;
        }

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
    res.post.änderungsDatum = new Date()
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

async function getImage(image_id) {
    try {
        var image;
        var readstream = gfs.createReadStream({
            _id: '50e03d29edfdc00d34000001'
        })
        readstream.pipe(image);
    }
    catch (err) {
        console.log('couldnt retrieve image', image_id, err.message)
    }
    return image
}

async function getPost(req, res, next) {
    try {
        var post = await Post.findById(req.params.id)
        if (post == null){
            return res.status(404).json({message: 'Post konnte nicht gefunden werden.'})
        }
        if(post.image_id != null) {
            post.image = (await getImage(post.image_id)).img
        }
    } catch (err) {
        return res.status(500).json( { message: err.message})
    }
    res.post = post
    next()
}

module.exports = router;