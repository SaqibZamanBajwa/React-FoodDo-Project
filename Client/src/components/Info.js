import React, { useContext, useState, useEffect, useRef } from 'react'
// import QuantityEditable from './QuantityEditable'
import Context from '../context/context'
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom'
import { ShoppingBagIcon, PencilAltIcon, ChevronUpIcon } from '@heroicons/react/solid'
import SubHeader from './SubHeader';
import FBRunningOrder from './running_order_firebase'

const Info = ({ quatityEditable, isPaymentOptionOpen, setPaymentOptionOpen }) => {

  const [isKOTPopupActive, setIsKOTPopupActive] = useState(false)
  const [isInvoiceActive, setIsInvoiceActive] = useState(false)
  const [isChefPopupActive, setIsChefPopupActive] = useState(false)
  const [isDirectAddPopupActive, setIsDirectAddPopupActive] = useState(false)

  const [isChargePopupActive, setIsChargePopupActive] = useState(false)
  const [isDiscountPopupActive, setIsDiscountPopupActive] = useState(false)

  const Navigate = useNavigate();
  const context = useContext(Context);

  // Import content from context.
  const {
    itemCharges, setItemCharges, cartHandler,
    selected_seat, setSelected_seat, setSelectedItem,
    customerInfo, setCustomerInfo, applyChargesDiscounts
  } = context;

  const [seats_onOrder, setSeats_onOrder] = useState([])
  const [totalAmount, setTotalAmount] = useState(null)
  const [selectedSeat_order, setSelectedSeat_order] = useState(null)
  const [kot_list, setKot_list] = useState(null);
  const [page2Total, setPage2Total] = useState(0);
  const [domState, setDomState] = useState('');
  const [discounts, setDiscounts] = useState([]);
  const [charges, setCharges] = useState([]);
  const [itemsList, setItemsList] = useState(null)
  const [seatLocation, setSeatLocation] = useState(null);
  const [orderPaymentStatus, setorderPaymentStatus] = useState(null);
  // Find unplaced orders in the local database -> find for the selected seat -> store in the state. 
  useEffect(() => {

    const unplaced_orders = JSON.parse(localStorage.getItem('unplaced_orders'))
    if (unplaced_orders) {
      const unplaced_seat_order =
        unplaced_orders.find(json => json.seat === sessionStorage.getItem('seat'))

      unplaced_seat_order && setItemCharges(unplaced_seat_order.orders)
    }

    const seatsArray = []
    const localSeatsArray = JSON.parse(localStorage.getItem('onorder_seats'));
    localSeatsArray && localSeatsArray.forEach(obj => seatsArray.push(obj.seat_uuid));

    setSeats_onOrder(seatsArray)
  }, [])

  useEffect(() => {
    if (window.location.pathname !== '/page2') return
    console.log(seats_onOrder);
    setSelected_seat(sessionStorage.getItem('seat'))
  }, [seats_onOrder])

  // Set amount --for page 2--
  useEffect(() => {
    let amount = 0;
    itemCharges.forEach(element => {
      amount += Number(element.total_amount);
    })

    amount = amount.toFixed(Number(sessionStorage.getItem('decimal_length')))
    setTotalAmount(Number(amount));

    // Update unplaced orders price.
    if (window.location.pathname !== '/page2') return
    const orders = JSON.parse(localStorage.getItem('onorder_seats')) || [];
    let seat_order = orders.find(order => order.seat_uuid === sessionStorage.getItem('seat'))

    let amountPage2 = Number(seat_order ? seat_order.price : 0) + Number(amount)
    setPage2Total(amountPage2)

    // Store unplaced orders locally each time selected orders state change.
    let unplacedOrders = JSON.parse(localStorage.getItem('unplaced_orders')) || []
    var unplacedOrder;

    if (unplacedOrders.length === 0) {

      unplacedOrders.push({
        seat: sessionStorage.getItem('seat'),
        orders: itemCharges
      })

      localStorage.setItem('unplaced_orders', JSON.stringify(unplacedOrders))
    }
    else {
      unplacedOrder = unplacedOrders
        .find(order => order.seat === sessionStorage.getItem('seat'));

      if (unplacedOrder) {

        var filtered_orders = unplacedOrders
          .filter(order => order.seat !== sessionStorage.getItem('seat'))

        unplacedOrder.orders = itemCharges;
        filtered_orders.push(unplacedOrder)
        localStorage.setItem('unplaced_orders', JSON.stringify(filtered_orders))
      }
      else {
        unplacedOrders.push({ seat: sessionStorage.getItem('seat'), orders: itemCharges })
        localStorage.setItem('unplaced_orders', JSON.stringify(unplacedOrders))
      }
    }

    // Clear order object in local storage when data is removed from state
    let unplaced_orders = JSON.parse(localStorage.getItem('unplaced_orders'))
    if (unplaced_orders) {
      unplaced_orders = unplaced_orders.filter(i => i.orders.length > 0)
      localStorage.setItem('unplaced_orders', JSON.stringify(unplaced_orders))
    }

  }, [itemCharges]);


  // Set amount | contact info | kot_orders - in states --for page 1--
  useEffect(() => {

    if (window.location.pathname !== '/page1') return;
    let seat = JSON.parse(localStorage.getItem('onorder_seats'))
    seat = seat && seat.find(seat => seat.seat_uuid === selected_seat);
    let amount = seat && seat.price || 0;
    setTotalAmount(amount);

    selectedSeat_order ? setCustomerInfo({
      name: selectedSeat_order.customer_name, number: selectedSeat_order.customer_mobile
    }) : setCustomerInfo({ name: '', number: '' })

    let kotList = [];
    selectedSeat_order &&
      selectedSeat_order.order_kot_details.forEach(kotOrder => kotList.push(`${kotOrder.kot}`));
    setKot_list(kotList);

  }, [selectedSeat_order, selected_seat])


  // Set selected seat orders in state from local storage
  useEffect(() => {

    console.log(selected_seat)
    if (selected_seat === 'null') return;

    let DBOpenReq = indexedDB.open('FoodDo', 1);
    DBOpenReq.addEventListener('error', (err) => { console.warn(err) });
    DBOpenReq.addEventListener('success', (ev) => {
      let db = ev.target.result

      let tx = db.transaction('item', 'readonly');
      let store = tx.objectStore('item');
      const allItems = store.getAll();
      allItems.onsuccess = (e) => { setItemsList(e.target.result); }

      tx = db.transaction('running_orders', 'readonly');
      store = tx.objectStore('running_orders');
      const allOrders = store.getAll();

      allOrders.onsuccess = (e) => {

        let order_json = e.target.result;
        order_json = order_json && order_json.find(order => order.seat_uuid === selected_seat);

        if (order_json) {

          setorderPaymentStatus(order_json.payment_status)
          order_json && setCustomerInfo({
            name: order_json.customer_name, number: order_json.customer_mobile
          })
          order_json && setSelectedSeat_order(order_json)
        }
        else {
          setSelectedSeat_order(null)
        }
      }

      tx = db.transaction('seats', 'readonly');
      store = tx.objectStore('seats');

      if (!selected_seat) return
      console.log(selected_seat);

      let getSeatReq = store.get(selected_seat)
      getSeatReq.onsuccess = (seat) => {
        // seat.target.result.section_uuid

        tx = db.transaction('outlet', 'readonly');
        store = tx.objectStore('outlet');

        let getOutlet = store.getAll()
        getOutlet.onsuccess = (outlet) => {
          const selectedSeatSection = outlet.target.result[0].section_details
            .find(section => section.section_uuid === seat.target.result.section_uuid)

          setSeatLocation({
            section: selectedSeatSection.section_name,
            seat: seat.target.result.seat_name
          })

          console.log({
            section: selectedSeatSection.section_name,
            seat: seat.target.result.seat_name
          });
        }
      }
    })
  }, [selected_seat])


  // Make now kot order -> add in the given order_json -> return updated json (CALLED IN 'new_order' & 'createJson')
  function new_kotOrder(json, outlet, time, clickedButton) {

    let kot_type = sessionStorage.getItem('kot_type')
    let value = '1';

    console.log(clickedButton);
    if (kot_type === '1' && clickedButton === 'Save & KOT') value = '0';

    outlet.invoice_series[0].last_used_at = time;
    const series = outlet.invoice_series.find(series => series.user_uuid === localStorage.getItem('user_uuid'));

    let order_kot = {
      kot: Number(series.next_kot_number),
      user_uuid: localStorage.getItem('user_uuid'),
      created_at: time,
      kot_total: 0,
      kot_gst: 0,
      kot_vat: 0,
      kot_items_details: [],
      kot_status: value
    }

    itemCharges && itemCharges.forEach(item => {

      let price = Number(item.base_price);
      let discount = item.discount_applied;

      let taxable_value = price - discount;

      taxable_value += item.selected_multi.price ? Number(item.selected_multi.price) : 0;
      let gst = taxable_value * Number(item.item_gst) / 100
      let vat = taxable_value * Number(item.item_vat) / 100
      let total = taxable_value + gst + vat;

      let obj =
      {
        item_uuid: item.item_uuid,
        item_name: item.item_name,
        parcel: item.parcel,
        order_item_instruction: item.instruction,
        order_item_status: value,
        order_item_qty: item.item_quantity,
        order_item_unit_price: price,
        order_item_unit_discount: discount,
        order_item_unit_gst: gst,
        order_item_unit_vat: vat,
        order_item_taxable_value: taxable_value,
        order_item_amount_inclusive_taxes: total,
        addon_details: item.addons,
        multi_details: item.selected_multi,
      }

      !obj.order_item_instruction && delete obj.order_item_instruction
      order_kot.kot_items_details.push(obj);
    })

    let kot_total = 0;
    let kot_gst = 0;
    let kot_vat = 0;

    console.log(order_kot.kot_items_details);
    order_kot.kot_items_details.forEach(item => {
      kot_total += item.order_item_amount_inclusive_taxes
      kot_gst += item.order_item_unit_gst
      kot_vat += item.order_item_unit_vat
    })

    order_kot.kot_total = Number(kot_total.toFixed((+sessionStorage.getItem('decimal_length'))));
    console.log(order_kot.kot_total);

    order_kot.kot_gst = kot_gst;
    order_kot.kot_vat = kot_vat;
    json.order_kot_details.push(order_kot);

    const nonDecidedKot = json.order_kot_details.some(kot => kot.kot_status === '0')

    console.log("found kot status : ", nonDecidedKot);
    console.log("pre preparation status : ", json.preparation_status);

    if (nonDecidedKot) json.preparation_status = 0;
    else json.preparation_status = 1;

    if (json.payment_status === 1 || json.payment_status === 2 || json.payment_status === 3)
      if (json.preparation_status === 1 || json.preparation_status === 2)
        if (!json.delivery_status || json.delivery_status !== 0)
          json.order_status = 4;
        else json.order_status = 3;
      else json.order_status = 3;
    else json.order_status = 3;

    console.log("post changes preparation status : ", json.preparation_status);

    let order_total = 0;
    let total_tax_gst = 0;
    let total_tax_vat = 0;

    console.log(json.order_kot_details);
    json.order_kot_details.forEach(kot => {
      order_total += kot.kot_total
      total_tax_gst += kot.kot_gst
      total_tax_vat += kot.kot_vat
    });

    json.order_total = Number(order_total.toFixed(+sessionStorage.getItem('decimal_length')));
    json.total_tax_gst = Number(total_tax_gst.toFixed(+sessionStorage.getItem('decimal_length')));
    json.total_tax_vat = Number(total_tax_vat.toFixed(+sessionStorage.getItem('decimal_length')));

    // Charges and discounts calculations
    json.charges_and_discounts && json.charges_and_discounts.forEach(obj => {

      console.log(json);
      json = applyChargesDiscounts(obj, json, itemsList);
      console.log(json.order_total);
    })

    setTimeout(() => {
      console.log("order final values", +json.order_total, +json.total_tax_gst, +json.total_tax_vat);
    }, 300);

    return json
  }


  // Create a complete now order (CALLED IN 'createJson' when no running order is found)
  function new_order(outlet, clickedButton) {

    const series = outlet.invoice_series.find(series => series.user_uuid === localStorage.getItem('user_uuid'));

    let json = {};
    let time = Date.now()

    json.created_at = time;
    json.brand_uuid = JSON.parse(sessionStorage.getItem('brand')).brand_uuid
    json.customer_mobile = customerInfo.number
    json.customer_name = customerInfo.name
    json.local_order_id = Number(series.next_order_number)
    json.payment_status = 0
    json.preparation_status = 0;
    json.order_uuid = uuidv4();
    json.order_status = 3
    json.order_type = 0
    json.order_total = 0
    json.total_tax_gst = 0
    json.total_tax_vat = 0
    json.outlet_uuid = outlet.outlet_uuid
    json.seat_uuid = sessionStorage.getItem('seat')
    json.order_kot_details = []
    json.invoice_prints = []
    json.modified_at = time;
    json.UUID = json.local_order_id

    json = new_kotOrder(json, outlet, time, clickedButton)

    let onorder_seats = JSON.parse(localStorage.getItem('onorder_seats')) || [];
    let object = {
      seat_uuid: json.seat_uuid,
      created_at: json.created_at,
      price: json.order_total
    }
    onorder_seats.push(object);
    localStorage.setItem('onorder_seats', JSON.stringify(onorder_seats));

    return json
  }

  // Handle a new order creation or old order updation
  function createJson(e) {

    if (!itemCharges || itemCharges.length === 0) return;
    let DBOpenReq = indexedDB.open('FoodDo', 1);
    DBOpenReq.addEventListener('error', (err) => { console.warn(err) });
    DBOpenReq.addEventListener('success', (ev) => {

      let tx = ev.target.result.transaction('outlet', 'readwrite');
      let store = tx.objectStore('outlet');

      let getReq = store.getAll();
      getReq.onsuccess = (outletReq) => {

        var outlet = outletReq.target.result[0];

        tx = ev.target.result.transaction('running_orders', 'readwrite');
        store = tx.objectStore('running_orders');
        let getOrders = store.getAll()

        getOrders.onsuccess = (orderReq) => {

          let collection = orderReq.target.result
          let json = collection.find(data => data.seat_uuid === sessionStorage.getItem('seat'))

          if (json) {

            console.log("Found a running order for this seat in IDB");
            console.log("updating order...");
            let time = Date.now()

            json = new_kotOrder(json, outlet, time, e.target.innerText)
            json.order_total = json.order_total.toFixed(Number(sessionStorage.getItem('decimal_length')));
            console.log(json.order_total);

            let onorder_seats = JSON.parse(localStorage.getItem('onorder_seats')) || null;

            let seat = onorder_seats ? onorder_seats.find(seat => seat.seat_uuid === json.seat_uuid)
              : {
                seat_uuid: json.seat_uuid,
                created_at: json.created_at,
                price: json.order_total
              }

            seat.price = json.order_total

            let filtered_seats = onorder_seats ? onorder_seats.filter(seat => seat.seat_uuid !== json.seat_uuid) : []

            filtered_seats.push(seat);

            localStorage.setItem('onorder_seats', JSON.stringify(filtered_seats));

            collection = collection.filter(data => data.seat_uuid !== sessionStorage.getItem('seat'))

            tx = ev.target.result.transaction('running_orders', 'readwrite');
            store = tx.objectStore('running_orders');
            json.IsSynched = 0;
            json.modified_at = time;
            store.put(json)

            FBRunningOrder.SynckData(json.outlet_uuid);

            tx = ev.target.result.transaction('outlet', 'readwrite');
            store = tx.objectStore('outlet');

            const kot_number = Number(outlet.invoice_series[0].next_kot_number)
            outlet.invoice_series[0].next_kot_number = 1 + kot_number;

            store.put(outlet)

            console.log("Running seat order updated : ", collection);
          }
          else {
            console.log('No running order found for this seat in IDB');
            console.log("creating one...");

            json = new_order(outlet, e.target.innerText)
            json.order_total = (+json.order_total.toFixed(Number(sessionStorage.getItem('decimal_length'))));

            tx = ev.target.result.transaction('running_orders', 'readwrite');
            store = tx.objectStore('running_orders');
            json.IsSynched = 0;
            store.add(json)
            FBRunningOrder.SynckData(json.outlet_uuid);

            tx = ev.target.result.transaction('outlet', 'readwrite');
            store = tx.objectStore('outlet');

            let order_number;
            let kot_number;

            outlet.invoice_series.forEach(series => {
              if (series.user_uuid === localStorage.getItem('user_uuid')) {

                order_number = Number(series.next_order_number);
                kot_number = Number(series.next_kot_number);

                series.next_kot_number = 1 + kot_number;
                series.next_order_number = 1 + order_number;
              }
            })

            store.put(outlet)
            sessionStorage.setItem('haveRead', true);
          }
        }
      }

      let unplaced_orders = JSON.parse(localStorage.getItem('unplaced_orders'))
      if (unplaced_orders) {
        unplaced_orders = unplaced_orders.filter(order => order.seat !== sessionStorage.getItem('seat'))
        localStorage.setItem('unplaced_orders', JSON.stringify(unplaced_orders));
      }

      setSelected_seat(null);
      setSelectedItem(null);
      setItemCharges([])
      setTimeout(() => {
        Navigate('/page1');
      }, 80);
    })
  }


  // Fill selected contact details automatically in target input fields
  function details_fill_handler(e) {
    const name = e.target.parentNode.querySelector('[name="customer_name"]').innerText
    const number = e.target.parentNode.querySelector('[name="customer_mobile"]').innerText

    setCustomerInfo({ name: name, number: number.slice(number.length - 10) })
  }


  // Show available contact suggestions from customer json.
  function showSuggestions(e) {

    const input = e.target.value.toLowerCase();
    const container = document.getElementById('suggestions-div')
    const detailsArray = JSON.parse(sessionStorage.getItem('customer_details')) || []

    if (input.length > 2 && detailsArray) {

      const inputType = e.target.type;
      if (inputType === 'text') container.style.justifyContent = 'flex-end'
      else container.style.justifyContent = 'flex-start'
      container.style.display = 'flex';

      let labelsHTML = <div>
        {
          detailsArray.map(customer => {

            if (customer.customer_mobile.includes(input) || customer.customer_name.includes(input))
              if (inputType === 'number')
                return <label
                  key={Math.random()}
                  className='contact-suggestion'
                  onClick={(e) => details_fill_handler(e)}
                >
                  <div className='bold' name='customer_mobile'>{customer.customer_mobile}</div>
                  <div className='light' name='customer_name'>{customer.customer_name}</div>
                </label>
              else if (inputType === 'text')
                return <label
                  key={Math.random()}
                  className='contact-suggestion'
                  onClick={(e) => details_fill_handler(e)}
                >
                  <div className='bold' name='customer_name'>{customer.customer_name}</div>
                  <div className='light' name='customer_mobile' >{customer.customer_mobile}</div>
                </label>
          })
        }
      </div>
      setDomState(labelsHTML);
    }
    else container.style.display = 'none'
  }

  // Update parcel selection and calculation
  const addParcel = (item) => { cartHandler(item, item.addons, item.selected_multi, null, true) }


  // Update user contact details into the indexeddb. (CALLED WHEN a user leave input field -> onBlur())
  const updateContact = () => {

    let db = null;
    let DBOpenReq = indexedDB.open('FoodDo', 1);
    const seat = selected_seat

    console.log(seat);
    DBOpenReq.addEventListener('error', (err) => { console.warn(err) });
    DBOpenReq.addEventListener('success', (ev) => {

      db = ev.target.result;
      let tx = db.transaction('running_orders', 'readwrite');
      let store = tx.objectStore('running_orders');

      let getOrderReq = store.get(seat);
      getOrderReq.onsuccess = (ev) => {

        const order = ev.target.result
        console.log("found seat order", order);

        order.customer_mobile = document.getElementById('contact-number').value
        order.customer_name = document.getElementById('contact-name').value

        console.log(document.getElementById('contact-number').value, order.customer_mobile);
        console.log(document.getElementById('contact-name').value, order.customer_name);
        store.put(order)
      }
      setTimeout(() => {
        document.getElementById('suggestions-div').style.display = 'none'
      }, 300);
    });

  }

  // Handle invoice printing, store seat list locally and update invoice json in targey order stored in indexeddb
  function printInvoice(e) {

    let DBOpenReq = indexedDB.open('FoodDo', 1);
    DBOpenReq.addEventListener('error', (err) => { console.warn(err) });
    DBOpenReq.addEventListener('success', (ev) => {

      let tx = ev.target.result.transaction('running_orders', 'readwrite');
      let store = tx.objectStore('running_orders');

      if (!selected_seat) return;

      let getOrderReq = store.getAll();
      getOrderReq.onsuccess = (ev) => {
        const order = ev.target.result.find(o => o.seat_uuid === selected_seat);

        let object = {
          at: Date.now(),
          copies: e.target.innerText,
          user_uuid: localStorage.getItem('user_uuid')
        }

        order.invoice_prints = order.invoice_prints || []
        order.invoice_prints.push(object)
        store.put(order)

        const yellowOrders = JSON.parse(localStorage.getItem('yellowOrders_seats'))
        yellowOrders.push(order.seat_uuid)
        localStorage.setItem('yellowOrders_seats', JSON.stringify(yellowOrders))
        Navigate('/page1')
      }
    })
  }

  const cooking_instruction_Ref = useRef('')

  function instructionChange(e) {
    const rows = e.target.value.match(/\n/g);
    if (rows && rows < 3) e.target.rows = 3
    else if (rows) e.target.rows = rows.length + 1
    e.target.nextSibling.innerText = `${e.target.value.length}/200`;
  }

  function toggleInstructionField(inst_field_id, action) {
    action === 'toggle' && document.getElementById(`${inst_field_id}`).classList.toggle('active')
    action === 'remove' && document.getElementById(`${inst_field_id}`).classList.remove('active')
    document.getElementById(`${inst_field_id}`).getElementsByTagName('textarea')[0].focus();
  }

  function saveInstruction(item, inst_field_id) {

    const instruction = document.getElementById(`${inst_field_id}`).getElementsByTagName('textarea')[0].value
    instruction && cartHandler(item, item.addons, item.selected_multi, '', null, selected_seat, instruction);
    setTimeout(() => {
      toggleInstructionField(inst_field_id, "remove")
    }, 300);
  }

  const [isMouseOut, setIsMouseOut] = useState(false)

  function clearDisCharges(type) {
    Array.from(document.getElementById(`${type}-popup`).getElementsByTagName('input'))
      .forEach(input => { if (input.type !== 'radio') input.value = '' })
    type === 'discount' && setIsDiscountPopupActive(false)
    type === 'charge' && setIsChargePopupActive(false)
  }

  function discountChargesHandler(type) {

    if (!isMouseOut) return;

    const inputs = document.getElementById(`${type}-popup`).getElementsByTagName('input')

    if (!inputs[1].value) inputs[1].style.border = '1px solid red'
    else inputs[1].style.border = '1px solid black'

    if (!inputs[0].value) return inputs[0].style.border = '1px solid red'
    else inputs[0].style.border = '1px solid black'

    if (!inputs[1].value) return inputs[1].style.border = '1px solid red'
    else inputs[1].style.border = '1px solid black';

    const obj = {
      title: inputs[0].value
    }

    let checkedRadio = null;
    Array.from(inputs).forEach(input => {
      if (input.type === 'radio' && input.checked) checkedRadio = input;
    })

    if (checkedRadio.id.includes('amt')) obj.amt = inputs[1].value
    if (checkedRadio.id.includes('percentage')) obj.percent = inputs[1].value
    if (inputs[4].value) obj.remarks = inputs[4].value

    if (type === 'discount') {
      obj.type = 'D'
      setDiscounts(prev => [...prev, obj]);
      setIsDiscountPopupActive(false)
    }
    else if (type === 'charge') {
      obj.type = 'C'
      setCharges(prev => [...prev, obj])
      setIsChargePopupActive(false)
    }

    let db = null;
    let DBOpenReq = indexedDB.open('FoodDo', 1);

    DBOpenReq.addEventListener('error', (err) => { console.warn(err) });
    DBOpenReq.addEventListener('success', (ev) => {

      db = ev.target.result
      let tx = db.transaction('running_orders', 'readwrite');
      let store = tx.objectStore('running_orders');

      const seat = selected_seat || sessionStorage.getItem('seat')
      console.log(seat);
      let getBrand = store.getAll();
      getBrand.onsuccess = (ev) => {

        let order = ev.target.result.find(o => o.seat_uuid === seat);
        console.log(order);

        const chargesAndDiscounts = [];

        order.charges_and_discounts && order.charges_and_discounts.forEach(element => chargesAndDiscounts.push(element));
        chargesAndDiscounts.push(obj);
        order.charges_and_discounts = chargesAndDiscounts;

        order = applyChargesDiscounts(obj, order, itemsList)

        let onorder_seats = JSON.parse(localStorage.getItem('onorder_seats')) || null;
        let onorder_seat = onorder_seats.find(seat => seat.seat_uuid === order.seat_uuid);

        onorder_seat.price = order.order_total;

        let filtered_seats = onorder_seats.filter(seat => seat.seat_uuid !== order.seat_uuid);
        filtered_seats.push(onorder_seat);

        localStorage.setItem('onorder_seats', JSON.stringify(filtered_seats));

        console.log(chargesAndDiscounts);
        console.log(order);
        store.put(order);

        if (window.location.pathname === '/page1') setSelectedSeat_order(order)
        if (window.location.pathname === '/page2') setPage2Total(order.order_total)
        setTimeout(() => Navigate(window.location.pathname), 50);
      }
    })

    Array.from(document.getElementById(`${type}-popup`).getElementsByTagName('input'))
      .forEach(input => { if (input.type !== 'radio') input.value = '' })
    console.log(obj);
  }

  useEffect(() => {
    console.log(discounts)
  }, [discounts])

  useEffect(() => {
    console.log(charges)
  }, [charges])

  const clearInstruction = item => cartHandler(item, item.addons, item.selected_multi, '', null, selected_seat, 'remove-cooking-instruction');

  function paymentPopupHandler() {

    if (page2Total === 0 && window.location.pathname === '/page2') return;
    else if (totalAmount === 0 && window.location.pathname === '/page1') return;

    if (orderPaymentStatus) {
      document.querySelector('.notification-message').innerText = 'Already Paid!';
      document.querySelector('.notification-container').classList.add('active-red');
      setTimeout(() => {
        document.querySelector('.notification-container').classList.remove('active-red')
      }, 2000);
      return
    }

    let seats = JSON.parse(localStorage.getItem('unplaced_orders')) || [];
    const isSeatOrderPending = seats.some(seat => seat.seat === sessionStorage.getItem('seat'))

    if (isSeatOrderPending) {
      document.querySelector('.notification-message').innerText = 'Action pending for some items';
      document.querySelector('.notification-container').classList.add('active-red');

      setTimeout(() => {
        document.querySelector('.notification-container').classList.remove('active-red')
      }, 2000);
    }

    if (!isSeatOrderPending) {
      sessionStorage.setItem('is-payment-popup', true)
      if (window.location.pathname === '/page2')
        setPaymentOptionOpen({ status: true, amount: page2Total })
      else
        setPaymentOptionOpen({ status: true, amount: totalAmount })
    }
  }

  function confirmAndPayment(invoice_copy) {

    if (!itemCharges || itemCharges.length === 0) return;
    let DBOpenReq = indexedDB.open('FoodDo', 1);
    DBOpenReq.addEventListener('error', (err) => { console.warn(err) });
    DBOpenReq.addEventListener('success', (ev) => {

      let tx = ev.target.result.transaction('outlet', 'readwrite');
      let store = tx.objectStore('outlet');

      let getReq = store.getAll();
      getReq.onsuccess = (outletReq) => {

        const outlet = outletReq.target.result[0];

        tx = ev.target.result.transaction('running_orders', 'readwrite');
        store = tx.objectStore('running_orders');
        const btn_text = sessionStorage.getItem('order-create-btn');
        const json = new_order(outlet, btn_text);

        json.payment_at = {
          t: Date.now()
        }
        json.payment_by_user_uuid = localStorage.getItem('user_uuid');
        json.payment_status = 1;
        json.payment_total = totalAmount;

        let object = {
          at: Date.now(),
          copies: invoice_copy,
          user_uuid: localStorage.getItem('user_uuid')
        }

        json.invoice_prints.push(object)

        json.payment_details = [];
        Array.from(document.getElementsByClassName('amount-field')).forEach(field => {
          json.payment_details.push({
            payment_mode_uuid: field.getAttribute('payment-mode-uuid'),
            amount: (+field.value)
          })
        })


        if (json.payment_status === 1 || json.payment_status === 2 || json.payment_status === 3)
          if (json.preparation_status === 1 || json.preparation_status === 2)
            if (!json.delivery_status || json.delivery_status !== 0)
              json.order_status = 4;
            else json.order_status = 3;
          else json.order_status = 3;
        else json.order_status = 3;


        if (json.order_status !== 4) {
          store.put(json)
          setPaymentOptionOpen({ status: false })

          let unplaced_orders = JSON.parse(localStorage.getItem('unplaced_orders'))
          unplaced_orders = unplaced_orders.filter(o => o.seat !== json.seat_uuid)
          localStorage.setItem('unplaced_orders', JSON.stringify(unplaced_orders));

          return Navigate('/page1')
        }

        store.delete(selected_seat)
        tx = ev.target.result.transaction('Orders', 'readwrite');
        store = tx.objectStore('Orders');

        json.UUID = json.order_uuid;
        store.add(json);

        let onorder_seats = JSON.parse(localStorage.getItem('onorder_seats'));
        onorder_seats = onorder_seats.filter(seatOrder => seatOrder.seat_uuid !== json.seat_uuid);
        localStorage.setItem('onorder_seats', JSON.stringify(onorder_seats));

        let yellow_seats = JSON.parse(localStorage.getItem('yellowOrders_seats'));
        yellow_seats = yellow_seats.filter(seat => seat !== json.seat_uuid);
        localStorage.setItem('yellowOrders_seats', JSON.stringify(yellow_seats));

        let unplaced_orders = JSON.parse(localStorage.getItem('unplaced_orders'))
        unplaced_orders = unplaced_orders.filter(o => o.seat !== json.seat_uuid)
        localStorage.setItem('unplaced_orders', JSON.stringify(unplaced_orders));

        setSelected_seat(null);
        setSelectedItem(null);
        setItemCharges([])
        setTimeout(() => {
          Navigate('/page1');
        }, 80);
      }
    })
  }

  return (
    <div className={`info ${window.location.pathname === '/page1' && 'page1'}`}>
      <div
        id='confirm-and-payment-btn'
        invoice-copy=""
        onClick={(e) => confirmAndPayment(e.currentTarget.getAttribute('invoice-copy'))}
        style={{ display: 'none' }}
      ></div>
      <div className="info-container">
        <div className="inputs">
          <input type="number"
            id='contact-number'
            value={customerInfo.number}
            onChange={(e) => {
              setCustomerInfo({ ...customerInfo, number: e.target.value })
              showSuggestions(e)
            }}
            onBlur={() => setTimeout(() => updateContact(), 300)}
            placeholder='Mobile no.' />
          <input type="text"
            id='contact-name'
            value={customerInfo.name}
            onChange={(e) => {
              setCustomerInfo({ ...customerInfo, name: e.target.value })
              showSuggestions(e)
            }}
            onBlur={() => setTimeout(() => updateContact(), 300)}
            placeholder='Customer Name' />
        </div>
        <div id='suggestions-div' style={{ display: "none" }}>
          {domState}
        </div>
        <div className="name">
          {seatLocation && <h3>{seatLocation.section || null} {seatLocation.seat || null} : Rs.<span id='total-amount'>{Math.round(totalAmount)}</span></h3>}
          <button className="edit">Edit</button>
        </div>
        <div className="description-container">
          <table className="description">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>

              {selectedSeat_order && window.location.pathname === '/page1'
                && selectedSeat_order.order_kot_details
                  .map(kot_order => kot_order.kot_items_details
                    .map(item => {

                      const color = item.order_item_status === '2' ? 'red'
                        : item.order_item_status === '1' ? 'green'
                          : 'black'

                      return <tr key={Math.random()} style={{ color: color }}>
                        <td>{item.item_name}</td>
                        <td>{item.order_item_qty}</td>
                        <td>Rs.{item.order_item_taxable_value + item.order_item_unit_discount}.00</td>
                        <td>
                          <PencilAltIcon style={{ height: "20px", color: item.order_item_instruction ? 'red' : 'black', }} />
                          <ShoppingBagIcon style={{
                            color: item.parcel === 'Y' ? 'green' : item.parcel === 'N' ? 'black' : '#0080008a', height: "20px"
                          }} />
                        </td>
                      </tr>
                    })
                  )}

              {itemCharges && window.location.pathname === '/page2' && itemCharges.map((element, index) => {

                const cookingInstructionID = `${element.item_uuid}${Math.random()}`;
                return <tr key={Math.random()}>
                  <td>{element.item_name}</td>
                  {/* <td>
                    {quatityEditable ? (
                      <QuantityEditable quantity={element.item_quantity} item={element} />
                    ) : 2}
                  </td> */}
                  <td>Rs.{element.base_price}.00</td>
                  <td>
                    {/* ------------------------------------------------------------------------------ */}
                    <div
                      style={{ display: 'inline-block', position: 'relative' }}
                      onBlur={() => saveInstruction(element, cookingInstructionID)}
                    >
                      <PencilAltIcon style={{ height: "20px", color: element.instruction ? 'red' : 'black' }} onClick={() =>
                        toggleInstructionField(cookingInstructionID, 'toggle')} />

                      <div id={cookingInstructionID} className={`item-edit-popup ${index <= 1 ? "bottom" : "top"}`}>
                        <textarea
                          maxLength="200"
                          rows={3}
                          ref={cooking_instruction_Ref}
                          placeholder='Instructions..'
                          defaultValue={element.instruction || ''}
                          onChange={(e) => instructionChange(e)}
                        />
                        <span id='instruction_length' style={{ color: 'grey', padding: '2px 5px', fontSize: '13px' }}>0/200</span>
                        <div className="item-edit-popup-actions">
                          <button
                            className="red"
                            onClick={() => clearInstruction(element, cookingInstructionID)}
                          >Clear</button>
                          <button
                            style={{ backgroundColor: '#44cd4a' }}
                            onClick={() => saveInstruction(element, cookingInstructionID)}
                          >Save</button>
                        </div>
                      </div>
                    </div>
                    <ShoppingBagIcon onClick={() => addParcel(element)} style={{
                      color: element.parcel === 'Y' ? '#44cd4a' : element.parcel === 'N' ? 'black' : '#0080008a', height: "20px"
                    }} />
                  </td>
                </tr>
              })
              }
            </tbody>
          </table>
        </div>
      </div>
      <div className="info-actions">
        {window.location.pathname === '/page2' && <>
          <div className="button-group col-2" onBlur={() => setTimeout(() => setIsChefPopupActive(false), 300)}>
            <button onClick={(e) => createJson(e)} id='save&kot-btn'>Save & KOT</button>
            <button className={`menu ${isChefPopupActive ? 'active' : ''}`}
              onClick={() => {
                sessionStorage.setItem('order-create-btn', 'Save & KOT')
                setPaymentOptionOpen({ status: true, amount: page2Total, confirm_and_payment: true })
              }}
            >
              Confirm & Payment
            </button>
            <button onClick={() => setIsChefPopupActive(!isChefPopupActive)}>
              <ChevronUpIcon style={{ color: "white", height: "20px" }} />
            </button>
          </div>
          <div className="button-group col-2" onBlur={() => setTimeout(() => setIsDirectAddPopupActive(false), 300)}>
            <button onClick={(e) => createJson(e)} id='save-btn'>Save</button>
            <button className={`menu ${isDirectAddPopupActive ? 'active' : ''}`}
              onClick={() => {
                sessionStorage.setItem('order-create-btn', 'Save')
                setPaymentOptionOpen({ status: true, amount: page2Total, confirm_and_payment: true })
              }}
            >
              Confirm & Payment
            </button>
            <button onClick={() => setIsDirectAddPopupActive(!isDirectAddPopupActive)}><ChevronUpIcon style={{ color: "white", height: "20px" }} /></button>
          </div>
          <div className="button-group col-2" >
            <button onClick={() => seats_onOrder.includes(selected_seat) && setIsChargePopupActive(!isChargePopupActive)}>+ Charge</button>
            <div
              tabIndex="0"
              onBlur={() => discountChargesHandler('charge')}
              onMouseEnter={() => setIsMouseOut(false)}
              onMouseLeave={() => setIsMouseOut(true)}
              id='charge-popup'
              className={`info-action-popup ${isChargePopupActive ? 'active' : ''}`}
            >
              <SubHeader title='Charge' style={{ padding: '0px 45px' }} />
              <div className="info-action-popup-content" onMouseEnter={() => setIsMouseOut(false)}>
                <input type="text" placeholder='Title (Displayed)' id='charge-title' />
                <input type="number" placeholder='Value' id='charge-value' />
                <div className="info-action-popup-radio-inputs">
                  <div className="radio-input">
                    <input type="radio" name="charge-radio" id="charge-amt" />
                    <label htmlFor="charge-amt">Amt</label>
                  </div>
                  <div className="radio-input">
                    <input type="radio" name="charge-radio" id="charge-percentage" defaultChecked />
                    <label htmlFor="charge-percentage">Percentage</label>
                  </div>
                </div>
                <input type="text" placeholder='Remarks (Not Displayed)' id='charge-remarks' style={{ marginTop: 10 }} />
              </div>
              <div className="info-action-popup-actions">
                <button className="red" onMouseEnter={() => setIsMouseOut(false)} onClick={() => clearDisCharges('charge')} >Clear</button>
                <button style={{ backgroundColor: 'green' }} onMouseEnter={() => setIsMouseOut(true)} onClick={() => discountChargesHandler('charge')} >Submit</button>
              </div>
            </div>
          </div>
          <div className="button-group col-2" >
            <button onClick={() => seats_onOrder.includes(selected_seat) && setIsDiscountPopupActive(!isDiscountPopupActive)}>Discount</button>
            <div
              tabIndex="0"
              onBlur={() => discountChargesHandler('discount')}
              onMouseEnter={() => setIsMouseOut(false)}
              onMouseLeave={() => setIsMouseOut(true)}
              style={{ right: 0 }}
              id='discount-popup'
              className={`info-action-popup ${isDiscountPopupActive ? 'active' : ''}`}
            >
              <SubHeader title='Discount' style={{ padding: '0px 45px' }} />
              <div className="info-action-popup-content" onMouseEnter={() => setIsMouseOut(false)}>
                <input type="text" placeholder='Title (Displayed)' id='discount-title' />
                <input type="number" placeholder='Value' id='discount-value' />
                <div className="info-action-popup-radio-inputs">
                  <div className="radio-input">
                    <input type="radio" name="discount-radio" id="discount-amt" />
                    <label htmlFor="discount-amt">Amt</label>
                  </div>
                  <div className="radio-input">
                    <input type="radio" name="discount-radio" id="discount-percentage" defaultChecked />
                    <label htmlFor="discount-percentage">Percentage</label>
                  </div>
                </div>
                <input type="text" placeholder='Remarks (Not Displayed)' id='discount-remarks' style={{ marginTop: 10 }} />
              </div>
              <div className="info-action-popup-actions">
                <button className="red" onMouseEnter={() => setIsMouseOut(false)} onClick={() => clearDisCharges('discount')} >Clear</button>
                <button style={{ backgroundColor: 'green' }} onMouseEnter={() => setIsMouseOut(true)} onClick={() => discountChargesHandler('discount')}>Submit</button>
              </div>
            </div>
          </div>
          {!orderPaymentStatus ?
            <button
              onClick={() => paymentPopupHandler()}
              id='payment-btn'
              className='col-4'
              style={{ backgroundColor: '#44cd4a' }}
            >
              Pay Rs.{page2Total}
            </button> :
            <button id='payment-btn' style={{ background: 'black' }} className='col-4'>Paid Rs.{page2Total}</button>
          }
        </>}
        {window.location.pathname === '/page1' &&
          <>
            <div className="button-group col-1">
              <button onClick={() => totalAmount !== 0 && setIsChargePopupActive(!isChargePopupActive)}>+ Charge</button>
              <div tabIndex="0"
                onBlur={() => discountChargesHandler('charge')}
                onMouseEnter={() => setIsMouseOut(false)}
                onMouseLeave={() => setIsMouseOut(true)}
                id='charge-popup'
                className={`info-action-popup ${isChargePopupActive ? 'active' : ''}`}
              >
                <SubHeader title='Charge' style={{ padding: '0px 45px' }} />
                <div className="info-action-popup-content" onMouseEnter={() => setIsMouseOut(false)}>
                  <input type="text" placeholder='Title (Displayed)' id='charge-title' />
                  <input type="number" placeholder='Value' id='charge-value' />
                  <div className="info-action-popup-radio-inputs">
                    <div className="radio-input">
                      <input type="radio" name="charge-radio" id="charge-amt" />
                      <label htmlFor="charge-amt">Amt</label>
                    </div>
                    <div className="radio-input">
                      <input type="radio" name="charge-radio" id="charge-percentage" defaultChecked />
                      <label htmlFor="charge-percentage">Percentage</label>
                    </div>
                  </div>
                  <input type="text" placeholder='Remarks (Not Displayed)' id='charge-remarks' style={{ marginTop: 10 }} />
                </div>
                <div className="info-action-popup-actions">
                  <button className="red" onMouseEnter={() => setIsMouseOut(false)} onClick={() => clearDisCharges('charge')} >Clear</button>
                  <button style={{ backgroundColor: 'green' }} onMouseEnter={() => setIsMouseOut(true)} onClick={() => discountChargesHandler('charge')} >Submit</button>
                </div>
              </div>
            </div>
            <div className="button-group col-1">
              <button onClick={() => totalAmount !== 0 && setIsDiscountPopupActive(!isDiscountPopupActive)}>Discount</button>
              <div
                tabIndex="0"
                onBlur={() => discountChargesHandler('discount')}
                onMouseEnter={() => setIsMouseOut(false)}
                onMouseLeave={() => setIsMouseOut(true)}
                style={{ right: 0 }}
                id='discount-popup'
                className={`info-action-popup ${isDiscountPopupActive ? 'active' : ''}`}
              >
                <SubHeader title='Discount' style={{ padding: '0px 45px' }} />
                <div className="info-action-popup-content" onMouseEnter={() => setIsMouseOut(false)}>
                  <input type="text" placeholder='Title (Displayed)' id='discount-title' />
                  <input type="number" placeholder='Value' id='discount-value' />
                  <div className="info-action-popup-radio-inputs">
                    <div className="radio-input">
                      <input type="radio" name="discount-radio" id="discount-amt" />
                      <label htmlFor="discount-amt">Amt</label>
                    </div>
                    <div className="radio-input">
                      <input type="radio" name="discount-radio" id="discount-percentage" defaultChecked />
                      <label htmlFor="discount-percentage">Percentage</label>
                    </div>
                  </div>
                  <input type="text" placeholder='Remarks (Not Displayed)' id='discount-remarks' style={{ marginTop: 10 }} />
                </div>
                <div className="info-action-popup-actions">
                  <button className="red" onMouseEnter={() => setIsMouseOut(false)} onClick={() => clearDisCharges('discount')} >Clear</button>
                  <button style={{ backgroundColor: 'green' }} onMouseEnter={() => setIsMouseOut(true)} onClick={() => discountChargesHandler('discount')}>Submit</button>
                </div>
              </div>
            </div>
            <div className="button-group col-1">
              <button
                onClick={() => setIsInvoiceActive(!isInvoiceActive)}
                onBlur={() => setTimeout(() => setIsInvoiceActive(!isInvoiceActive), 200)}
              >Invoice</button>
              <div className={`menu KOT ${isInvoiceActive ? 'active' : ''}`}>
                <button onClick={e => printInvoice(e)} style={{ cursor: 'pointer' }}>1</button>
                <button onClick={e => printInvoice(e)} style={{ cursor: 'pointer' }}>2</button>
                <button onClick={e => printInvoice(e)} style={{ cursor: 'pointer' }}>eBill</button>
              </div>
            </div>
            <div className="button-group col-1">
              <button
                onClick={() => setIsKOTPopupActive(!isKOTPopupActive)}
                onBlur={() => setTimeout(() => setIsKOTPopupActive(false), 50)}
              >KOT</button>
              <div className={`menu KOT ${isKOTPopupActive ? 'active' : ''}`}>
                {kot_list && kot_list.map(i => {
                  return <button key={Math.random()}>{i}</button>
                })}
              </div>
            </div>
            {!orderPaymentStatus ?
              <button
                onClick={() => paymentPopupHandler()}
                id='payment-btn'
                className='col-4'
                style={{ backgroundColor: '#44cd4a' }}
              >
                Pay Rs.{totalAmount}
              </button> :
              <button id='payment-btn' style={{ background: 'black' }} className='col-4'>Paid Rs.{totalAmount}</button>}
          </>
        }
      </div>
    </div >
  )
}

export default Info
