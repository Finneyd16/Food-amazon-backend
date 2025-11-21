const express = require('express');
const app = express();
const mongoose = require('mongoose');
const categories = require('./routes/categories');
const products = require('./routes/products');




mongoose.connect("mongodb://localhost/fooddatabase")
.then(() => console.log("Connected to fooddatabase..."))
.catch(err => console.log(err,"connection failed"));

app.use(express.json());
app.use('/api/fooddocuments/categories', categories);
app.use('/api/fooddocuments/products', products);





const port = process.env.port || 3000;
app.listen(port,console.log(`listening on port ${port}...`));