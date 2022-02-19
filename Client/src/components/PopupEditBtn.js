import React, {useState} from 'react';
import "./popup/PopUp.css"

const PopupEditBtn = ({PopupEHandler, ssuser}) => {
    const [uDetails, setUDetails] = useState({
      user_title : ssuser.user_title,
        user_name : ssuser.user_name,
        user_mobile_number : ssuser.user_mobile_number
    });
  const [user_permissions, setUDetailsP] = useState([])
    const[statusMsg, setStatusMsg] = useState("");
  
    // let data = localStorage.getItem(`${id}`);
    // alert(data);
    // console.log(data);
    const handleInputs = (e) => {
      let name = e.target.name;
      let value = e.target.value;
  
      setUDetails({ ...uDetails, [name]: value });
    };
    const handleInputPer = (e) => {
      setUDetailsP( [...user_permissions, e.target.value]);
    };
    
    const handleEdit = (e) =>{
      let name = e.target.name;
      let value = "";
      setUDetails({...uDetails, [name]:value})
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
  
      // if(!user_title || !user_name || !user_mobile_number|| !user_permissions || !Org_access){
      //   return (
      //     setStatusMsg("All fields Required")
      //   )
      // }
      // else{
      let res = await fetch("http://localhost:8000/user/putUser", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          _id:ssuser._id,
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
        console.log(res.data)
        setStatusMsg("Successfully Updated") 
        setTimeout(() =>{
          PopupEHandler()
        },500)
      }else if(res.status === 400){
        setStatusMsg("User already exists")
    }else if(res.status === 401){
        setStatusMsg("email already used")
    }else if(res.status === 402){
        setStatusMsg("try with another number")
    }else if(res.status === 500){
        setStatusMsg("Please try later") 
      }
    // }
    };
  
    return (
      <div className="main-wrapper">
        <form className="popup__wrapper" method="PUT" onSubmit={postData}>
          <div className="popup__header">
            <h1 className="popup__heading">Service & Support User</h1>
            <button
              className="header__button" 
              onClick={PopupEHandler}
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
                value={uDetails.user_title}
                placeholder="42 Char"
                onChange={handleInputs}
                onClick={handleEdit}
              />
  
              <p>User Mobile</p>
              <input
                type="number"
                value={uDetails.user_mobile_number}
                name="user_mobile_number"
                placeholder="15 Char"
                onChange={handleInputs}
                onClick={handleEdit}
              />
  
              <p>Permissions</p>
              
              <div className="label_container">
              <label>
              <input
                type="checkbox"
                value="Lorem1"
                name="user_permissions"
                placeholder="42 Char No Space"
                onFocus={handleInputPer}

              />
              Lorem 1
              </label>
              <label>
              <input
                type="checkbox"
                value="Lorem2"
                name="user_permissions"
                placeholder="42 Char No Space"
                onFocus={handleInputPer}
                

              />
              Lorem 2
              </label>
              <label>
              <input
                type="checkbox"
                value="Lorem3"
                name="user_permissions"
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
                value={uDetails.user_name}
                name="user_name"
                placeholder="42 Char No Space"
                onChange={handleInputs}
                onClick={handleEdit}

              />
              <p>
                User Email <span>*</span>
              </p>
              <input
                type="email"
                value={ssuser.user_email}
                name="user_email"
                placeholder="42 Char,No Space"
                onChange={handleInputs}
                disabled
              />
  
              <p>Organization Access</p>
              <input
                type="radio"
                value="0"
                name="Org_access"
                placeholder="All/Self"
                onChange={handleInputs}
                onClick={handleEdit}

              /><label>All</label>
              <input
                type="radio"
                value="1"
                name="Org_access"
                placeholder="All/Self"
                onChange={handleInputs}
                onClick={handleEdit}

              /><label>Self</label>
              <br />
  
              <p>Status
              <input
                type="checkbox"
                value={uDetails.user_status}
                name="user_status"
                onChange={handleInputs}
                checked
                disabled
              />
              </p>
            </div>
          </div>
          <div className="pop__btnSave">
          <button className="pop__button" type="submit">
            Update
          </button>
          </div>
          <h6>{statusMsg}</h6>
        </form>
      </div>
    );
  };
  
export default PopupEditBtn;
