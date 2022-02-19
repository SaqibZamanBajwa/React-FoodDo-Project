const mongoose = require("mongoose");

const item_grouping = mongoose.Schema({
    item_group_uuid: {type: String},
    item_group_title: {type: String},
    items: [],
    outlet_uuid: {type: String},
});

module.exports = mongoose.model("item_grouping", item_grouping);
