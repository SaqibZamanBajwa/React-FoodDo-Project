const mongoose = require("mongoose");

const Seats = mongoose.Schema({
    last_updated_at:{type: String},
    seat_uuid:{type: String},
    seat_name:{type: String},
    outlet_uuid:{type:String},
    section_uuid:{type: String},
    seat_sort_order:{type: String},
    seat_status:{type: String},
    menu_details:[{
        menu_uuid:{type: String},
        brand_uuid:{type: String},
        }]
})

module.exports = mongoose.model("seat", Seats)