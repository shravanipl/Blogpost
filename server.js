'use strict';
const express = require('express');
const mongoose = require('mongoose');


mongoose.Promise = global.Promise;

const {PORT,DATABASE_URL} = require("./config");
const {Post} = require("./models");

const app = express();
let server;
app.use(express.json);

app.get("/posts" , (req,res)=>{
   Posts.find()
   .limit(10)
   .then(posts=>{
       res.json({
          posts: posts.map(post=>post.serialize())
       });
   })
   .catch(err =>{
      console.error(err);
      res.status(500).json({message:"Internal Server Error"});
   });
});

app.get("/posts/:id", (req,res) =>{
    Posts.findById(req.params.id)
    .then(post=> res.json(posts.serialize()))
    .catch(err =>{
        console.error(err);
        res.status(500).json({message:"Internal server error"});
    });
});

app.post("/posts", (req,res) =>{
    const requiredFields = ["title","author","content"];
    for(let i=0;i<requiredFields.length;i++){
        const field = requiredFields[i];
        if(!(field in req.body)){
            const message = `Missing ${field} in req body`;
            res.status(400).send(message);
        }
    }
    Posts.create({
        title: req.body.title,
        author: req.body.author,
        content: req.body.content
    })
    .then(post=> res.status(200).json(post.serialize()))
    .catch(err =>{
        console.error(err);
        res.status(500).json({message:"Internal server error"});
    });
});

app.put("/posts/:id", (req,res) =>{
    if(!(req.params.id === req.body.id)){
        const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
        console.error(message);
        res.status(400).send(message);
    }

    Posts.findByIdAndUpdate(req.params.id,{$set:toUpdate})
    .then(post => res.status(204).end())
    .catch(err=> res.status(500).json({message:"Internal server error"}));
});

app.delete("/posts/:id", (req,res) =>{
    Posts.findByIdAndDelete(req.params.id)
    .then(post => res.status(204).end())
    .catch(err => res.status(500).json({message:"Internal server error"}));
});

app.use("*",function(){
    res.status(400).json({message:"Not found"});
});

function runServer(databaseUrl,port = PORT){
    return new Promise((resolve,reject)=>{
        mongoose.connect(
            databaseUrl,
            err =>{
                if(err){
                    return reject(err);
                }

                server = app
                .listen(port,()=>{
                    console.log(`Your app is listening on port ${port}`);
                    resolve();
                })
                .on("error", err=>{
                    mongoose.disconnect();
                    reject(err);
                });
            }
        );
    });
}

function closeServer(){

    return mongoose.disconnect().then(() =>{
        return new Promise((resolve,reject) =>{
            console.log("closing server");
            server.close( err=>{
              if(err){
                  return reject(err);
              }
              resolve();
            })
        })
    });
}

if(require.main === module){
    runServer(DATABASE_URL).catch(err=> console.error(err));
}

module.exports={app,runServer,closeServer};