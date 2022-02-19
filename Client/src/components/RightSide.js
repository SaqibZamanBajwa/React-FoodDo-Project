import React, { useState, useEffect } from 'react'
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Route, Routes, useLocation } from 'react-router-dom'
import Content from './Content'
import Header from './Header'
import HorizontalTabs from './HorizontalTabs'
import Info from './Info'
import VerticalTabs from './VerticalTabs'

const RightSide = ({ setIsItemAvilableOpen, isItemAvilableOpen }) => {
  const { pathname } = useLocation()
  const [isPaymentOptionOpen, setPaymentOptionOpen] = useState({ status: false, amount: 0 })

  useEffect(() => {
    isPaymentOptionOpen && sessionStorage.setItem('is-payment-popup', isPaymentOptionOpen.status);
  }, [isPaymentOptionOpen]);


  return (
    <div className='right-side'>
      <Header />
      <HorizontalTabs />
      <div style={{ display: 'flex', height: '100%' }}>
        {pathname != '/page2' ?
          <VerticalTabs />
          : null
        }
        <Content setIsItemAvilableOpen={setIsItemAvilableOpen} isItemAvilableOpen={isItemAvilableOpen} isPaymentOptionOpen={isPaymentOptionOpen} setPaymentOptionOpen={setPaymentOptionOpen} />
        {pathname == '/page1' }
          
      </div>
    </div>
  )
}

export default RightSide
