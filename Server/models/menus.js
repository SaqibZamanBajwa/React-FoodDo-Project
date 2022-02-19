const mongoose = require("mongoose");

const Menu = mongoose.Schema({
    last_updated_at: {type: Date},
    outlet_uuid:{type: String},
    brand_uuid:{type: String},
    category_and_items:[{
        category_uuid:{type: String},
        menu_category_sort_order:{type: String},
        menu_items:[{
            item_uuid:{type: String},
            menu_item_uuid:{type: Number},
            menu_item_description:{type: String},
            Menu_Item_ParcelCharge:{type: String},
            Menu_Item_ParcelTax:{type: String},
            Menu_Item_Status:{type: String},
            Menu_Item_Price:{type: String},
            Menu_Item_Discount:{type: String},
            Menu_Item_Recommended:{type: String},
            Menu_Item_SortOrder:{type: String},
            Menu_Item_Label:{type: String},
            AddOnSet1:{
                AddOn_Title:{type: String},
                AddOn_Min:{type: String},
                AddOn_Max:{type: String},
                Item1Details:{
                    Item_UUID:{type: String},
                    Price:{type: String},
                },
                Item2Details:{
                    Item_UUID:{type: String},
                    Price:{type: String},
                },
            },
            AddOnSet2:{
                AddOn_Title:{type: String},
                AddOn_Min:{type: String},
                AddOn_Max:{type: String},
                Item1Details:{
                    Item_UUID:{type: String},
                    Price:{type: String},
                },
                Item2Details:{
                    Item_UUID:{type: String},
                    Price:{type: String},
                },
            },
            Multi:[{
                Multi_Title:{type: String},
                Multi1:{
                    Item_MultiName:{type: String},
                    Item_MultiPrice:{type: String},
                },
                Multi2:{
                    Item_MultiName:{type: String},
                    Item_MultiPrice:{type: String},
                },
            }],
        }],
}],
    menu_for:[],
    menu_type:[],
    menu_title:{type: String},
    menu_uuid:{type: String},
})

module.exports = mongoose.model("menu", Menu);
