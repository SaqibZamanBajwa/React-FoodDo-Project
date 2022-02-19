const express = require("express");
const checkauth = require("../middleware/auth");
const multer = require("multer");
const upload = multer({ dest: "uploads" });
const { v4: uuidv4 } = require("uuid");
const reader = require("xlsx");
var fs = require('fs');

const Menu = require("../models/menus");

const Item = require("../models/items");
const Category = require("../models/item_categories");
const Order = require("../models/orders");

const router = express.Router();

//get item
router.post("/getItem", checkauth, async (req, res) => {
  const body = req.body;
  const count = body.length;
  var i = 0;
  const temp = [];
  await body.map((value) => {
    Item.findOne({ item_uuid: value.item_uuid }, (err, result) => {
      if (err) {
        temp.push("get error of finding" + value.item_uuid);
      } else {
        if (result == null) {
          temp.push({
            error: "item_uuid " + value.item_uuid + " is not define",
          });
        } else {
          var new_outlet = result["outlet_wise_item_details"].filter(
            (ele) => ele.outlet_uuid === value.outlet_uuid
          );
          console.log(new_outlet);
          result.outlet_wise_item_details = new_outlet;
          temp.push(result);
        }
      }
      i++;
      if (i === count) {
        res.status(200).json({ message_length: temp.length, result: temp });
      }
    });
  });
});

//post item
router.post("/postItem", checkauth, (req, res) => {
  try {
    body = req.body;
    body.map((value) => {
      Item(value)
        .save()
        .then((result) => {
          res.status(200).json({ message: "added" });
        })
        .catch((err) => {
          res.status(err).json({ messae: err });
        });
    });
  } catch {
    res.status(500).json({ messaage: "internal server error", error: err });
  }
});

const bulkItemValidate = (data) => {
  if (
    !"Category Name" in data ||
    (data["Category Name"] && data["Category Name"].length > 42)
  ) {
    return `item cell 'B${data.Id}' Column 'Category Name' Is Blank Not Allowed / IS MORE THAN 42 CHARACTERS.`;
  }

  if (!("Item" in data) || (data.Item && data.Item.length > 42)) {
    return `item cell 'C${data.Id}' Column 'Item' Is Blank Not Allowed / IS MORE THAN 42 CHARACTERS.`;
  }
  if (data["Item Code"] && data["Item Code"].length > 42) {
    return `item cell 'E${data.Id}' Column 'Item Code' IS MORE THAN 42 CHARACTERS.`;
  }
  if (
    "ItemMode" in data &&
    data["ItemMode"] != 0 &&
    data["ItemMode"] != 1 &&
    data["ItemMode"] != 2
  ) {
    return `item cell 'F${data.Id}' Column 'ItemMode' IS Only Values allowed are 0 , 1 and 2.`;
  }
  if (
    !(typeof data["GST%"] != "string") ||
    data["GST%"] < 0 ||
    data["GST%"] > 100
  ) {
    return `item cell 'G${data.Id}' Column 'GST%' IS Not More than 100% Allowed.`;
  }

  if (
    !(typeof data["VAT%"] != "string") ||
    data["VAT%"] < 0 ||
    data["VAT%"] > 100
  ) {
    return `item cell 'H${data.Id}' Column 'VAT%' IS Not More than 100% Allowed.`;
  }

  if (
    "Parcel Type" in data &&
    !(data["Parcel Type"] == "0" || data["Parcel Type"] == "1")
  ) {
    return `item cell 'I${data.Id}' Column 'Parcel Type' IS Only Values allowed are 1 or 2.`;
  }

  if (
    "Exclude from Discount" in data &&
    !(
      data["Exclude from Discount"] == "0" ||
      data["Exclude from Discount"] == "1"
    )
  ) {
    return `item cell 'J${data.Id}' Column 'Exclude from Discount' IS Only Values allowed are 0 or 1.`;
  }

  if (
    "Exclude from Charge" in data &&
    !(data["Exclude from Charge"] == "0" || data["Exclude from Charge"] == "1")
  ) {
    return `item cell 'K${data.Id}' Column 'Exclude from Charge' IS Only Values allowed are 0 or 1.`;
  }

  if ("Status" in data && !(data["Status"] == "0" || data["Status"] == "1")) {
    return `item cell 'L${data.Id}' Column 'Status' IS Only Values allowed are 0 or 1.`;
  }

  return true;
};

