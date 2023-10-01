const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
router.get('/', (req, res) => {
    res.render('template.ejs');
});


router.get('/files-get-all', async (req,res) => {
    let dirpath = path.join(__dirname, 'storage/');
    let data_dir = [];
    let data_files = [];
    fs.readdirSync(dirpath).forEach(file => {
        data_dir.push({
            'name': file,
            'size': fs.statSync(dirpath + file).size,
            'ext': path.extname(file),
            'size_rps': convertBytes( fs.statSync(dirpath + file).size ),
            'updated': fs.statSync(dirpath + file).mtime,
            'url': dirpath+file
        });
    });
    res.json(data_dir);
});

router.post('/file-upload', (req,res) => {
    let file = req.files.filex;
    let storagePath = __dirname + '/storage/' + file.name;
    
    file.mv(storagePath, (err) => {
        if (err) return res.status(500).json({'error': err});
        res.json({'message': 'Archivo guardado'});
    });
});

function convertBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['bytes', 'kb', 'mb', 'gb', 'tb', 'pb', 'eb', 'zb', 'yb']

    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
module.exports = router;

