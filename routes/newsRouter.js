const express = require('express')
const router = express.Router()
const News = require('../models/news')

// Getting all
router.get('/', async (req, res) => {
    try{
        const newsfeed = await News.find();
        res.json(newsfeed);
    } catch (err){
        res.status(500).json({ message: err.message });
    }
})
// Getting one
router.get('/:id', getNews, (req, res) => {
    res.json(res.news)
})
// creating one
router.post('/', async (req, res) => {
    // required fields
    const news = new News({
        titel: req.body.titel,
        änderungsDatum: req.body.änderungsDatum
    })

    // optional fields
    if (req.body.stamm_id != null) news.stamm_id = req.body.stamm_id
    if (req.body.autor != null) news.autor = req.body.autor
    if (req.body.inhalt != null) news.inhalt = req.body.inhalt
    if (req.body.tags != null) news.tags = req.body.tags
    if (req.body.autor_email != null) news.autor_email = req.body.autor_email
    try {
        const newNews = await news.save();
        res.status(201).json(newNews)
    } catch (err) {
        res.status(400 /* wrong user input */).json({message: err.message})
    }
})
// updating one
router.patch('/:id', getNews, async (req, res) => {
    if (req.body.titel != null) {
        res.news.titel = req.body.titel
    }
    if (req.body.autor != null) {
        res.news.autor = req.body.autor
    }
    if (req.body.änderungsDatum != null) {
        res.news.änderungsDatum = req.body.änderungsDatum
    }
    if (req.body.autor_email != null) {
        res.news.autor_email = req.body.autor_email
    }
    if (req.body.stamm_id != null) {
        res.news.stamm_id = req.body.stamm_id
    }
    if (req.body.inhalt != null) {
        res.news.inhalt = req.body.inhalt
    }
    if (req.body.tags != null) {
        res.news.tags = req.body.tags
    }
    try {
        const updatedNews = await res.news.save()
        res.json(updatedNews)
    } catch (err) {
        res.status(400).json({message: err.message})
    }

})
// deleting one
router.delete('/:id', getNews, async (req, res) => {
    try {
        await res.news.remove()
        res.json({ message: "News gelöscht"})
    } catch (err) {
        res.status(500).json({ message: err.message})
    }
})

async function getNews(req, res, next) {
    try {
        var news = await News.findById(req.params.id)
        if (news == null){
            return res.status(404).json({message: 'News konnte nicht gefunden werden.'})
        }
    } catch (err) {
        return res.status(500).json( { message: err.message})
    }
    res.news = news
    next()
}

module.exports = router;