//post item
router.post(
  "/postBulkItem",
  checkauth,
  upload.single("files"),
  async (req, res) => {
    try {
      const outlet_uuid = req.body.outlet_uuid;
      const file = reader.readFile(req.file.path);
      let data = [];
      const sheets = file.SheetNames;

      for (let i = 0; i < sheets.length; i++) {
        const temp = reader.utils.sheet_to_json(
          file.Sheets[file.SheetNames[i]]
        );
        temp.forEach((res) => {
          data.push(res);
        });
      }

      let newItems = [],
        error = [];
      let updateCount = 0,
        newCategoryCount = 0;
      let category_uuid = "";
      for (let i = 0; i < data.length; i++) {
        const dataValidate = bulkItemValidate(data[i]);
        if (dataValidate == true) {
          const categoryResult = await Category.findOne({
            category_name: data[i]["Category Name"],
          });

          if (!categoryResult) {
            if (!("Brand UUID" in data[i]) || data[i]["Brand UUID"] == "") {
              error.push(
                `item cell 'D${data[i].Id}' Column 'Brand UUID' IS Brand UUID required for New items.`
              );
            } else {
              const newCategory = await Category({
                brand_uuid: data[i]["Brand UUID"],
                category_name: data[i]["Category Name"],
                category_uuid: uuidv4(),
                last_updated_at: new Date(),
                outlet_uuid: [outlet_uuid],
              }).save();
              newCategoryCount++;

              newItems.push({
                brand_uuid: data[i].brand_uuid,
                category_uuid: newCategory._id,
                item_mode: data[i].ItemMode,
                item_name: data[i].Item,
                item_uuid: uuidv4(),
                outlet_wise_item_details: [
                  {
                    outlet_uuid: outlet_uuid,
                    other_details: {
                      item_availability: 1,
                      item_code: data[i]["Item Code"],
                      item_gst: data[i]["GST%"],
                      item_vat: data[i]["VAT%"],
                      item_discount: data[i]["Item Discount"],
                      item_status: data[i].Status,
                      item_excluded_from_discount:
                        data[i]["Exclude from Discount"],
                      item_excluded_from_charge: data[i]["Exclude from Charge"],
                      item_parcel_type: data[i]["Parcel Type"],
                    },
                  },
                ],
              });
            }
          } else {
            category_uuid = categoryResult.category_uuid;
            const categoryFindResult = await categoryResult.outlet_uuid.find(
              (o) => o === outlet_uuid
            );
            if (!categoryFindResult) {
              await Category.updateOne(
                { _id: categoryResult._id },
                { $push: { outlet_uuid: outlet_uuid } }
              );
            }

            const itemResult = await Item.findOne({
              category_uuid: category_uuid,
              item_name: data[i].Item,
            });

            let result = {
              brand_uuid: data[i].brand_uuid,
              category_uuid: category_uuid,
              item_mode: data[i].ItemMode && "" + data[i].ItemMode,
              item_name: data[i].Item && "" + data[i].Item,
              outlet_wise_item_details: [
                {
                  outlet_uuid: outlet_uuid,
                  other_details: {
                    item_availability: "" + 1,
                    item_code:
                      data[i]["Item Code"] && "" + data[i]["Item Code"],
                    item_gst: data[i]["GST%"] && "" + data[i]["GST%"],
                    item_vat: data[i]["VAT%"] && "" + data[i]["VAT%"],
                    item_discount:
                      data[i]["Item Discount"] && "" + data[i]["Item Discount"],
                    item_status: data[i].Status && "" + data[i].Status,
                    item_excluded_from_discount:
                      data[i]["Exclude from Discount"] &&
                      "" + data[i]["Exclude from Discount"],
                    item_excluded_from_charge:
                      data[i]["Exclude from Charge"] &&
                      "" + data[i]["Exclude from Charge"],
                    item_parcel_type:
                      data[i]["Parcel Type"] && "" + data[i]["Parcel Type"],
                  },
                },
              ],
            };

            if (!itemResult) {
              result.item_uuid = uuidv4();
              newItems.push(result);
            } else {
              result.item_uuid = itemResult.item_uuid;
              if (JSON.stringify(itemResult) != JSON.stringify(result)) {
                const merge = await Object.assign(itemResult, result);

                const updateData = await Item.updateOne(
                  {
                    item_uuid: merge.item_uuid,
                  },
                  {
                    $set: {
                      category_uuid: merge.category_uuid,
                      outlet_wise_item_details: merge.outlet_wise_item_details,
                      item_mode: merge.item_mode,
                    },
                  }
                );

                let menu = req.body.menu;

                if (menu) {
                  menu = menu.split(",");
                  for (let i = 0; i < menu.length; i++) {
                    const menuResult = await Menu.findOne({
                      menu_uuid: menu[i],
                    });
                    
                    const categoryItem = JSON.parse(JSON.stringify(menuResult.category_and_items));
                    for (let j = 0; j < categoryItem.length; j++) {
                      if (categoryItem[j].category_uuid == category_uuid) {
                        const menuItem = JSON.parse(JSON.stringify(categoryItem[j].menu_items));
                        for (let k = 0; k < menuItem.length; k++) {
                          if (menuItem[k].item_uuid == merge.item_uuid) {
                            categoryItem[i].menu_items[k]['menu_item_parcel_charge'] = data[i]["Parcel Charge"] || menuItem[k]['menu_item_parcel_charge']
                            categoryItem[i].menu_items[k]['menu_item_price'] = data[i]["Price"] || menuItem[k]['menu_item_price']
                            categoryItem[i].menu_items[k]['menu_item_description'] = data[i].description || menuItem[k]['menu_item_description']
                          }
                        }
                      }
                    }

                    await Menu.updateOne({
                      menu_uuid: menu[i],
                    }, {
                      $set: {
                        category_and_items: categoryItem
                      }
                    });
                  }
                }

                if (updateData) {
                  updateCount++;
                }
              }
            }
          }
        } else {
          error.push(dataValidate);
        }
      }

      if (newItems) {
        Item.insertMany(newItems);
      }
      fs.unlinkSync(req.file.path);

      res.status(200).json({
        insertCategorys: newCategoryCount,
        insertItems: newItems.length,
        updateItems: updateCount,
        error: error,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ messaage: "internal server error", error: err });
    }
  }
);

