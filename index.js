const express = require('express');
const app = express();
const mongoose = require('mongoose');
const categories = require('./routes/categories');
const products = require('./routes/products');
const customers = require('./routes/customers');
const users = require('./routes/users');
const auth = require('./routes/auth');
const config = require('config');
const orders = require('./routes/orders');
const coupons = require('./routes/coupons');
const carts = require('./routes/carts');



if (!config.get('jwtPrivateKey')){
    console.error("FATAL ERROR: jwtPrivateKey is not defined.");
    process.exit(1);
}




mongoose.connect("mongodb://localhost/fooddatabase")
.then(() => console.log("Connected to fooddatabase..."))
.catch(err => console.log(err,"connection failed"));




app.use(express.json());
app.use('/api/fooddocuments/categories', categories);
app.use('/api/fooddocuments/products', products);
app.use('/api/fooddocuments/customers', customers);
app.use('/api/fooddocuments/users', users);
app.use('/api/fooddocuments/auth', auth);
app.use('/api/fooddocuments/orders', orders);
app.use('/api/fooddocuments/coupons', coupons);
app.use('/api/fooddocuments/carts',carts);







const port = process.env.port || 3001;
app.listen(port, console.log(`listening on port ${port}...`));