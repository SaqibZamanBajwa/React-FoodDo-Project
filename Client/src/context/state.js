import React, { useState } from 'react';
import Context from "./context";

const State = (props) => {

    const [finalState, setFinalState] = useState(null);
    const [selectedBrand_Menu, setSelectedBrand_Menu] = useState(null);
    const [itemCharges, setItemCharges] = useState([]);
    const [orderItems, setOrderItems] = useState([]);
    const [selected_seat, setSelected_seat] = useState(null);
    const [selectedItem, setSelectedItem] = useState('')
    const [itemsState, setItemsState] = useState('')
    const [seatsState, setSeatsState] = useState('');
    const [customerInfo, setCustomerInfo] = useState({ name: '', number: '' })

    function cartHandler(selected_item, addons, multi, action, isParcel, seat, instruction) {

        const decimal_length = +sessionStorage.getItem('decimal_length')

        let matchedItems = [];
        itemCharges.forEach(item => {
            if (item.item_name === selected_item.item_name) matchedItems.push(item);
        })

        let matchedItem = matchedItems.find((item, index) => {

            console.log('item number : ', index, item)

            console.log("parcel", item.parcel === selected_item.parcel, item.parcel, selected_item.parcel);

            console.log("addons", JSON.stringify(item.addons) === JSON.stringify(addons), JSON.stringify(item.addons), JSON.stringify(addons));

            console.log("multi", JSON.stringify(item.selected_multi) === JSON.stringify(multi), JSON.stringify(item.selected_multi), JSON.stringify(multi));

            if (item.parcel === selected_item.parcel)
                if (JSON.stringify(item.addons) === JSON.stringify(addons)
                    && JSON.stringify(item.selected_multi) === JSON.stringify(multi))
                    return item
        });

        if (matchedItem) {

            let itemArray = itemCharges;
            let element = matchedItem;

            let elementIndex = itemArray.indexOf(element);
            let nextIndex = elementIndex + 1;

            if (instruction) {

                if (instruction === 'remove-cooking-instruction') {
                    delete matchedItem.instruction
                }
                else
                    matchedItem.instruction = instruction;
            }
            else if (!isParcel) {
                if (action) {
                    if (action === 'reduction' && matchedItem.item_quantity <= 0.5) {
                        let preElementData = itemArray.slice(0, elementIndex)
                        let postElementData = itemArray.slice(nextIndex, itemArray.length + 1)

                        let newArray = [];
                        preElementData.forEach(element => { newArray.push(element) })
                        postElementData.forEach(element => { newArray.push(element) })

                        return setItemCharges(newArray);
                    }
                    if (action === 'increment') {

                        matchedItem.base_price = matchedItem.base_price / matchedItem.item_quantity
                        matchedItem.discount_applied = matchedItem.discount_applied / matchedItem.item_quantity

                        matchedItem.item_quantity = matchedItem.item_quantity + 1;

                        matchedItem.base_price = matchedItem.base_price * matchedItem.item_quantity
                        matchedItem.discount_applied = matchedItem.discount_applied * matchedItem.item_quantity

                        if (matchedItem.parcel === 'Y' && +matchedItem.item_parcel_type === 2) {
                            matchedItem.total_parcel_charges =
                                matchedItem.perItem_parcelAmount * matchedItem.item_quantity;

                            matchedItem.total_amount =
                                (matchedItem.perItem_amount * matchedItem.item_quantity)
                                + matchedItem.total_parcel_charges;
                        }
                        else { matchedItem.total_amount = matchedItem.perItem_amount * matchedItem.item_quantity; }
                    }
                    else if (action === 'reduction') {
                        matchedItem.base_price = matchedItem.base_price / matchedItem.item_quantity
                        matchedItem.discount_applied = matchedItem.discount_applied / matchedItem.item_quantity

                        matchedItem.item_quantity = matchedItem.item_quantity - 1;

                        matchedItem.base_price = matchedItem.base_price * matchedItem.item_quantity
                        matchedItem.discount_applied = matchedItem.discount_applied * matchedItem.item_quantity

                        if (matchedItem.parcel === 'Y' && +matchedItem.item_parcel_type === 2) {
                            matchedItem.total_parcel_charges =
                                matchedItem.perItem_parcelAmount * matchedItem.item_quantity;

                            matchedItem.total_amount =
                                (matchedItem.perItem_amount * matchedItem.item_quantity)
                                + matchedItem.total_parcel_charges;
                        }
                        else { matchedItem.total_amount = matchedItem.perItem_amount * matchedItem.item_quantity; }
                    }
                }
            }
            else if (matchedItem.parcel === 'N') {

                console.log(matchedItem.parcel, 'parcel is N');
                let duplicateItem = itemArray.find(item => {

                    if (item.item_name === selected_item.item_name
                        && JSON.stringify(item.addons) === JSON.stringify(addons)
                        && JSON.stringify(item.selected_multi) === JSON.stringify(multi)
                        && item.parcel === 'Y')
                        return item
                });

                if (duplicateItem) {

                    itemArray = itemArray.filter(item => item !== duplicateItem)
                    matchedItem.parcel = 'Y';
                    matchedItem.item_quantity =
                        matchedItem.item_quantity + duplicateItem.item_quantity;

                    let quantity = matchedItem.item_parcel_type === '2' ?
                        matchedItem.item_quantity : 1;

                    console.log("in parcel - duplicate item", matchedItem.total_amount, duplicateItem.total_amount)

                    matchedItem.total_parcel_charges = duplicateItem.perItem_parcelAmount * quantity;
                    matchedItem.base_price = matchedItem.base_price + duplicateItem.base_price


                    matchedItem.total_amount = (matchedItem.perItem_amount * matchedItem.item_quantity)
                        + matchedItem.total_parcel_charges;

                    elementIndex = itemArray.indexOf(matchedItem);
                    nextIndex = elementIndex + 1;
                }
                else {

                    let parcelCharge = Number(matchedItem.menu_item_parcel_charge || 0);
                    let parcelTax = 1 + Number(matchedItem.menu_item_parcel_tax || 0) / 100;;

                    let quantity = matchedItem.item_parcel_type === '2' ?
                        Number(matchedItem.item_quantity) : 1;

                    let perItem_parcelAmount = parcelCharge * parcelTax;
                    perItem_parcelAmount = +perItem_parcelAmount.toFixed(decimal_length)

                    let parcelAmount = perItem_parcelAmount * quantity;

                    console.log("in parcel - no duplicate item", perItem_parcelAmount, parcelAmount, quantity)

                    matchedItem.parcel = "Y";
                    matchedItem.perItem_parcelAmount = perItem_parcelAmount;
                    matchedItem.total_parcel_charges = parcelAmount;
                    matchedItem.total_amount = matchedItem.total_amount + parcelAmount;

                }
            }
            else if (matchedItem.parcel === 'Y') {

                let duplicateItem = itemArray.find(item => {

                    if (item.item_name === selected_item.item_name
                        && JSON.stringify(item.selected_multi) === JSON.stringify(multi)
                        && JSON.stringify(item.addons) === JSON.stringify(addons)
                        && item.parcel === 'N')
                        return item
                });

                if (duplicateItem) {

                    itemArray = itemArray.filter(item => item !== duplicateItem)
                    matchedItem.parcel = "Y";

                    matchedItem.item_quantity =
                        matchedItem.item_quantity + duplicateItem.item_quantity;

                    matchedItem.total_amount =
                        matchedItem.perItem_amount * matchedItem.item_quantity;

                    elementIndex = itemArray.indexOf(matchedItem);
                    nextIndex = elementIndex + 1;

                    console.log("duplicated item found - parcel N", matchedItem.perItem_amount, matchedItem.item_quantity, matchedItem.total_amount);
                }

                else {
                    matchedItem.parcel = 'N';
                    console.log(matchedItem.total_amount)
                    matchedItem.total_amount = matchedItem.total_amount - matchedItem.total_parcel_charges;
                    console.log("no duplicated item found - parcel N", matchedItem.total_parcel_charges, matchedItem.total_amount);
                }
            }

            let preElementData = itemArray.slice(0, elementIndex)
            let postElementData = itemArray.slice(nextIndex, itemArray.length + 1)

            let newArray = [];
            preElementData.forEach(element => { newArray.push(element) })
            newArray.push(matchedItem);
            postElementData.forEach(element => { newArray.push(element) })

            return setItemCharges(newArray);
        }

        else {

            let addons_price = 0;
            let multi_price = 0;
            let base_price = Number(selected_item.menu_item_price);
            let discount = base_price * Number(selected_item.menu_item_discount) / 100;

            console.log("base price", +selected_item.menu_item_price)

            addons.length > 0 && addons.forEach(addon => addons_price += Number(addon.price));
            console.log("addon price", +addons_price)

            multi.length > 0 && multi.forEach(multi => multi_price += Number(multi.price));

            console.log("multi price", +multi_price)
            let price = base_price - discount + addons_price + multi_price
            console.log("discount -", discount)
            console.log("texable price", price)

            console.log("gst", selected_item.item_gst)
            console.log("gst", price * (Number(selected_item.item_gst) / 100))

            console.log("gst", selected_item.item_vat)
            console.log("vat", price * (Number(selected_item.item_vat) / 100))

            let tax = price * ((Number(selected_item.item_gst) / 100) + (Number(selected_item.item_vat) / 100));
            price = price + +tax.toFixed(decimal_length)

            console.log("total tax", +tax.toFixed(decimal_length))
            console.log("price", price)

            if (seat)
                selected_item.seat = seat;
            selected_item.base_price = base_price + addons_price + multi_price
            selected_item.discount_applied = discount
            selected_item.perItem_amount = price;
            selected_item.total_amount = price;
            selected_item.item_quantity = 1;
            selected_item.parcel = 'N';
            selected_item.addons = addons ? addons : selected_item.addons;
            selected_item.selected_multi = multi ? multi : selected_item.selected_multi;

            setItemCharges(oldState => [...oldState, selected_item]);
        }
    }

    function item_quantity_handler(current_item, quantity) {

        const decimal_length = +sessionStorage.getItem('decimal_length')

        let matchedItem = itemCharges.find(item => {
            if (item.item_name === current_item.item_name)
                if (item.parcel === current_item.parcel)
                    if (JSON.stringify(item.addons) === JSON.stringify(current_item.addons))
                        if (JSON.stringify(item.selected_multi) === JSON.stringify(current_item.selected_multi))
                            return item
        });
        console.log("found matched item", matchedItem);
        if (!matchedItem) return console.log('No matching item found.')

        matchedItem.base_price = matchedItem.base_price / matchedItem.item_quantity
        matchedItem.discount_applied = matchedItem.discount_applied / matchedItem.item_quantity

        matchedItem.item_quantity = quantity;
        console.log('Item quantity', quantity)

        console.log('base price before calculating with quantity', matchedItem.base_price)
        matchedItem.base_price = matchedItem.base_price * quantity
        matchedItem.base_price = +matchedItem.base_price.toFixed(decimal_length)
        console.log('base price after calculating with quantity', matchedItem.base_price)

        matchedItem.discount_applied = matchedItem.discount_applied * quantity
        matchedItem.discount_applied = +matchedItem.discount_applied.toFixed(decimal_length)

        console.log('total_price before calculating with quantity', matchedItem.total_amount)

        if (matchedItem.parcel === 'Y' && +matchedItem.item_parcel_type === 2) {

            console.log('total parcel price before calculating with quantity', matchedItem.total_parcel_charges)
            matchedItem.total_parcel_charges = matchedItem.perItem_parcelAmount * quantity;
            matchedItem.total_parcel_charges = +matchedItem.total_parcel_charges.toFixed(decimal_length);
            console.log('total parcel price after calculating with quantity', matchedItem.total_parcel_charges)

            matchedItem.total_amount = (matchedItem.perItem_amount * quantity) + matchedItem.total_parcel_charges;
        }
        else matchedItem.total_amount = matchedItem.perItem_amount * quantity;

        matchedItem.total_amount = +matchedItem.total_amount.toFixed(decimal_length)
        console.log('total_price after calculating with quantity', matchedItem.total_amount)

        let elementIndex = itemCharges.indexOf(matchedItem);
        let nextIndex = elementIndex + 1;

        let preElementData = itemCharges.slice(0, elementIndex)
        let postElementData = itemCharges.slice(nextIndex, itemCharges.length + 1)

        let newArray = [];
        preElementData.forEach(element => { newArray.push(element) })
        newArray.push(matchedItem);
        postElementData.forEach(element => { newArray.push(element) })

        setItemCharges(newArray);
    }

    function applyChargesDiscounts(obj, order, itemsList) {

        console.log('function params : ', obj, order, itemsList);

        if (obj.amt) {

            order.order_total = obj.type === 'D' ? (+order.order_total) - (+obj.amt)
                : obj.type === 'C' ? (+order.order_total) + (+obj.amt) : order.order_total;
        }

        else if (obj.type === 'C' && obj.percent) {

            var base_price = 0;

            order.order_kot_details.forEach(kot_order => {

                kot_order.kot_items_details.forEach(item => {

                    if (item.order_item_status === '2') return

                    let listItem = itemsList.find(listItem => listItem.item_uuid === item.item_uuid);
                    let outlet_wise_detail = listItem.outlet_wise_item_details.find(o => o.outlet_uuid === localStorage.getItem('outlet_uuid')).other_details;

                    console.log("base_price before adding current item", base_price);
                    console.log('listItem', listItem);
                    if (outlet_wise_detail.item_excluded_from_charge === '0') {
                        base_price = base_price + item.order_item_unit_price;
                    }

                    console.log('item excluded status', +outlet_wise_detail.item_excluded_from_charge);
                    console.log("current item price", item.order_item_unit_price);
                    console.log("base_price after adding current item", base_price);
                    console.log('-----------------------------------------------------')
                })
            })

            console.log('')
            console.log('calculating charges')
            const calculatedCharge = base_price * (+obj.percent / 100)
            console.log("calculated charge", calculatedCharge, "which is : ", +obj.percent + '% of', base_price)

            console.log("order total before adding current charges", +order.order_total + '+' + calculatedCharge);
            order.order_total = (+order.order_total) + calculatedCharge
            console.log("order_total after adding current charges", +order.order_total, calculatedCharge);
        }

        else if (obj.type === 'D' && obj.percent) {

            var base_price = 0;

            order.order_kot_details.forEach(kot_order => {

                kot_order.kot_items_details.forEach(item => {

                    if (item.order_item_status === '2') return

                    let listItem = itemsList.find(listItem => listItem.item_uuid === item.item_uuid);
                    let outlet_wise_detail = listItem.outlet_wise_item_details.find(o => o.outlet_uuid === localStorage.getItem('outlet_uuid')).other_details;

                    console.log("base_price before adding current item", base_price);
                    if (outlet_wise_detail.item_excluded_from_discount === '0') base_price = base_price + item.order_item_unit_price;

                    console.log('item excluded status', outlet_wise_detail.item_excluded_from_discount);
                    console.log("current item price", item.order_item_unit_price);
                    console.log("base_price after adding current item", base_price);
                    console.log('-----------------------------------------------------')
                })
            })

            console.log('')
            console.log('calculating discounts')
            const calculatedDiscount = base_price * (+obj.percent / 100)
            const calculatedDiscountOnGST = (+order.total_tax_gst) * (+obj.percent / 100)
            const calculatedDiscountOnVAT = (+order.total_tax_vat) * (+obj.percent / 100)

            console.log("calculated discount", calculatedDiscount, "which is : ", +obj.percent + '% of', base_price)
            console.log("calculated discount on gst", calculatedDiscountOnGST, "which is : ", +obj.percent + '% of', order.total_tax_gst)
            console.log("calculated discount on vat", calculatedDiscountOnVAT, "which is : ", +obj.percent + '% of', order.total_tax_vat)

            console.log("order total before deducting current discount", +order.order_total, +order.total_tax_gst, +order.total_tax_vat);

            order.order_total = (+order.order_total) - calculatedDiscount
            order.total_tax_gst = (+order.total_tax_gst) - calculatedDiscountOnGST
            order.total_tax_vat = (+order.total_tax_vat) - calculatedDiscountOnVAT

            order.order_total = +order.order_total.toFixed(+sessionStorage.getItem('decimal_length'));
            order.total_tax_gst = +order.total_tax_gst.toFixed(+sessionStorage.getItem('decimal_length'));
            order.total_tax_vat = +order.total_tax_vat.toFixed(+sessionStorage.getItem('decimal_length'));

            console.log("order_total after deducting current discount", +order.order_total, +order.total_tax_gst, +order.total_tax_vat);
        }

        return order;
    }

    function evaluate({ details, selected_seat, Navigate, order_type }) {

        console.log(details, selected_seat);
        setItemCharges([])
        setSelected_seat('')
        selected_seat ? sessionStorage.setItem('seat', selected_seat.seat_uuid)
            : sessionStorage.setItem('seat', null)

        let db = null;
        let objectStore = null;
        let DBOpenReq = indexedDB.open('FoodDo', 1);

        DBOpenReq.addEventListener('error', (err) => { console.warn(err) });
        DBOpenReq.addEventListener('success', (ev) => {

            db = ev.target.result
            if (order_type && !details) {
                console.log('received order type', order_type)

                let tx = db.transaction('menu', 'readonly');
                let store = tx.objectStore('menu');

                let getMenu = store.getAll();
                getMenu.onsuccess = (ev) => {

                    let selectedMenu;
                    if (order_type === 'takeaway')
                        selectedMenu = ev.target.result.find(json =>
                            json.menu_type.includes('1')
                            && json.menu_for.includes('1')
                        );

                    else if (order_type === 'delivery')
                        selectedMenu = ev.target.result.find(json =>
                            json.menu_type.includes('2')
                            && json.menu_for.includes('1')
                        );
                    details = [{ menu_uuid: selectedMenu.menu_uuid, brand_uuid: selectedMenu.brand_uuid }]
                    console.log('setted details', details);
                }
            }

            let tx = db.transaction('brand', 'readonly');
            let store = tx.objectStore('brand');

            let object = {};
            let getBrand = store.getAll();
            getBrand.onsuccess = (ev) => {

                const brands = [];
                details.forEach(detailObj => {

                    const brandObj = ev.target.result.find(json => json.brand_uuid === detailObj.brand_uuid)
                    if (brandObj) {
                        let brand_menu = {};
                        brand_menu.brand_uuid = brandObj.brand_uuid;
                        brand_menu.brand_name = brandObj.brand_name;
                        brand_menu.menu_uuid = detailObj.menu_uuid;
                        brands.push(brand_menu);
                    }
                })
                object.brands = brands
            }

            tx = db.transaction('menu', 'readonly');
            store = tx.objectStore('menu');

            let getMenu = store.getAll();
            getMenu.onsuccess = (ev) => {

                const menues = [];
                details.forEach(detailObj => {

                    let result = ev.target.result;
                    result.forEach(json => {

                        json.category_and_items.sort((a, b) => a.menu_category_sort_order - b.menu_category_sort_order)

                        json.category_and_items.forEach(menuCategory => {
                            menuCategory.menu_items.sort(
                                (a, b) => a.menu_item_sort_order - b.menu_item_sort_order
                            )
                        });
                    })

                    let menuObj;
                    if (!order_type)
                        menuObj = result.find(json => json.menu_uuid === detailObj.menu_uuid);

                    else if (order_type === 'takeaway')
                        menuObj = result.find(json =>
                            json.menu_uuid === detailObj.menu_uuid
                            && json.menu_type.includes('1')
                            && json.menu_for.includes('1')
                        );

                    else if (order_type === 'delivery')
                        menuObj = result.find(json =>
                            json.menu_uuid === detailObj.menu_uuid
                            && json.menu_type.includes('2')
                            && json.menu_for.includes('1')
                        );

                    if (menuObj) {

                        tx = db.transaction('category', 'readonly');
                        store = tx.objectStore('category');

                        let getCategory = store.getAll();
                        getCategory.onsuccess = (ev) => {

                            menuObj.category_and_items.forEach(subMenuObj => {

                                const categoryObj = ev.target.result.find(json => {
                                    if (json.category_uuid === subMenuObj.category_uuid) return json
                                });
                                subMenuObj.category_name = categoryObj.category_name;

                                subMenuObj.menu_items.forEach(menuItem => {

                                    tx = db.transaction('item', 'readonly');
                                    store = tx.objectStore('item');

                                    let getItemsReq = store.getAll();
                                    getItemsReq.onsuccess = (ev) => {

                                        let ItemObj = ev.target.result.find(json => json.item_uuid === menuItem.item_uuid);

                                        console.log(ItemObj);
                                        menuItem.item_name = ItemObj.item_name;
                                        menuItem.item_mode = ItemObj.item_mode;

                                        let ItemDetailsObj = ItemObj.outlet_wise_item_details.find(obj => obj.outlet_uuid === menuObj.outlet_uuid);

                                        menuItem.addons = [];
                                        menuItem.selected_multi = [];
                                        menuItem.parcel = 'N';
                                        menuItem.item_code = ItemDetailsObj.other_details.item_code
                                        menuItem.item_status = ItemDetailsObj.other_details.item_status
                                        menuItem.item_gst = ItemDetailsObj.other_details.item_gst
                                        menuItem.item_vat = ItemDetailsObj.other_details.item_vat
                                        menuItem.item_parcel_type = ItemDetailsObj.other_details.item_parcel_type
                                        menuItem.item_availability = ItemDetailsObj.other_details.item_availability
                                        menuItem.item_excluded_from_charge = ItemDetailsObj.other_details.item_excluded_from_charge
                                        menuItem.item_excluded_from_discount = ItemDetailsObj.other_details.item_excluded_from_discount
                                    }
                                })
                            })
                            menues.push(menuObj)
                        }
                    }
                })
                object.menues = menues;
            }
            setTimeout(() => {
                setFinalState(object);
                sessionStorage.setItem('finalState', JSON.stringify(object))
                Navigate('/page2')
            }, 100);
        });
    };

    return (
        <Context.Provider value={{
            finalState, setFinalState,
            selectedBrand_Menu, setSelectedBrand_Menu,
            itemCharges, setItemCharges,
            orderItems, setOrderItems,
            selected_seat, setSelected_seat,
            cartHandler,
            itemsState, setItemsState,
            selectedItem, setSelectedItem,
            customerInfo, setCustomerInfo,
            item_quantity_handler,
            seatsState, setSeatsState,
            applyChargesDiscounts, evaluate
        }}>
            {props.children}
        </Context.Provider>
    )
}

export default State