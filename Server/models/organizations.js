const mongoose = require("mongoose");

const Organization = mongoose.Schema({
    brand_uuid:[],
    org_uuid:{type: String},
    outlet_uuid:[],
})

module.exports = mongoose.model("organization", Organization);
