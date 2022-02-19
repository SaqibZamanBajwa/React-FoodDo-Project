const mongoose = require("mongoose");

const Item_categories = mongoose.Schema({
    brand_uuid:{type: String},
    category_name:{type: String},
    category_uuid:{type: String},
    last_updated_at:{type: Date},
    outlet_uuid:[],
    
});

module.exports = mongoose.model("item_categories", Item_categories);