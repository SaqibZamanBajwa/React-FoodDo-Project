import React, { useContext, useEffect, useState } from 'react'
import LeftPanel from '../components/LeftPanel'
import RightSide from '../components/RightSide'
import Context from '../context/context'

const Page2 = () => {

  const context = useContext(Context);
  const { finalState, selectedBrand_Menu } = context;
  const [state, setState] = useState('')

  useEffect(() => {
    if (!finalState) {
      setState(JSON.parse(sessionStorage.getItem('finalState')));
    };
  }, [])

  return (
    <>
      <LeftPanel
        finalState={!finalState ? state : finalState}
        selectedBrand_Menu={selectedBrand_Menu} brands isCatogories
      />
      <RightSide
        finalState={!finalState ? state : finalState}
        selectedBrand_Menu={selectedBrand_Menu} quantityEditable
      />
    </>
  )
}

export default Page2