//put item
router.put("/putItem", checkauth, (req, res) => {
  const body = req.body;
  var temp = [];
  const count = body.length;
  var i = 0;
  body.map((value) => {
    var outlet = value.outlet_wise_item_details;
    delete value["outlet_wise_item_details"];
    Item.updateOne(
      { item_uuid: value.item_uuid },
      { $set: { outlet_wise_item_details: outlet } },
      (err, result) => {
        i++;
        if (result.matchedCount == 0) {
          temp.push(value.item_uuid + " item_uuid match is not founded");
        } else {
          Item.updateOne(
            { item_uuid: value.item_uuid },
            value,
            (err, result) => {
              if (result.acknowledged == true) {
                if (result.matchedCount > 0) {
                  temp.push(value.outlet_uuid + " is updated");
                } else {
                  temp.push(value.outlet_uuid + " match is not founded");
                }
              } else {
                temp.push(value.outlet_uuid + " have some error");
              }
            }
          );
        }
        console.log(result);
        if (i === count) {
          res.status(200).json({ message_length: temp.length, result: temp });
        }
      }
    );
  });
});

router.delete("/deleteItem", checkauth, (req, res) => {
  const body = req.body;
  body.map((value) => {
    Item.findOne(
      { outlet_wise_item_details: [{ outlet_uuid: "1" }] },
      (err, result) => {
        if (err) {
          res.status(301).json({ message: "somethig went wrong" });
        } else {
          res.status(200).json({ message: result });
        }
      }
    );
  });
});

router.get("/list", (req, res) => {
  const body = req.body;
  Item.find({}, function (err, data) {
    if (err) throw err;
    console.log(data);
    res.json(data);
  });
});

module.exports = router;
