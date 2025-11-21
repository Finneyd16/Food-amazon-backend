const {Category, validate} = require('../models/category')
const express = require('express')
const router = express.Router();


router.get('/get-all-categories', async (req, res) => {
    const categories = await Category.find().sort('name');
    res.send(categories);
});


router.post('/create-category', async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let category = new Category({
        name: req.body.name,
        description: req.body.description
    });

    category = await category.save();
    res.send(category);
});


router.get('/get-single-category/:id', async(req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).send('Category with the given ID was not found.');

    res.send(category);
});


router.put('update-category/:id', async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const category = await Category.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        description: req.body.description
    }, {new: true});

    if (!category) return res.status(404).send('Category with the given ID was not found.');

     res.json({
       status: "success",
       message: "category created successfully",
     });
});


router.delete('/delete-category/:id', async (req, res) => {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).send('Category with the given ID was not found.');

     res.json({
    status: "success",
    message: "category deleted successfully",
  });
});

module.exports = router;