import React, { useState } from 'react'

const Card = ({ title2, caption, color, price, rounded, item, onclickFunction, on_order }) => {

  let page = window.location.pathname === '/page1' && true;
  let timeGap = on_order ? Date.now() - on_order.created_at : 0
  let timeGapStr = new Date(timeGap).toUTCString().slice(17, -3)
  const [time, setTime] = useState(page && timeGapStr);

  setInterval(() => {
    let time_gap = on_order && Date.now() - on_order.created_at
    time_gap = new Date(time_gap).toUTCString().slice(17, -3)
    page && setTime(time_gap)
  }, 1000);

  function itemClickHandle(selected_item, addons, multi, action, isParcel, seat, instruction) {

    let DBOpenReq = indexedDB.open('FoodDo', 1);
    DBOpenReq.addEventListener('error', (err) => { console.warn(err) });
    DBOpenReq.addEventListener('success', (ev) => {
      let db = ev.target.result;
      let tx = db.transaction('running_orders', 'readonly');
      let store = tx.objectStore('running_orders');

      let getReq = store.get(seat);
      getReq.onsuccess = (orderEvent) => {
        const order = orderEvent.target.result;
        if (!order || order.payment_status !== 1)
          onclickFunction(selected_item, addons, multi, action, isParcel, seat, instruction)
        else {
          document.querySelector('.notification-message').innerText = 'Adding Items not allowed after Payment is Done';
          document.querySelector('.notification-container').classList.add('active-red');
          setTimeout(() => {
            document.querySelector('.notification-container').classList.remove('active-red')
          }, 2000);
        }
      }
    })
  }

  return (
    <>
      {page &&
        <div>
          <button className={`card-focus ${rounded ? 'rounded' : ''}`}>
            <div className={`card ${rounded ? 'rounded' : ''}`}>
              <p className='title2'>{title2}</p>
              <p className='caption'>{caption}</p>
              <div className={`horizontal-line`} style={{ background: `${color}` }}></div>
              {color !== '#4AC959' && on_order && <div className='seatTimer'>
                <div>{time}</div>
                <div>(Rs.{on_order ? on_order.price : 0})</div>
              </div>}
            </div>
          </button>
        </div>
      }
      {window.location.pathname === '/page2' &&
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            console.log(item);
            itemClickHandle(item, [], [], "increment", false, sessionStorage.getItem('seat'))
          }}
          onClick={(e) => {
            itemClickHandle(item, [], [], "increment", false, sessionStorage.getItem('seat'))
          }}
          className='click-handler-element'
        >
          <button className={`card-focus ${rounded ? 'rounded' : ''}`}>
            <div className={`card ${rounded ? 'rounded' : ''}`}>
              <p className='title2'>{title2}</p>
              <p className='caption'>{caption}</p>
              <div className={`horizontal-line ${color}`}></div>
              <p className={`price ${color}`}>{price}</p>
            </div>
          </button>
        </div>}
    </>
  )
}

export default Card
