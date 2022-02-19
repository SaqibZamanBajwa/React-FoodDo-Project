import React from "react";
import { useNavigate } from "react-router-dom";
// import PopUp from "./popup/PopUp";

const Header = () => {
  const Navigate = useNavigate();

  function logout() {
    // let request = indexedDB.open('FoodDo', 1);
    // var DBDeleteReq = indexedDB.deleteDatabase("FoodDo");
    // DBDeleteReq.onerror = (e) => console.log('error', e.target.result)
    // DBDeleteReq.onsuccess = function (event) {
    //   console.log("database deleted");
    // }
    sessionStorage.clear();
    localStorage.clear();
    Navigate("/login");
  }

  return (
    <>
      <div className="header">
        <h1>
          Outlet <span>Name</span>
        </h1>

        <div className="links">
          <div className="link" onClick={() => Navigate("/page1")}>
            Dashboard
          </div>
          <div className="link" onClick={logout}>
            Logout
          </div>
        </div>
      </div>
     
      {/* <PopUp/> */}
    </>
  );
};

export default Header;
