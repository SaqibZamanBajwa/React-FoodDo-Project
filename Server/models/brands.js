const mongoose = require("mongoose");

const Brands = mongoose.Schema({
    brand_name:{type: String},
    brand_uuid:{type: String},
    org_uuid:{type: String},
    category_uuid:[],
    outlet_uuid:[],
});

module.exports = mongoose.model("brands", Brands);