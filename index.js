'use strict'
//importar variables
require('dotenv').config({path: 'variables.env'});

const express = require('express')


var mongoose = require('mongoose');
var app = require('./app');
//var port = 3900;


mongoose.set('useFindAndModify',false)
mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB_URL, {useNewUrlParser:true,useUnifiedTopology: true},).then(()=> {
    console.log('la conexion a la base de datos se ha realizado con exito!!!')

//setting

  //  app.set('port',process.env.PORT || 3000);

    //crear servidor  y escuchar peticiones http
    app.listen(port,host,()=> {
        console.log('servidor corriendo en el puerto 3000');
    });


});
//leer localhost de variables y puerto
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT ||  3000;

//static files
app.use(express.static('dist')); 
