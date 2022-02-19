import React, { useContext, useEffect, useState } from 'react'
import Context from '../context/context'

const HorizontalTabs = () => {

  const context = useContext(Context);
  const { finalState, selectedBrand_Menu, setSelectedBrand_Menu, seatsState, setSeatsState } = context;
  const [state, setState] = useState('')

  useEffect(() => {
    if (!finalState) {
      setState(JSON.parse(sessionStorage.getItem('finalState')));
    };
  }, [])

  useEffect(() => {

    window.location.pathname === '/page2' && setSelectedBrand_Menu(
      finalState ? finalState.brands[0].menu_uuid
        : state ? state.brands[0].menu_uuid : ''
    )
    window.location.pathname === '/page2' && sessionStorage.setItem('brand', finalState ? JSON.stringify(finalState.brands[0])
      : state ? JSON.stringify(state.brands[0]) : '')
  }, [finalState, state]);

  function onclick(params) {
    setSelectedBrand_Menu(params.menu_uuid)
    sessionStorage.setItem('brand', JSON.stringify(params))
  }

  function hideSectionName() {
    Array.from(document.getElementsByClassName('sectionDiv')).forEach(section => {

      const divsDisplayStatus = [];
      Array.from(section.getElementsByClassName('seatSearchTarget')).forEach(div => {
        if (div.style.display === 'none') divsDisplayStatus.push("hidden")
        else divsDisplayStatus.push("visible")
      })

      const shouldSectionVisible = divsDisplayStatus.includes('visible')

      console.log(divsDisplayStatus);
      console.log(shouldSectionVisible);
      shouldSectionVisible ? section.style.display = 'block' : section.style.display = 'none'
    })
  }

  function showOccupiedSeats(e) {
    Array.from(document.getElementsByClassName('seats-tabs')).forEach(tab => tab.classList.remove('active'))
    e.currentTarget.classList.add('active')

    const occupiedSeats = JSON.parse(localStorage.getItem('onorder_seats'));
    if (occupiedSeats) {

      const seats = []
      console.log(occupiedSeats);
      occupiedSeats.forEach(obj => seats.push(obj.seat_uuid))

      let DBOpenReq = indexedDB.open('FoodDo', 1);
      DBOpenReq.addEventListener('error', (err) => { console.warn(err) });
      DBOpenReq.addEventListener('success', (ev) => {
        let tx = ev.target.result.transaction('seats', 'readonly');
        let store = tx.objectStore('seats');

        let getReq = store.getAll();
        getReq.onsuccess = (ev) => {

          let seats_collection = ev.target.result;
          seats_collection.sort((a, b) => a.seat_sort_order - b.seat_sort_order);

          console.log(seats_collection);
          const filteredSeats = seats_collection.filter(seat => seats.includes(seat.seat_uuid))
          console.log(filteredSeats);
          setSeatsState(filteredSeats)
        };
      })
    }
    else { setSeatsState([]) }
  }

  function showUnoccupiedSeats(e) {
    Array.from(document.getElementsByClassName('seats-tabs')).forEach(tab => tab.classList.remove('active'))
    e.currentTarget.classList.add('active')

    const occupiedSeats = JSON.parse(localStorage.getItem('onorder_seats'));
    if (occupiedSeats) {

      const seats = []
      console.log(occupiedSeats);
      occupiedSeats.forEach(obj => seats.push(obj.seat_uuid))

      let DBOpenReq = indexedDB.open('FoodDo', 1);
      DBOpenReq.addEventListener('error', (err) => { console.warn(err) });
      DBOpenReq.addEventListener('success', (ev) => {
        let tx = ev.target.result.transaction('seats', 'readonly');
        let store = tx.objectStore('seats');

        let getReq = store.getAll();
        getReq.onsuccess = (ev) => {

          let seats_collection = ev.target.result;
          seats_collection.sort((a, b) => a.seat_sort_order - b.seat_sort_order);

          console.log(seats_collection);
          const filteredSeats = seats_collection.filter(seat => !seats.includes(seat.seat_uuid))
          console.log(filteredSeats);
          setSeatsState(filteredSeats)
        };
      })
    }
    else showAllSeats(e)
  }

  function showAllSeats(e) {
    Array.from(document.getElementsByClassName('seats-tabs')).forEach(tab => tab.classList.remove('active'))
    e.currentTarget.classList.add('active')

    let DBOpenReq = indexedDB.open('FoodDo', 1);
    DBOpenReq.addEventListener('error', (err) => { console.warn(err) });
    DBOpenReq.addEventListener('success', (ev) => {
      let tx = ev.target.result.transaction('seats', 'readonly');
      let store = tx.objectStore('seats');

      let getReq = store.getAll();
      getReq.onsuccess = (ev) => {

        let seats_collection = ev.target.result;
        seats_collection.sort((a, b) => a.seat_sort_order - b.seat_sort_order);
        setSeatsState(seats_collection);
      };
    })
  }

  return (
    <div className='horizontal-tabs'>
      {window.location.pathname === '/page1' && <>
        <div className="seats-tabs tabs active" onClick={e => showAllSeats(e)}>All</div>
        <div className="seats-tabs tabs" onClick={e => showOccupiedSeats(e)}>Occupied</div>
        <div className="seats-tabs tabs" onClick={e => showUnoccupiedSeats(e)}>Unoccupied</div>
      </>}
      {window.location.pathname === '/page2' && finalState ? finalState.brands.length > 1 && finalState.brands.map(brand => {
        return <div
          key={Math.random()}
          className="tabs"
          onClick={() => onclick(brand)}
        >
          {brand.brand_name}</div>
      })
        : window.location.pathname === '/page2' && state ? state.brands.length > 1 && state.brands.map(brand => {
          return <div
            key={Math.random()}
            className="tabs"
            onClick={() => onclick(brand)}
          >
            {brand.brand_name}</div>
        }) : ''}
    </div>
  )
}

export default HorizontalTabs
