const express = require('express')
const router = express.Router()
const Aktivitaet = require('../models/aktivitaet')

// Getting all
router.get('/', async (req, res) => {
    try{
        const aktivitaeten = await Aktivitaet.find();
        res.json(aktivitaeten);
    } catch (err){
        res.status(500).json({ message: err.message });
    }
})
// Getting one
router.get('/:id', getAktivitaet, (req, res) => {
    res.json(res.aktivitaet)
})
// creating one
router.post('/', async (req, res) => {
    // required fields
    const aktivitaet = new Aktivitaet({
        titel: req.body.titel
    })

    // optional fields
    if (req.body.datum != null) aktivitaet.datum = req.body.datum
    if (req.body.stamm_id != null) aktivitaet.stamm_id = req.body.stamm_id
    if (req.body.ort != null) aktivitaet.ort = req.body.ort
    if (req.body.beschreibung != null) aktivitaet.beschreibung = req.body.beschreibung
    if (req.body.regelmaessig != null) aktivitaet.regelmaessig = req.body.regelmaessig
    if (req.body.art != null) aktivitaet.art = req.body.art
    if (req.body.min_teilnehmerzahl != null) aktivitaet.min_teilnehmerzahl = req.body.min_teilnehmerzahl
    if (req.body.max_teilnehmerzahl != null) aktivitaet.max_teilnehmerzahl = req.body.max_teilnehmerzahl

    try {
        const newAktivitaet = await aktivitaet.save();
        res.status(201).json(newAktivitaet)
    } catch (err) {
        res.status(400 /* wrong user input */).json({message: err.message})
    }
})
// updating one
router.patch('/:id', getAktivitaet, async (req, res) => {
    if (req.body.titel != null) {
        res.aktivitaet.titel = req.body.titel
    }
    if (req.body.datum != null) {
        res.aktivitaet.datum = req.body.datum
    }
    if (req.body.stamm_id != null) {
        res.aktivitaet.stamm_id = req.body.stamm_id
    }
    if (req.body.ort != null) {
        res.aktivitaet.ort = req.body.ort
    }
    if (req.body.regelmaessig != null) {
        res.aktivitaet.regelmaessig = req.body.regelmaessig
    }
    if (req.body.beschreibung != null) {
        res.aktivitaet.beschreibung = req.body.beschreibung
    }
    if (req.body.max_teilnehmerzahl != null) {
        res.aktivitaet.max_teilnehmerzahl = req.body.max_teilnehmerzahl
    }
    if (req.body.min_teilnehmerzahl != null) {
        res.aktivitaet.min_teilnehmerzahl = req.body.min_teilnehmerzahl
    }
    if (req.body.art != null) {
        res.aktivitaet.art = req.body.art
    }
    try {
        const updatedAktivitaet = await res.aktivitaet.save()
        res.json(updatedAktivitaet)
    } catch (err) {
        res.status(400).json({message: err.message})
    }

})
// deleting one
router.delete('/:id', getAktivitaet, async (req, res) => {
    try {
        await res.aktivitaet.remove()
        res.json({ message: "Aktivität gelöscht"})
    } catch (err) {
        res.status(500).json({ message: err.message})
    }
})

async function getAktivitaet(req, res, next) {
    try {
        var aktivitaet = await Aktivitaet.findById(req.params.id)
        if (aktivitaet == null){
            return res.status(404).json({message: 'Aktivität konnte nicht gefunden werden'})
        }
    } catch (err) {
        return res.status(500).json( { message: err.message})
    }
    res.aktivitaet = aktivitaet
    next()
}

module.exports = router;