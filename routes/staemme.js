const express = require('express')
const router = express.Router()
const Stamm = require('../models/stamm')

// Getting all
router.get('/', async (req, res) => {
    try{
        const staemme = await Stamm.find();
        res.json(staemme);
    } catch (err){
        res.status(500).json({ message: err.message });
    }
})
// Getting one
router.get('/:id', getStamm, (req, res) => {
    res.json(res.stamm)
})
// creating one
router.post('/', async (req, res) => {
    // required fields
    const stamm = new Stamm({
        name: req.body.name,
        email: req.body.email,
        passwort: req.body.passwort
    })

    // optional fields
    if (req.body.reg_datum != null) stamm.reg_datum = req.body.reg_datum
    if (req.body.ansprechpartner != null) stamm.ansprechpartner = req.body.ansprechpartner
    if (req.body.telefon != null) stamm.telefon = req.body.telefon
    if (req.body.beschreibung != null) stamm.beschreibung = req.body.beschreibung
    if (req.body.adresse != null) stamm.adresse = req.body.adresse
    if (req.body.mitglieder != null) stamm.mitglieder = req.body.mitglieder

    try {
        const newStamm = await stamm.save();
        res.status(201).json(newStamm)
    } catch (err) {
        res.status(400 /* wrong user input */).json({message: err.message})
    }
})
// updating one
router.patch('/:id', getStamm, async (req, res) => {
    if (req.body.name != null) {
        res.stamm.name = req.body.name
    }
    if (req.body.ansprechpartner != null) {
        res.stamm.ansprechpartner = req.body.ansprechpartner
    }
    if (req.body.telefon != null) {
        res.stamm.telefon = req.body.telefon
    }
    if (req.body.email != null) {
        res.stamm.email = req.body.email
    }
    if (req.body.passwort != null) {
        res.stamm.passwort = req.body.passwort
    }
    if (req.body.beschreibung != null) {
        res.stamm.beschreibung = req.body.beschreibung
    }
    if (req.body.adresse != null) {
        res.stamm.adresse = req.body.adresse
    }
    if (req.body.mitglieder != null) {
        res.stamm.mitglieder = req.body.mitglieder
    }
    try {
        const updatedStamm = await res.stamm.save()
        res.json(updatedStamm)
    } catch (err) {
        res.status(400).json({message: err.message})
    }

})
// deleting one
router.delete('/:id', getStamm, async (req, res) => {
    try {
        await res.stamm.remove()
        res.json({ message: "Stamm gelöscht"})
    } catch (err) {
        res.status(500).json({ message: err.message})
    }
})

async function getStamm(req, res, next) {
    try {
        var stamm = await Stamm.findById(req.params.id)
        if (stamm == null){
            return res.status(404).json({message: 'Cannot find subscriber'})
        }
    } catch (err) {
        return res.status(500).json( { message: err.message})
    }
    res.stamm = stamm
    next()
}

module.exports = router;


// TODO: github repo frontend + api
// TODO: login api
