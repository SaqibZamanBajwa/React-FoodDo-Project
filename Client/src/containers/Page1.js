import React, { useState } from 'react'
import LeftPanel from '../components/LeftPanel'
import RightSide from '../components/RightSide'

const Page1 = () => {
  const [isItemAvilableOpen, setIsItemAvilableOpen] = useState(false)
  return (
    <>
      <LeftPanel setIsItemAvilableOpen={setIsItemAvilableOpen} isItemAvilableOpen={isItemAvilableOpen} />
      <RightSide setIsItemAvilableOpen={setIsItemAvilableOpen} isItemAvilableOpen={isItemAvilableOpen} />
    </>
  )
}

export default Page1
