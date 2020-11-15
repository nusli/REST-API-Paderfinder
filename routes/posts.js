const express = require('express')
const router = express.Router()
const Post = require('../models/post')

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