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
router.post('/upload', (req, res) => {
    // 'profile_pic' is the name of our file input field in the HTML form
    let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).single('profile_pic');

    upload(req, res, function(err) {
        // req.file contains information of uploaded file
        // req.body contains information of text fields, if there were any

        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        }
        else if (!req.file) {
            return res.send('Please select an image to upload');
        }
        else if (err instanceof multer.MulterError) {
            return res.send(err);
        }
        else if (err) {
            return res.send(err);
        }

        // Display uploaded image for user validation
        res.send(`You have uploaded this image: <hr/><img src="${req.file.path}" width="500"><hr /><a href="./">Upload another image</a>`);
    });
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
// creating one
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
        res.status(400 /* wrong user input */).json({message: err.message})
    }
})

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