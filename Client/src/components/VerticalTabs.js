import React from 'react'
import { useNavigate } from 'react-router-dom'

const VerticalTabs = () => {
  const Navigate = useNavigate()
  return (
    <div className='vertical-tabs' style={{ height: window.location.pathname === '/orders' ? 'calc(100vh - 50px)' : 'calc(100vh - 110px)'}}>
      
    </div>
  )
}

export default VerticalTabs
