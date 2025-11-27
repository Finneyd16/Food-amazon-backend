const { Customer, validate } = require("../models/customer");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.get("/get-all-customers", async (req, res) => {
  const customers = await Customer.find().sort("-createdAt");
  res.send(customers);
});

router.post("/create-customer", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let customer = await Customer.findOne({ email: req.body.email });
  if (customer)
    return res.status(400).send("Customer with this email already exists.");

  customer = new Customer({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    country: req.body.country,
    city: req.body.city,
    state: req.body.state,
    zipCode: req.body.zipCode,
    profilePicture: req.body.profilePicture,
    status: req.body.status,
    forOrderNote: req.body.forOrderNote,
  });

  customer = await customer.save();
  res.send(customer);
});


router.get("/get-single-customer/:id", async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer)
    return res.status(404).send("Customer with the given ID was not found.");

  res.send(customer);
});


router.put("/update-customer/:id", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let customer = await Customer.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      country: req.body.country,
      city: req.body.city,
      state: req.body.state,
      zipCode: req.body.zipCode,
      profilePicture: req.body.profilePicture,
      status: req.body.status,
      forOrderNote: req.body.forOrderNote,
    },
    { new: true }
  );

  if (!customer)
    return res.status(404).send("Customer with the given ID was not found.");

  res.json({
    status: "success",
    message: "Customer updated successfully",
  });
});

router.delete("/delete-customer/:id", [auth, admin], async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer)
    return res.status(404).send("Customer with the given ID was not found.");

  res.json({
    status: "success",
    message: "Customer deleted successfully",
  });
});

router.get("/get-customer-by-email/:email", async (req, res) => {
  const customer = await Customer.findOne({ email: req.params.email });
  if (!customer)
    return res.status(404).send("Customer with the given email was not found.");

  res.send(customer);
});

router.get('/get-customers-by-status/:status', async (req, res) => {
    const customer = await customer.find({ status: req.params.status });
    if (!customer)
      return res.status(404).send('No customers found with the given status.');
    res.send(customer);
  });




  

module.exports = router;
