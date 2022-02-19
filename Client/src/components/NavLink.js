import React from 'react'
import { Link } from 'react-router-dom'
import { ViewGridIcon } from '@heroicons/react/solid'

const NavLink = ({ title, icon, isActive, menuList, setIsItemAvilableOpen, isItemAvilableOpen, draggable, href }) => {

  function categoryFilterHandler(e) {

    if (window.location.pathname !== '/page2') return
    Array.from(document.getElementsByClassName('nav-link')).forEach(element => {
      element.classList.remove('active')
    });
    e.target.parentElement.classList.add('active')

    Array.from(document.getElementsByClassName('categoryDiv')).forEach(category => {

      if (e.target.innerText === 'All') category.style.display = 'block';
      else if (category.querySelector('h1').innerText !== e.target.innerText)
        category.style.display = 'none';
      else
        category.style.display = 'block';
    })
  }

  return (
    <Link
      to={{ pathname: href }}
      style={{ color: "inherit", textDecoration: "none" }}
    >
      <div
        draggable={draggable}
        className={`nav-link ${title === "All" ? "active" : ""}`}
        style={{
          overflow: menuList ? "visible" : "visible",
          flexDirection: draggable ? "row" : "column",
          justifyContent: draggable ? "center" : "space-around",
        }}
        onClick={categoryFilterHandler}
      >
        {menuList && (
          <div className="menu">
            {menuList.map((menu) => (
              <div
                key={Math.random()}
                onClick={() =>
                  menu.name === "Item Avilibility" &&
                  setIsItemAvilableOpen(!isItemAvilableOpen)
                }
                className="item"
              >
                <a href={menu.link}>{menu.name}</a>
              </div>
            ))}
          </div>
        )}
        <>
          {draggable && (
            <ViewGridIcon
              style={{ width: 25, marginLeft: 10, cursor: "move" }}
            />
          )}
          {icon}
          <p>{title}</p>
        </>
      </div>
    </Link>
  );
}

export default NavLink