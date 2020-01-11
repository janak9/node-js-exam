const multer = require("multer");
const path = require('path');

var storage = multer.diskStorage({
    destination: function(req, file, cb){
        let subPath = '';
        if(file.fieldname == 'profile')
            subPath = '/profile';

        file.subPath = subPath;
        cb(null, './public' + subPath);
    },
    filename: function(req, file, cb){
        let fname = Date.now() + file.originalname.replace(' ', '_');
        file.fullPath = process.env['SITE_URL'] + file.subPath + "/" + fname;
        cb(null, fname);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // accept bytes. 1024 * 1024 * 5 = 5mb
    fileFilter: function(req, file, cb){
        validateFile(req, file, cb);
    }
});

var validateFile = function(req, file, cb){
    allowedFileTypes = /jpeg|jpg|png|gif/;
    const extension = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType  = allowedFileTypes.test(file.mimetype);
    if(extension && mimeType){
        return cb(null, true);
    }else{
        req.fileValidationError = "Invalid file type. Only JPEG, PNG and GIF file are allowed.";
        return cb(null, false, new Error(req.fileValidationError));
    }
}

module.exports = upload;