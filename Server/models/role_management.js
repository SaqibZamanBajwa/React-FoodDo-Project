const mongoose = require("mongoose");

const role_management = mongoose.Schema({
    role_uuid: {type: String},
    role_name: {type: String},
    restrictions: [],
    outlet_uuid: {type: String}
});

module.exports = mongoose.model("role_management", role_management);