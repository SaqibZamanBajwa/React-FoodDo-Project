import React from 'react'
import { Link } from 'react-router-dom'

const pages = [
  {
    page: 'Page1',
    path: '/page1'
  },
  // {
  //   page: 'Page2',
  //   path: '/page2'
  // },
  {
    page: 'Page3',
    path: '/page3'
  },
  // {
  //   page: 'Page4',
  //   path: '/page4'
  // },
  // {
  //   page: 'Page5',
  //   path: '/page5'
  // },
]

const FrontPage = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, width: '100%', padding: 20 }}>
      {pages.map(page => (
        <Link key={Math.random()} to={page.path} style={{ padding: 10, background: 'green', color: 'white', borderRadius: 10, textDecoration: 'none' }}>{page.page}</Link>
      ))}
    </div>
  )
}

export default FrontPage