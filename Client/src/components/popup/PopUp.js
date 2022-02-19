import React, { useState } from "react";
import "./PopUp.css";

const PopUp = ({PopupHandler, ssuser }) => {
  const [uDetails, setUDetails] = useState({});
  const [user_permissions, setUDetailsP] = useState([])
  const[statusMsg, setStatusMsg] = useState("");

  const handleInputs = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    setUDetails({ ...uDetails, [name]: value });
  };

  const handleInputPer = (e) => {
    setUDetailsP( [...user_permissions, e.target.value]);
  };

  const clearUDetails = (e) => {
    setUDetails(() => {});
  }

  const postData = async (e) => {
    e.preventDefault();
    const {
      user_title,
      user_name,
      user_mobile_number,
      user_email,
      Org_access,
      user_status,
    } = uDetails;

    if(!user_title || !user_name || !user_mobile_number || !user_email || !Org_access || !user_status){
      return (
        setStatusMsg("All fields Required")
      )
    }else if(user_permissions == ""){
      return (
        setStatusMsg("Select atleast one permission")
      )
    }
    else{
    let res = await fetch("http://localhost:8000/user/postUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        user_title,
        user_name,
        user_mobile_number,
        user_email,
        user_permissions,
        Org_access,
        user_status,
        user_type : "0"
      })
    });
    if(res.status === 200){
      setStatusMsg("Successfully Added")
      setTimeout(() =>{
        PopupHandler()
      },500)
      clearUDetails();
    }else if(res.status === 400){
        setStatusMsg("User already exists")
    }else if(res.status === 401){
        setStatusMsg("email already used")
    }else if(res.status === 402){
        setStatusMsg("try with another number")
    }else if(res.status === 500){
      setStatusMsg("Please try later") 
    }
  }
  };

  return (
    <div className="main-wrapper">
      <form className="popup__wrapper" method="POST" onSubmit={postData}>
        <div className="popup__header">
          <h1 className="popup__heading">Service & Support User</h1>
          <button
            className="header__button"
            onClick={PopupHandler}
          >
            X
          </button>
        </div>

        <div className="popup__container">
          <div className="pop__box">
            <p>
              User Title <span>*</span>
            </p>
            <input
              type="text"
              name="user_title"
              placeholder="42 Char"
              onChange={handleInputs}
            />

            <p>User Mobile</p>
            <input
              type="number"
              name="user_mobile_number"
              placeholder="15 Char"
              onChange={handleInputs}
            />

            <p>Permissions</p>
            
            <div className="label_container">
            <label>
            <input
              type="checkbox"
              name="user_permissions"
              value="Lorem1"
              placeholder="42 Char No Space"
              onFocus={handleInputPer}
                
            />
            Lorem 1
            </label>
            <label>
            <input
              type="checkbox"
              name="user_permissions"
              value="Lorem2"
              placeholder="42 Char No Space"
              onFocus={handleInputPer}
              // required
                
            />
            Lorem 2
            </label>
            <label>
            <input
              type="checkbox"
              name="user_permissions"
              value="Lorem3"
              placeholder="42 Char No Space"
              onFocus={handleInputPer}
            />
            Lorem 3
            </label>
            </div>
           
          </div>
          <div className="pop__box">
            <p>
              Username <span>*</span>
            </p>
            <input
              type="text"
              name="user_name"
              placeholder="42 Char No Space"
              onChange={handleInputs}
            />
            <p>
              User Email <span>*</span>
            </p>
            <input
              type="email"
              name="user_email"
              placeholder="42 Char,No Space"
              onChange={handleInputs}
            />

            <p>Organization Access</p>
            <input
              type="radio"
              name="Org_access"
              value="0"
              placeholder="All/Self"
              onChange={handleInputs}
            /><label>All</label>
            <input
              type="radio"
              name="Org_access"
              value="1"
              placeholder="All/Self"
              onChange={handleInputs}
            /><label>Self</label>
            <br />

            <p>Status
            <input
              type="checkbox"
              name="user_status"
              onChange={handleInputs}
            />
            </p>
          </div>
        </div>
        <div className="pop__btnSave">
        <button className="pop__button" type="submit">
          save
        </button>
        </div>
        <h6>{statusMsg}</h6>
        
      </form>
    </div>
  );
};

export default PopUp;
