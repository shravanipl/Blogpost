"use strict";

const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema({
  content:{type:'String'}
});

const authorSchema = new mongoose.Schema({
        firstName:{type:'String', required: true},
        lastName : {type : 'String', required: true},
        userName:{type:'String', unique:true}
});
const postSchema = new mongoose.Schema({
   title: {type: 'String', required:true },
   author:{type:mongoose.Schema.Types.ObjectId,ref:'Author'},
   content:{type:'String', required: true},
   comments:[commentSchema]
});

postSchema.virtual("fullName").get(function() { return `${this.author.firstName} ${this.author.lastName}`});

postSchema.pre('find', function(next){
    this.populate('author');
    next();
});

postSchema.pre('findOne',function(next){
    this.populate('author');
    next();
});

postSchema.methods.serialize = function(){
    return {
        id: this._id,
        author: this.fullName,
        content: this.content,
        title: this.title,
        comments: this.comments
    };
};

let Author = mongoose.model("Author",authorSchema);
const Post = mongoose.model("Post", postSchema);

module.exports= {Author,Post};
