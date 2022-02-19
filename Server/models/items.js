const mongoose = require("mongoose");


const Item = mongoose.Schema({
        brand_uuid:{type: String},
        category_uuid:{type: String},
        item_mode:{type: String},
        item_name:{type: String},
        item_uuid:{type: String},
        last_updated_at:{type: Date},
        outlet_wise_item_details:[{
            outlet_uuid:{type: String},
            inventory_details:{
                is_saleable:{type: String},
                sales_unit:{type: String},
                primary_unit_name:{type: String},
                inventory_reduction_at:{type: String},
                ingredients:[{
                    item_uuid:{type: String},
                    qty:{type: String},
                    unit:{type: String},
                }],
                units:[{
                    unit_name:{type: String},
                    unit_numerator:{type: String},
                    unit_denominator:{type: String},
                    unit_status:{type: String},
                }],
            },
            warehouse_inventory:[{
                warehouse_uuid:{type: String},
                inventory:{type: String},
        }],
            other_details:{
                availability_last_updated_at: {type: Date},
                item_availability:{type: String},
                item_code:{type: String},
                item_kot_name:{type: String},
                item_gst:{type: String},
                item_vat:{type: String},
                item_cess:{type: String},
                item_status:{type: String},
                item_excluded_from_discount:{type: String},
                item_excluded_from_charge:{type: String},
                item_parcel_type:{type: String},
            }
    }]
})





module.exports = mongoose.model("item", Item);