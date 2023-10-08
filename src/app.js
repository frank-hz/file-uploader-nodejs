const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const fileUpload = require('express-fileupload');

// Settings
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

// Midlewares
app.use(cors());
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// Static Files
app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(path.join(__dirname,'public/js')));
app.use(express.static(path.join(__dirname,'storage')));


// Routes
app.use(require('./routes.js'));

app.listen(app.get('port'), ()=>{
    console.log(`app serve in ${app.get('port')}`);
});