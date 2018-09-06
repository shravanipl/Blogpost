'use strict';
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.Promise = global.Promise;

const { PORT,DATABASE_URL} = require("./config");

const { Author,Post} = require("./models");

const app = express();
let server;
app.use(bodyParser.json());

app.get("/posts", (req, res) => {
    Post.find()
        .limit(10)
        .then(post => {
            res.json({
                post: post.map(post => post.serialize())
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: "Internal Server Error"
            });
        });
});

app.get("/posts/:id", (req, res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: "Internal server error"
            });
        });
});

app.post("/posts", (req, res) => {
    const requiredFields = ["title", "author", "content"];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing ${field} in req body`;
            res.status(400).send(message);
        }
    }
    Post.create({
            title: req.body.title,
            author: req.body.author,
            content: req.body.content
        })
        .then(post => res.status(200).json(post.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                message: "Internal server error"
            });
        });
});

app.put("/posts/:id", (req, res) => {
    if (!(req.params.id === req.body.id)) {
        const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
        console.error(message);
        res.status(400).send(message);
    }

    Post.findByIdAndUpdate(req.params.id, {
            $set: toUpdate
        })
        .then(post => res.status(204).end())
        .catch(err => res.status(500).json({
            message: "Internal server error"
        }));
});

app.delete("/posts/:id", (req, res) => {
    Post.findByIdAndDelete(req.params.id)
        .then(post => res.status(204).end())
        .catch(err => res.status(500).json({
            message: "Internal server error"
        }));
});

app.get('/authors', (req, res) => {
            Author.find()
                .then(authors => {
                    res.json(authors.map(author => {
                        return {
                            id: author._id,
                            name: `${author.firstName} ${author.lastName}`,
                            userName: author.userName
                        };

                    }));
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        message: "Oops something went wrong"
                    })
                });
            });

            app.post('/authors', (req, res) => {
                let requiredFields = ['firstName', 'lastName', 'userName'];
                for (let i = 0; i < requiredFields.length; i++) {
                    if (!(requiredFields in req.body)) {
                        const message = `Missing ${requiredFields[i]} in req body`;
                        res.status(500).send(message);
                    }

                };
                Author.findOne({
                        userName: req.body.userName
                    })
                    .then(user => {
                        if (user) {
                            const message = `${user} already exist.Try other names`;
                            console.error(message);
                            res.status(400).send(message);
                        } else {
                            Author.create({
                                    userName: req.body.userName,
                                    firstName: req.body.firstName,
                                    lastName: req.body.lastName
                                })
                                .then(author => res.status(201).json({
                                    _id: author.id,
                                    name: `${author.firstName} ${author.lastName}`,
                                    userName: author.userName

                                }))
                                .catch(err => {
                                    console.error(err);
                                    res.status(500).send(err);
                                });

                        }
                    })
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({
                            error: 'something went horribly awry'
                        });
                    });

            });

            app.put('/authors/:id', (req, res) => {
                if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
                    res.status(400).send("Request path Id and request body id must match");
                }
                const updated = {};
                const updateableFields = ['firstName', 'lastName', 'userName'];
                updateableFields.forEach(field => {
                    if (field in req.body) {
                       updated[field] = req.body[field];                  
                    }
                });
               Author.findOne({userName: req.body.userName})
               .then(author =>{
                   if(author){
                    const message = `Username already taken`;
                    console.error(message);
                    return res.status(400).send(message);
                  }
                  else {
                      Author.findByIdAndUpdate( req.params.id, {$set: updated}, {new: true})
                      .then(updatedAuthor =>{
                          res.status.json({
                              _id: updatedAuthor.id,
                              name: `${updatedAuthor.firstName} ${updatedAuthor.lastName}`,
                              userName: updatedAuthor.userName
                          });
                      })
                      .catch(err=>{
                          console.error(err);
                          res.status(500).send(message);
                      })
                   }
               })

            });

            app.delete('/authors/:id', (req,res)=>{
              Post.remove({author:req.params.id})
              .then(()=>{
                  console.log(`Deleted blog posts owned by and author with id ${req.body.id}`);
                  res.status(204).json({message:"Success"});
              })
              .catch(err =>{
                console.error(err);
                res.status(500).json({ error: 'something went terribly wrong' });
              });
              });

            app.use("*", (req, res) => {
                res.status(400).json({
                    message: "Not found"
                });
            });

            function runServer(databaseUrl, port = PORT) {
                return new Promise((resolve, reject) => {
                    mongoose.connect(
                        databaseUrl,
                        err => {
                            if (err) {
                                return reject(err);
                            }

                            server = app
                                .listen(port, () => {
                                    console.log(`Your app is listening on port ${port}`);
                                    resolve();
                                })
                                .on("error", err => {
                                    mongoose.disconnect();
                                    reject(err);
                                });
                        }
                    );
                });
            }

            function closeServer() {

                return mongoose.disconnect().then(() => {
                    return new Promise((resolve, reject) => {
                        console.log("closing server");
                        server.close(err => {
                            if (err) {
                                return reject(err);
                            }
                            resolve();
                        })
                    })
                });
            }

            if (require.main === module) {
                runServer(DATABASE_URL).catch(err => console.error(err));
            }

            module.exports = {
                app,
                runServer,
                closeServer
            };