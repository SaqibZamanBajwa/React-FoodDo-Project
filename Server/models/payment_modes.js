const mongoose = require("mongoose"); 

const Payment_methods = mongoose.Schema({
    last_updated_at:{type: Date},
    maintain_customer_balance:{type: String},
    outlet_wise_detais:[{
        outlet_uuid:{type: String},
        status:{type: String},
    }],
    payment_mode_name:{type: String},
    payment_mode_uuid:{type: String},
})

module.exports = mongoose.model("payment_methods", Payment_methods);