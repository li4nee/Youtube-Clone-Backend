import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = mongoose.Schema({

videofile:{
    type:String,
    required:true
},
thumbnail:{
    type:String,
    required:true
},
title:{
    type:String,
    required:true
},
description:{
    type:String,
    required:true
},
duration:{
    type:Number, // cloudinary gives the duration
    required:true
},
views:{
    type:Number,
    required:true,
    default:0
},
isPublished:{
    type:Boolean,
    default:true,
    required:true
},
owner:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
}

},{timestamps:true})

export const Video = mongoose.model("Video",videoSchema);