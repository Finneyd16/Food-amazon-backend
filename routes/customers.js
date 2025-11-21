const {Customer, validate} = require('../models/customer');
const express = require('express');
const { route } = require('./categories');
const router = express.Router();


router.get('/get-all-customers', async (req, res) => {
    const customers = await Customer.find().sort('name');
    res.send(customers);
});


router.post('/create-customer', async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let customer = new Customer({
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        country: req.body.country,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
        phone: req.body.phone,
        forOrderNote: req.body.forOrderNote,
    });

    customer = await customer.save();
    res.send(customer);
});

router.get('/get-single-customer/:id', async(req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send('Customer with the given ID was not found.');
    res.send(customer);
});

router.put('/update-customer/:id', async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const customer = await Customer.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        country: req.body.country,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
        phone: req.body.phone,
        forOrderNote: req.body.forOrderNote,
    }, {new: true});
    if (!customer) return res.status(404).send('Customer with the given ID was not found.');
     res.json({
       status: "success",
       message: "customer updated successfully",
     });
});

router.delete('/delete-customer/:id', async (req, res) => {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).send('Customer with the given ID was not found.');
        res.json({
    status: "success",
    message: "customer deleted successfully",
  });
}); 


router.get('/customers-by-country/:country', async (req, res) => {
    const country = req.params.country;
    const customers = await Customer.find({ country: country }).sort('name');
    res.send(customers);
});








module.exports = router