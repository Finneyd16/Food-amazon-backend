const Joi = require("joi");
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        unique: true,
        trim: true

    },
    description:{
        type: String,
        minlength:0,
        maxlength:255,
        default: "",
    }
},{timestamps:true});


const Category = mongoose.model("Category",categorySchema);

function validateCategory(category){
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        description: Joi.string().min(3).max(255).allow(""),
  });
    return schema.validate(category);
}

exports.Category = Category;
exports.validate = validateCategory;