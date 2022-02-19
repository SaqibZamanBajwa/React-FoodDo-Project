import React from 'react'

const SubHeader = ({ title, headerActions, ...otherProps }) => {
  return (
    <div className='sub-header' {...otherProps}>
      <h1>{title}</h1>
      <div>
        {headerActions}
      </div>
    </div>
  )
}

export default SubHeader
