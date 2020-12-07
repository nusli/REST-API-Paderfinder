const express = require('express')
const router = express.Router()
const Image = require('../models/image')

const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');

// got the code from here:
// https://www.youtube.com/watch?v=EVIGIcm7o2w
const mongoose = require('mongoose')
var Schema = mongoose.Schema;
var Gridfs = require('gridfs-stream');
// establish mongodb connection
//mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true})
const connect = mongoose.createConnection(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
var path = require('path');


var mongoDriver = mongoose.mongo;
var gfs;

const fileUpload = require('express-fileupload');
router.use(fileUpload());

connect.once('open', () => {
    // initialize stream
    gfs = new mongoose.mongo.GridFSBucket(connect.db);
});

helpers = {
    imageFilter: function(req, file, cb) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
            req.fileValidationError = 'Only image files are allowed!';
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
}
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '../images/');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});


// Getting all
router.get('/', 
    (req, res, next) => {
        gfs.find().toArray((err, files) => {
            if (err) {
                console.log(err);
            return res.status(400).json({
                success: false,
                message: err.message
            });
            }
            else if (!files || files.length === 0) {
                return res.status(200).json({
                    success: false,
                    message: 'No files available'
                });
            }

            files.map(file => {
                if (file.contentType === 'image/jpeg' || file.contentType === 'image/png' || file.contentType === 'image/svg') {
                    file.isImage = true;
                } else {
                    file.isImage = false;
                }
            });

            res.status(200).json({
                success: true,
                files,
            });
        });
})
// Getting one
router.get('/:metadata', (req, res, next) => {
    gfs.find({metadata: req.params.metadata}).toArray((err, files) => {
        console.log("files", files)
        if (err) {
            console.log(err);
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        else if (!files[0] || files.length === 0) {
            return res.status(200).json({
                success: false,
                message: 'No files available',
            });
        }

        res.status(200).json({
            success: true,
            file: files[0],
        });
    });
});
router.post('/upload', function(req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
  
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.image;
  
    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv('../images/' + sampleFile.name, function(err) {
      if (err)
        return res.status(500).send(err);
  
      res.send('File uploaded!');
    });
  });  
// creating one
/*
router.post('/', async (req, res) => {
    // required fields
    console.log(req.body)
    const image = new Image({
        img: {
            data: req.body.image,
            contentType: 'image/' + req.body.fileEnding
        }
    })

    try {
        const newImage = await image.save();
        res.status(201).json(newImage)
    } catch (err) {
        res.status(400 /* wrong user input *//*).json({message: err.message})
    }
})*/

// deleting one
router.delete('/:id', getImage, async (req, res) => {
    try {
        await res.image.remove()
        res.json({ message: "Bild gelöscht"})
    } catch (err) {
        res.status(500).json({ message: err.message})
    }
})

async function getImage(req, res, next) {
    try {
        var image = await Image.findById(req.params.id)
        if (image == null){
            return res.status(404).json({message: 'Bild konnte nicht gefunden werden.'})
        }
    } catch (err) {
        return res.status(500).json( { message: err.message})
    }
    res.image = image
    next()
}

module.exports = router;