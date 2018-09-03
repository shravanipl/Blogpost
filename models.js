"use strict";

const mongoose = require("mongoose");
const postSchema = mongoose.schema({
   title: {type: String, required:true },
   author:{
        firstName:{type:String, required: true},
        lastName : {type : String, required: true}
   },
   content:{type:String, required: true}
});

postSchema.virtual("author").get(function() {JSON.stringify(this.author)});

postSchema.methods.serialize = function(){
    return {
        id: this.id,
        title : this.title,
        author: this.author,
        content: this.content
    };
};

const Post = mongoose.model("Post", postSchema);
module.exports= {Post};
