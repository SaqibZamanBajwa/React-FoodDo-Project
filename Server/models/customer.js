const mongoose = require("mongoose");

const Customer = mongoose.Schema({

    customer_mobile:{type: String},
    outlet_wise_customer_details: [{
        outlet_uuid:{type: String},
        customer_other_details:{
            customer_name:{type: String},
            customer_address1:{type: String},
            customer_email:{type: String},
            customer_dob:{type: String},
            customer_anniversary_date:{type: String},
            customer_visits:{type: String},
            customer_category_uuid:{type: String},
            customer_discount:{type: String},
            customer_payment_details:[{
                paymode_uuid:{type: String},
                customer_balance:{type: String},
                }]
            }
        }]
})
module.exports = mongoose.model("customer", Customer);