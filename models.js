"use strict";

const mongoose = require("mongoose");
const postSchema = new mongoose.Schema({
   title: {type: String, required:true },
   author:{
        firstName:{type:String, required: true},
        lastName : {type : String, required: true}
   },
   content:{type:String, required: true}
});

postSchema.virtual("fullName").get(function() { return `${this.author.firstName} ${this.author.lastName}`});

postSchema.methods.serialize = function(){
    return {
        id: this.id,
        title : this.title,
        author: this.author,
        content: this.content
    };
};

const Post = mongoose.model("Posts", postSchema);
module.exports= {Post};
