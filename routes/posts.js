if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config
}

const express = require('express')
const router = express.Router()
const Post = require('../models/post')
const Image = require('../models/image')
var nodeUuid = require('node-uuid');
const fs = require('fs');
const path = require('path')

const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');

const fileUpload = require('express-fileupload');
router.use(fileUpload());

// got the code from here:
// https://www.youtube.com/watch?v=EVIGIcm7o2w
const mongoose = require('mongoose')
var Schema = mongoose.Schema;
var Gridfs = require('gridfs-stream');
// establish mongodb connection
//mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true})
mongoose.createConnection(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });


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
    console.log("post", res.post)
    res.json(res.post)
})
// creating one
router.post('/upload', async (req, res) => {
    //console.log("post request ", req.file, req.body)
    // required fields
    if (req.body.titel == null) return res.status(400 /* wrong user input */).json({message: '"titel" is missing.'})
    const post = new Post({
        titel: req.body.titel,
        änderungsDatum: new Date()
    })

    // optional fields
    if (req.body.stamm_id != null) post.stamm_id = req.body.stamm_id
    if (req.body.stamm_name != null) post.stamm_name = req.body.stamm_name
    if (req.body.autor != null) post.autor = req.body.autor
    if (req.body.art != null) post.art = req.body.art
    if (req.body.inhalt != null) post.inhalt = req.body.inhalt
    if (req.files != null) {
        
        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        let upFile = req.files.image;

      
        // Use the mv() method to place the file somewhere on your server
        upFile.mv('images/' + req.body.titel + path.extname(upFile.name), function(err) {
          if (err)
            console.log("Couldn't save file", err)
        });
        post.image = post.titel + path.extname(upFile.name)
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

function getImage(image_id) {
    try {
        console.log("find")
        return gfs.find().toArray();
    }
    catch (err) {
        console.log('couldnt retrieve image', image_id, err.message)
    }
}

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
/*
    if(res.post.image_id != null) {
        gfs.find({metadata: res.post.titel}).toArray( (err, files) => {
            if (err) console.log(err);
            if (!files || files.length === 0) {
                console.log("Couldn't retrieve file", res.post.image_id)
            }
            res.post.image = files[0]
            res.post.image = 14
            console.log(res.post)
            next()
        })
        
    }
    else {*/
        next()
    //}  
}

module.exports = router;
