const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyparser = require("body-parser");

const seat = require("./routers/seat")
const brands = require("./routers/brand");
const orders = require('./routers/order')
const category = require("./routers/category")
const payment = require("./routers/payment")
const user = require("./routers/user")
const customer = require("./routers/customer")
const item = require("./routers/item")
const outlet = require("./routers/outlet")
const organization = require("./routers/organization")
const menu = require("./routers/menu")
const home = require("./routers/home.js");
app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
const verifyUser = require("./middleware/verifyUser.js");
// mongoose.connect('mongodb://localhost:27017/freelancer' , {
//     useUnifiedTopology: true,
// })

require("./db/conn")


// mongoose.connect('mongodb+srv://priyalramani786:orangecat2@cluster2.z9aqe.mongodb.net/foodDo_DB?retryWrites=true&w=majority' , {
//     useUnifiedTopology: true,
// })
app.use("/home",home);
app.use("/brand", brands)
app.use("/order", orders)
app.use("/category", category)
app.use("/payment", payment)
app.use("/user", user)
app.use("/customer", customer)
app.use("/item", item)
app.use("/outlet", outlet)
app.use("/organization", organization)
app.use("/menu", menu)
app.use("/seat",seat)

app.use((req , res, next) => {
    const error = new Error('Not Founded');
    res.status = 404;
    next(error);
});

app.use((error , req , res , next) => {
    res.json({
        error: error.message
    })
});


module.exports = app;





