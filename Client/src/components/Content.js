import React, { useState, useEffect, useContext, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

// Importing Components
import Context from '../context/context'
import Card from './Card'
// import Popup from './Popup'
import TabularContent from './TabularContent'
import kitchen from '../images/kitchen.svg'
import OrdersContent from './orders-page/OrdersContent'
const Content = ({ isPaymentOptionOpen, setPaymentOptionOpen, isItemAvilableOpen, setIsItemAvilableOpen }) => {

  const Navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchState, setSearchState] = useState('')

  useEffect(() => {

    if (searchState === '') return
    console.log(searchState);
    document.querySelector('[type="search"]').focus()
    console.log(document.querySelector('[type="search"]'));
  }, [searchState])

  // States
  const [outletIdState, setOutletIdState] = useState('')
  const [outletState, setOutletState] = useState('');
  const [modalState, setModalState] = useState({ isVisible: false, data: null })

  const context = useContext(Context);
  const {
    finalState, setFinalState,
    selected_seat, setSelected_seat,
    selectedBrand_Menu, cartHandler,
    itemsState, setItemsState,
    setItemCharges,
    selectedItem, setSelectedItem,
    seatsState, setSeatsState,
    evaluate
  } = context;

  const handleSearch = (e) => {

    setSearchState(e.target.value)
    const page = window.location.pathname
    const searchInput = e.target.value.toLowerCase();

    if (searchInput.slice(0, 5) === 'wiki:' && searchInput.slice(searchInput.length - 1) === ';') {
      const param = searchInput.slice(5, searchInput.length - 1)
      window.open(`https://en.wikipedia.org/wiki/${param}`, '_blank')
    }

    if (page === '/page1') {

      let DBOpenReq = indexedDB.open('FoodDo', 1);
      DBOpenReq.addEventListener('error', (err) => { console.warn(err) });
      DBOpenReq.addEventListener('success', (ev) => {

        let tx = ev.target.result.transaction('seats', 'readonly');
        let store = tx.objectStore('seats');

        let getReq = store.getAll();
        getReq.onsuccess = (ev) => {

          const seats = ev.target.result;
          const filteredSeats = seats.filter(seat => seat.seat_uuid.includes(searchInput) || seat.seat_name.toLowerCase().includes(searchInput))
          setSeatsState(filteredSeats);
        }
      });
    }

    else if (page === '/page2') {

      let DBOpenReq = indexedDB.open('FoodDo', 1);
      DBOpenReq.addEventListener('error', (err) => { console.warn(err) });
      DBOpenReq.addEventListener('success', (ev) => {

        let tx = ev.target.result.transaction('item', 'readonly');
        let store = tx.objectStore('item');

        let getReq = store.getAll();
        getReq.onsuccess = (ev) => {

          const items = ev.target.result;
          const searchResult = [];

          items.filter(item => {
            const item_code = item.outlet_wise_item_details[0].other_details.item_code.toLowerCase()
            if (item_code.includes(searchInput) || item.item_name.toLowerCase().includes(searchInput))
              searchResult.push(item.item_uuid)
          })

          console.log(searchResult);
          const localFinalState = JSON.parse(sessionStorage.getItem('finalState'))
          localFinalState.menues.forEach(menu => {
            menu.category_and_items.forEach(category => {
              category.menu_items = category.menu_items.filter(item => searchResult.includes(item.item_uuid))
            })
          })

          console.log(localFinalState.menues[0].category_and_items);
          setFinalState(localFinalState)
        }
      })
    }
  }

  useEffect(() => {

    let db = null;
    let objectStore = null;
    let DBOpenReq = indexedDB.open('FoodDo', 1);

    DBOpenReq.addEventListener('error', (err) => { console.warn(err) });
    DBOpenReq.addEventListener('success', (ev) => {
      db = ev.target.result;
      storeList();
    });

    const storeList = () => {

      let tx = db.transaction('outlet', 'readonly');
      let store = tx.objectStore('outlet');
      var outlet_uuid = outletIdState

      let getReq = store.getAll();
      getReq.onsuccess = (ev) => {
        let outletData = ev.target.result[0];
        outletData.section_details.sort((a, b) => a.section_sort_order - b.section_sort_order);
        setOutletState(outletData.section_details);
        setOutletIdState(outletData.outlet_uuid)
        sessionStorage.setItem('kot_type', outletData.kot_type)
        sessionStorage.setItem('decimal_length', outletData.setup.decimal_length)
        outlet_uuid = outletData.outlet_uuid
      };

      tx = db.transaction('seats', 'readonly');
      store = tx.objectStore('seats');

      getReq = store.getAll();
      getReq.onsuccess = (ev) => {
        let seats_collection = ev.target.result;
        seats_collection.sort((a, b) => a.seat_sort_order - b.seat_sort_order);
        setSeatsState(seats_collection);
      };

      tx = db.transaction('item', 'readonly');
      store = tx.objectStore('item');

      getReq = store.getAll();
      getReq.onsuccess = (ev) => setItemsState(ev.target.result);

      tx = db.transaction('customer', 'readonly');
      store = tx.objectStore('customer');

      const customerDetailReq = store.getAll();

      customerDetailReq.onsuccess = (ev) => {

        const detailsArray = [];
        ev.target.result.forEach(customer => {
          const object = {}
          object.customer_mobile = customer.customer_mobile

          const details = customer.outlet_wise_customer_details.find(outlet => outlet.outlet_uuid === localStorage.getItem('outlet_uuid'))

          object.customer_name = details.customer_other_details.customer_name

          detailsArray.push(object)
        })
        sessionStorage.setItem('customer_details', JSON.stringify(detailsArray));
      }

      tx = db.transaction('running_orders', 'readonly');
      store = tx.objectStore('running_orders');

      const runningOrdersReq = store.getAll();
      runningOrdersReq.onsuccess = (ev) => {
        const runningOrders = ev.target.result;
        if (runningOrders.length > 0) {

          let yellowOrders = [];
          runningOrders.forEach(order => {
            order.invoice_prints
              && order.invoice_prints.length > 0
              && order.order_status !== 4
              && yellowOrders.push(order.seat_uuid)
          })
          localStorage.setItem('yellowOrders_seats', JSON.stringify(yellowOrders))
        }
      }
    }
  }, []);

  const modalViewHandler = (item) => setModalState({ ...modalState, isVisible: !modalState.isVisible, data: item });

  useEffect(() => {
    modalState.isVisible === true && sessionStorage.setItem('popup-state', true);
    modalState.isVisible === false && sessionStorage.setItem('popup-state', false);
  }, [modalState])

  useEffect(() => {
    if (window.location.pathname === '/page1') {
      if (selected_seat) {
        if (document.querySelector(`[seat="${selected_seat}"]`))
          document.querySelector(`[seat="${selected_seat}"]`).getElementsByTagName('button')[0].style.border = '1px solid #3533b3';
      }
    }
    if (window.location.pathname === '/page2') {
      if (selectedItem) {
        if (document.querySelector(`[item-name="${selectedItem}"]`))
          document.querySelector(`[item-name="${selectedItem}"]`).getElementsByTagName('button')[0].style.border = '1px solid #3533b3';
      }
    }
  })

  const keyDownListner = (event) => {

    const keyName = event.key;
    console.log(keyName);

    if (event.shiftKey) {
      if (window.location.pathname === '/page2') {
        if (keyName === 'S') document.getElementById('save-btn').click()
        else if (keyName === 'K') document.getElementById('save&kot-btn').click()
        else if (keyName === 'D') Navigate('/page1')
      }
      if (keyName === 'P' && sessionStorage.getItem('popup-state') !== 'true') document.getElementById('payment-btn') && document.getElementById('payment-btn').click()
    }


    if (sessionStorage.getItem('popup-state') === 'true') {

      if (keyName === 'Enter') {
        return document.querySelector('.popup-done').click()
      }

      else if (keyName === 'Escape') {
        return document.querySelector('.popup-cancel').click()
      }

      let currentItem = document.querySelector('.popup-item-highlight');

      if (!currentItem)
        return document.querySelector(`[popup-index="0"]`).classList.add('popup-item-highlight');

      console.log(currentItem);
      const nextItem = document.querySelector(`[popup-index="${+currentItem.getAttribute('popup-index') + 1}"]`);
      const prevItem = document.querySelector(`[popup-index="${+currentItem.getAttribute('popup-index') - 1}"]`);


      if (keyName === 'ArrowDown') {

        console.log(currentItem);
        console.log(nextItem);
        console.log(prevItem);

        currentItem.classList.remove('popup-item-highlight');
        if (!nextItem) {
          document.querySelector(`[popup-index="0"]`).classList.add('popup-item-highlight');
          return document.querySelector(`[popup-index="0"]`).scrollIntoViewIfNeeded(true);
        }

        nextItem.classList.add('popup-item-highlight');
        nextItem.scrollIntoViewIfNeeded(true);
      }

      else if (keyName === 'ArrowUp') {

        console.log(currentItem);
        console.log(nextItem);
        console.log(prevItem);

        if (!prevItem) return
        currentItem.classList.remove('popup-item-highlight');
        prevItem.classList.add('popup-item-highlight');
        prevItem.scrollIntoViewIfNeeded(true);
      }

      else if (keyName === '+') {

        const currentItemIndex = currentItem.getAttribute('popup-index')
        currentItem.click()
        setTimeout(() => {
          document.querySelector(`[popup-index="${+currentItemIndex}"]`).classList.add('popup-item-highlight')
        }, 100);
      }
      return;
    }

    else if (sessionStorage.getItem('is-payment-popup') === 'true') {

      console.log("payment popup open");
      let currentField = document.querySelector('.amount-field.selected');
      if (!currentField) return console.log('no current field found')

      let nextField = document.querySelector(`[payment-field-index="${+currentField.getAttribute('payment-field-index') + 1}"]`)
      let prevField = document.querySelector(`[payment-field-index="${+currentField.getAttribute('payment-field-index') - 1}"]`)

      if (keyName === 'ArrowDown') {
        currentField.classList.remove('selected')
        currentField.blur()

        if (nextField) {
          console.log(nextField);
          nextField.classList.add('selected')
          nextField.focus()
        }
        else {
          document.querySelector('[payment-field-index="0"]').classList.add('selected')
          document.querySelector('[payment-field-index="0"]').focus()
        }
      }

      else if (keyName === 'ArrowUp') {

        if (prevField) {
          currentField.classList.remove('selected')
          currentField.blur()
          prevField.classList.add('selected')
          prevField.focus()
        }
      }

      else if (keyName === 'Escape') {
        document.querySelector('#payment-cancel-btn').click()
      }

      else if (event.shiftKey && keyName === 'P') {
        document.querySelector('#save-and-kot-btn').click()
      }

      else if (keyName === 'e') {
        if (!document.querySelector('.invoice-container.payment-popup.active')) return
        document.querySelector('#payment-popup-invoice-ebill').click()
      }

      else if (keyName === '0') {
        if (!document.querySelector('.invoice-container.payment-popup.active')) return
        document.querySelector('#payment-popup-invoice-0').click()
      }

      else if (keyName === '1') {
        if (!document.querySelector('.invoice-container.payment-popup.active')) return
        document.querySelector('#payment-popup-invoice-1').click()
      }

      else if (keyName === '2') {
        if (!document.querySelector('.invoice-container.payment-popup.active')) return
        document.querySelector('#payment-popup-invoice-2').click()
      }

      return console.log(currentField);
    }

    let selectedElementIndex;
    let selectedElement;
    let className;

    if (window.location.pathname === '/page1') className = 'seatSearchTarget';
    else if (window.location.pathname === '/page2') className = 'itemDiv';

    Array.from(document.getElementsByClassName(className))
      .forEach(div => {
        if (div.querySelector('button').style.border === '1px solid rgb(53, 51, 179)') {
          selectedElement = div
          selectedElementIndex = div.getAttribute('index')
        }
      })

    console.log(selectedElement);

    const page = window.location.pathname;

    const nextElement = document.querySelector(`[index="${+selectedElementIndex + 1}"]`)
    const prevElement = document.querySelector(`[index="${+selectedElementIndex - 1}"]`)
    const selectedElement_sectionIndex = (+selectedElement.getAttribute('section-index'))

    let indexesObj;

    if (page === '/page1')
      indexesObj = JSON.parse(sessionStorage.getItem('seats-indexesObj')) || {};

    else if (page === '/page2')
      indexesObj = JSON.parse(sessionStorage.getItem('menu-indexesObj')) || {};

    let selected_section_item_index = indexesObj[`${selectedElement_sectionIndex}`];
    let next_section_item_index = indexesObj[`${(selectedElement_sectionIndex + 1)}`];
    let prev_section_item_index = indexesObj[`${(selectedElement_sectionIndex - 1)}`];

    let sectionFirstIndex = document.querySelector(
      `[this-section-index="${+selectedElement.getAttribute('section-index')}"]`
    ).firstElementChild.getAttribute('index')

    let sectionLastIndex = document.querySelector(
      `[this-section-index="${+selectedElement.getAttribute('section-index')}"]`
    ).lastElementChild.getAttribute('index')

    if (keyName === 'ArrowLeft') {
      console.log("arrow left, previous element :", prevElement);
      if (prevElement) {

        if ((+selectedElementIndex) - 1 < (+sectionFirstIndex))
          indexesObj[`${selectedElement_sectionIndex - 1}`] = (+selectedElementIndex) - 1;
        else
          indexesObj[`${selectedElement_sectionIndex}`] = (+selectedElementIndex) - 1;

        if (page === '/page1')
          sessionStorage.setItem('seats-indexesObj', JSON.stringify(indexesObj));

        else if (page === '/page2')
          sessionStorage.setItem('menu-indexesObj', JSON.stringify(indexesObj));

        prevElement.click();
      }
    }

    else if (keyName === 'ArrowRight') {

      console.log("arrow right, next element :", nextElement);

      document.querySelector(`[index="${+selectedElementIndex}"]`).classList.remove('selected-in-section')
      if (nextElement) {

        if ((+selectedElementIndex) + 1 > (+sectionLastIndex))
          indexesObj[`${selectedElement_sectionIndex + 1}`] = (+selectedElementIndex) + 1;
        else
          indexesObj[`${selectedElement_sectionIndex}`] = (+selectedElementIndex) + 1;

        if (page === '/page1')
          sessionStorage.setItem('seats-indexesObj', JSON.stringify(indexesObj));

        else if (page === '/page2')
          sessionStorage.setItem('menu-indexesObj', JSON.stringify(indexesObj));

        nextElement.click()
      }
      else {
        indexesObj[selected_section_item_index] = (+selectedElementIndex) + 1
        sessionStorage.setItem('indexesObj', JSON.stringify(indexesObj));
        document.querySelector(`[index="0"]`).classList.add('selected-in-section')
        return document.querySelector(`[index="0"]`).click()
      }
    }

    else if (keyName === 'ArrowDown') {

      const nextSectionItem =
        next_section_item_index ? document.querySelector(`[index="${+next_section_item_index}"]`)
          : document.querySelector(`[section-index="${+selectedElement_sectionIndex + 1}"]`)
      if (nextSectionItem) {
        nextSectionItem.click();
      }
    }

    else if (keyName === 'ArrowUp') {

      const prevSectionItem =
        prev_section_item_index ? document.querySelector(`[index="${+prev_section_item_index}"]`)
          : document.querySelector(`[section-index="${+selectedElement_sectionIndex - 1}"]`)
      if (prevSectionItem) {
        prevSectionItem.click();
      }
    }

    else if (keyName === 'Enter') {

      if (selectedElement) {

        if (window.location.pathname === '/page1') {
          let DBOpenReq = indexedDB.open('FoodDo', 1);
          DBOpenReq.addEventListener('error', (err) => { console.warn(err) });
          DBOpenReq.addEventListener('success', (ev) => {
            let db = ev.target.result;
            let tx = db.transaction('seats', 'readonly');
            let store = tx.objectStore('seats');

            let getReq = store.get(selectedElement.getAttribute('seat'));
            getReq.onsuccess = (ev) => {
              console.log(ev.target.result);
              evaluate({
                details: ev.target.result.menu_details,
                selected_seat: ev.target.result,
                Navigate: Navigate
              });
            }
          });
        }

        else if (window.location.pathname === '/page2') {
          selectedElement.querySelector('.click-handler-element').click();
        }
      }
      else
        return
    }

    else if (keyName === '-' || keyName === 'Delete') {
      if (window.location.pathname !== '/page2' || !selectedElement) return;
      const uuid = selectedElement.getAttribute('item-uuid')

      const targetSvg = document.querySelectorAll(`#${uuid}-minus-ico`);
      targetSvg && document.querySelectorAll(`#${uuid}-minus-ico`)[targetSvg.length - 1].click()
    }

    else if (keyName === '+') {
      if (window.location.pathname !== '/page2' || !selectedElement) return;
      const uuid = selectedElement.getAttribute('item-uuid')

      document.getElementById(`${uuid}-plus-ico`) &&
        document.getElementById(`${uuid}-plus-ico`).click()
    }
  }

  // Keyboard 
  useEffect(() => {
    document.addEventListener('keydown', keyDownListner);
    return () => document.removeEventListener("keydown", keyDownListner);
  }, [])


  const [searchInFocus, setSearchInFocus] = useState(true);

  useEffect(() => {

    if (window.location.pathname !== '/page1') return;
    const seat = sessionStorage.getItem('seat');
    if (seat) {
      console.log('seat', seat)
      setSelected_seat(seat);
    }
    else {
      setTimeout(() => {
        const element = document.querySelector('[index="0"]');
        setSelected_seat(element ? element.getAttribute('seat') : null);
      }, 300);
      console.log("no seat found");
    }
  }, []);

  useEffect(() => {

    if (window.location.pathname !== '/page2') return
    setTimeout(() => {
      const element = document.querySelector('[index="0"]');
      console.log(element);
      setSelectedItem(element ? element.getAttribute('item-name') : null);
    }, 300);
  }, []);

  var itemsArray = []; // for page 2 operation
  var categoryCount = 1
  var seatIndex = -1;
  var itemsIndex = -1;
  let sectionIndex = -1;
  let categoryIndex = -1;

  return (
    <div className='content-container' id='content-file-container'>
      {pathname === '/page3' ?
        <TabularContent /> :
        pathname === '/page1' ? (
          <>
            {outletState &&
              outletState.map(section => {

                // seatsState
                let sectionVisible;
                let seatsCollection = seatsState && seatsState
                  .filter(seat => seat.section_uuid === section.section_uuid
                    && seat.outlet_uuid === outletIdState);

                const isVisible = (seat) => seat.seat_status === '1';
                sectionVisible = seatsCollection && seatsCollection.some(isVisible);

                if (sectionVisible === false)
                  return;
                else {
                  sectionIndex++
                  return (
                    <div key={Math.random()} className='sectionDiv'>
                      <h1>{section.section_name}</h1>
                      <div className='content' id='seats_container' this-section-index={sectionIndex}>
                        {seatsCollection && seatsCollection.map(item => {

                          let onorder_seats = JSON.parse(localStorage.getItem('onorder_seats'));
                          let on_order = onorder_seats && onorder_seats.find(seat => seat.seat_uuid === item.seat_uuid) || null;
                          item.color = on_order ? 'red' : '#4AC959';

                          let yellow_seats = JSON.parse(localStorage.getItem('yellowOrders_seats'));
                          let is_yellow = yellow_seats && yellow_seats.find(seat => seat === item.seat_uuid) || null;
                          item.color = is_yellow ? 'yellow' : item.color;

                          let unplaced_orders = JSON.parse(localStorage.getItem('unplaced_orders'));
                          let unplaced_order = unplaced_orders && unplaced_orders.find(order => order.seat === item.seat_uuid) || null;
                          item.color = unplaced_order ? 'blue' : item.color;

                          if (item.seat_status === '0')
                            return;
                          else {
                            return (
                              <div
                                index={++seatIndex}
                                section-index={sectionIndex}
                                className={`seatSearchTarget`}
                                key={Math.random()}
                                seat-name={item.seat_name}
                                seat-code={item.seat_uuid}
                                seat={item.seat_uuid}
                                section={section.section_uuid}
                                section-name={section.section_name}
                                outlet={outletIdState}
                                style={{ margin: "5px" }}
                                onClick={() => { console.log('clicked'); setSelected_seat(item.seat_uuid) }}
                                onMouseDown={e => { console.log('mouse down'); setSelected_seat(item.seat_uuid) }}
                                onDoubleClick={() => evaluate({
                                  details: item.menu_details,
                                  selected_seat: item,
                                  Navigate: Navigate
                                })}
                              >
                                <Card
                                  on_order={on_order && on_order}
                                  key={item.seat_uuid}
                                  title1={item.title1}
                                  title2={item.seat_name}
                                  caption={item.caption}
                                  color={item.color}
                                  price={item.price}
                                  rounded
                                />
                              </div>
                            )
                          }
                        }
                        )}
                      </div>
                      {/* {
                        isItemAvilableOpen &&
                        <ItemAvilibility isItemAvilableOpen={isItemAvilableOpen} setIsItemAvilableOpen={setIsItemAvilableOpen} />
                      } */}
                    </div>
                  )
                }
              })}
            {/* {
              isPaymentOptionOpen.status &&
              <PaymentPopup isPaymentOptionOpen={isPaymentOptionOpen} setPaymentOptionOpen={setPaymentOptionOpen} />
            } */}
            <div className='searchBar'>
              <input
                type="search"
                placeholder='Search...'
                value={searchState}
                onClick={() => setSearchInFocus(true)}
                onBlur={() => setSearchInFocus(false)}
                onChange={e => handleSearch(e)}
                onKeyDown={e => {
                  if (e.key === '+' || e.key === '-' || e.shiftKey || e.ctrlKey) e.preventDefault()
                  if (e.key === 'Backspace') { e.target.value = ''; handleSearch(e) }
                }}
                autoFocus={searchInFocus}
              />
            </div>
            <div className="notification-container">
              <p className="notification-message"></p>
            </div>
          </>
        ) : pathname === '/page2' ? (
          <>
            {JSON.parse(sessionStorage.getItem('finalState')) && selectedBrand_Menu ?
              JSON.parse(sessionStorage.getItem('finalState')).menues.find(menu => menu.menu_uuid === selectedBrand_Menu).category_and_items.map((menu, i, array) => {

                categoryCount++
                const isVisible = (menu_item) => {
                  if (menu_item.menu_item_status === '1'
                    && menu_item.item_availability === '1'
                    && menu_item.item_status === '1')
                    return true
                };
                const categoryVisible = menu.menu_items.some(isVisible);

                if (!categoryVisible) {

                  let hiddenCategoriesArray = []
                  hiddenCategoriesArray.push(menu.category_uuid)
                  if (categoryCount === array.length)
                    sessionStorage.setItem('hiddenCategories', JSON.stringify(hiddenCategoriesArray))
                  return null
                }

                categoryIndex++
                return <div key={Math.random()} className='categoryDiv'>
                  <h1>{menu.category_name}</h1>
                  <div className='content' this-section-index={categoryIndex}>
                    {menu.menu_items.map(item => {

                      itemsArray.push(item);
                      const isAddon = item.menu_item_addons ? true : false;

                      if (item.menu_item_status === '0') return null
                      return <div
                        section-index={categoryIndex}
                        key={Math.random()}
                        index={++itemsIndex}
                        style={{ width: "max-content" }}
                        className={`itemDiv`}
                        item-name={item.item_name}
                        item-code={item.item_code}
                        item-uuid={item.item_uuid}
                        onMouseDown={e => { console.log('mouse down'); setSelectedItem(item.item_name) }}
                        onClick={() => { setSelectedItem(item.item_name) }}
                      >
                        <Card
                          key={Math.random()}
                          title1={item.title1}
                          title2={item.item_name}
                          color={item.item_mode === '1' ? '#4AC959' : 'red'}
                          price={item.menu_item_price}
                          item={item}
                          onclickFunction={isAddon ? modalViewHandler : cartHandler}
                        />
                      </div>
                    })
                    }
                    {sessionStorage.setItem('items', JSON.stringify(itemsArray))}
                  </div>
                </div>
              }) : ''
            }
            {/* {modalState.isVisible && <Popup
              modalState={modalState}
              setModalState={setModalState} />} */}
            {/* {
              isPaymentOptionOpen.status &&
              <PaymentPopup isPaymentOptionOpen={isPaymentOptionOpen} setPaymentOptionOpen={setPaymentOptionOpen} />
            } */}
            <div className='searchBar'>
              <input
                type="search"
                placeholder='Search...'
                value={searchState}
                onClick={() => setSearchInFocus(true)}
                onBlur={() => setSearchInFocus(false)}
                onChange={e => handleSearch(e)}
                onKeyDown={e => {
                  if (e.key === '+' || e.key === '-' || e.shiftKey || e.ctrlKey) e.preventDefault()
                  if (e.key === 'Backspace') { e.target.value = ''; handleSearch(e) }
                }}
                autoFocus={searchInFocus}
              />
            </div>
            <div className="notification-container">
              <p className="notification-message"></p>
            </div>
          </>
        ) : pathname === '/orders' ? (
          <OrdersContent />
        ) : ''
      }
      
    </div >
  )
}

export default Content