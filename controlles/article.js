'use strict'

var validator = require('validator');

var fs = require('fs');
var path = require('path');

const article = require('../modelos/article');
var Article = require('../modelos/article');
const { exists } = require('../modelos/article');

var controller = {
    
    datosCurso: (req,res)=> {
        var hola = req.body.hola;
        
        return res.status(200).send({
            curso: 'master en Framework',
            User:'panda',
            url: 'pandatex.es',
            hola,
            
        });
    },

    test: (req,res) => {
        return res.status(200).send({
            message:'soy la accion test de mi controlador de articulos'
        });

    },


    save: (req,res) =>{
        //recoger los parametros por post
        var params = req.body;
        

        //validar datos (validator)
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);

        }catch(err){
            return res.status(200).send({
                status:'error',
                message: 'Faltan datos por enviar!!!'
            });
        }

        if(validate_title && validate_content){

        //crear el objeto a guardar
           var article = new Article(); 

        //asignar valores
            article.title = params.title;
            article.content = params.content;
            article.image = null;

        //guardar el articulo
        article.save((err,articleStored) =>{
            if(err || !articleStored){
                return res.status(404).send({
                    status:'error',
                    message: 'el articulo no se a guardado!!'
                });
            }

                //devolver una respuesta
                return res.status(200).send({
                status:'Success',
                article:articleStored
            });
            

            
        });



        }else {
            return res.status(200).send({
                status:'error',
                message: 'los datos son invalidos!'
            });
        }
       
    },

//metodo que saca todos los articulos 

    getArticles: (req,res) =>{

        var query = Article.find({});

        var last = req.params.last;
        if(last || last !=undefined ){
            query.limit(5);
        }

        //Find
        query.sort('-_id').exec((err,articles)=> {
            
            if(err){
                return res.status(500).send({
                    status:'error',
                    message: 'error al devolver los articulos'
                });
            }

            if(!articles){
                return res.status(404).send({
                    status:'error',
                    message: 'no hay articulos para mostrar!'
                });
            }

            return res.status(200).send({
                status:'success',
                articles
            });


        });

       
        
    },




    getArticle: (req,res) =>{

        //recoger el id de la url
        var articleId = req.params.id;

        //comprobar si existe 
        if(!articleId || articleId == null){
            return res.status(404).send({
                status:'error',
                message: 'no existe el articulo!'
            });
        }
        //buscar el articulo
        Article.findById(articleId, (err,article)=>{
        
            if(err || !article){
                return res.status(404).send({
                    status:'error',
                    message: 'Error al devolver los datos !!!'
                });
            }
            
            //devolver en json
            return res.status(200).send({
                status:'success',
                article
            });



        });




    },


    update: (req,res) => {
        //recoger el id del articulo por la url
        var articleId = req.params.id;

        //recoger los datos que llegan por put
        var params = req.body;

        //validar los datos
        try{
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        }catch(err) {
            return res.status(404).send({
                status:'error',
                message: 'Faltan datos por enviar!!!'
            });
    
        }

        if(validate_title && validate_content){
             // Find and update
             Article.findOneAndUpdate({_id: articleId}, params, {new : true}, (err,articleUpdate)=>{
                if(err){
                    return res.status(500).send({
                        status:'error',
                        message: 'error al actualizar !!!'
                    });
                }
                if(!articleUpdate){
                    return res.status(404).send({
                        status:'error',
                        message: 'no existe el articulo !!!'
                    });
                }
                return res.status(200).send({
                    status:'success',
                    article: articleUpdate
                });
             });
        }else{
            //devolver respuesta 
            return res.status(404).send({
                status:'error',
                message: 'la validacion no es correcta !!!'
            });

        }
       
        
    },

    delete : (req,res) => {
        //recoger el id de la url
        var articleId = req.params.id;

        //find and Delete

        Article.findByIdAndDelete({_id: articleId}, (err, articleRemoved)=>{
            if(err){
                return res.status(500).send({
                    status:'error',
                    message: 'Error al borrar !!!'
                }); 
            }
            if(!articleRemoved){
                return res.status(404).send({
                    status:'error',
                    message: 'No se ha borrado el articulo, posiblemente no exista !!!'
                }); 
            }
            return res.status(200).send({
                status: 'success',
                article: articleRemoved
            })
        });
        
       
    },

    upload : (req,res) => {
        //configurar el modulo connect multiparty router/article.js (hecho)


        //recoger el fichero de la peticion 
        var file_name = 'Imagen no subida...'

        if(!req.files){
            return res.status(404).send({
                status:'error',
                message: file_name
            })

        }
       
        //conseguir el nombre y la extencion del archivo 
        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\');

        // *ADVERTENCIA * EN LINUX O MAC
        // var file_split = file_pat.split('/');

        //Nombre del archivo
        var file_name = file_split[2];

        //extension del fichero
        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];


        //comprobar la extension, solo imagenes , si es valido borrar el fichero
        if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif'){
            //Borrar el archivo subido
            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    status: 'error',
                    message: 'la extension de la imagen no es valida'
                 }); 
            })
        }else {
            //si todo es valido , sacando id de la url
            var articleId = req.params.id;
            //buscar el articulo, asignarle el nombre de la imagen y actualizarlo
            Article.findByIdAndUpdate({_id: articleId },{image:file_name},{new:true},(err,articleUpdate)=>{
                if(err || !articleUpdate){
                    return res.status(404).send({
                        status:'Error',
                        message:'error al guardar la imagen de articulos'    
                    }); 
                }
                
                return res.status(200).send({
                    status:'success',
                    article: articleUpdate
                 }); 
            });


            
        }
       
        
    }, //end upload file

    getimage : (req,res) =>{
        var file = req.params.image;
        var path_file = './upload/articles/'+file;

        fs.exists(path_file, (exists) =>{
            if(exists){
                return res.sendFile(path.resolve(path_file))
            }else{
                return res.status(404).send({
                    status:'error',
                    message:'La imagen no existe !!!'   
                }); 
            }
        });

        

    }, //end getimage

    search: (req,res) =>{
        //sacar el String para buscar 

        var searchString = req.params.search;

        // Find or 
        Article.find({"$or":[
            {"title":{"$regex": searchString,"$options":"i"}},
            {"content":{"$regex": searchString,"$options":"i"}}
            
        ]})
        .sort([['date','descending']])
        .exec((err,articles)=>{

            if(err){
                return res.status(500).send({
                    status:'error',
                    message:'Error en la peticion'   
                });
            }
            if(!articles || articles.length <=0 ){
                return res.status(404).send({
                    status:'error',
                    message:'No hay articulos que coincidan con tu busqueda!'
                });
            }

            return res.status(200).send({
                status:'success',
                articles   
            }); 
        });

        
    }, //end search






}; // end controller

module.exports = controller;