import React, { useState } from "react";
import { useEffect } from "react";
import PopUp from "./popup/PopUp";
import PopupEditBtn from "./PopupEditBtn";
import useToggle from "./Toggler";
import '../css/App.css';
import { useNavigate } from "react-router-dom";

const content = [
  {
    title1: "Floor 1",
    title2: "Table 10",
    caption: "Slide Window",
    isRed: false,
    price: 7856,
  },
  {
    title1: "Floor 1",
    title2: "Table 10",
    caption: "Slide Window",
    isRed: true,
    price: 7856,
  },
  {
    title1: "Floor 1",
    title2: "Table 10",
    caption: "Slide Window",
    isRed: false,
    price: 7856,
  },
  {
    title1: "Floor 1",
    title2: "Table 10",
    caption: "Slide Window",
    isRed: false,
    price: 7856,
  },
  {
    title1: "Floor 1",
    title2: "Table 10",
    caption: "Slide Window",
    isRed: true,
    price: 7856,
  },
  {
    title1: "Floor 1",
    title2: "Table 10",
    caption: "Slide Window",
    isRed: false,
    price: 7856,
  },
  {
    title1: "Floor 1",
    title2: "Table 10",
    caption: "Slide Window",
    isRed: false,
    price: 7856,
  },
  {
    title1: "Floor 1",
    title2: "Table 10",
    caption: "Slide Window",
    isRed: true,
    price: 7856,
  },
  {
    title1: "Floor 1",
    title2: "Table 10",
    caption: "Slide Window",
    isRed: false,
    price: 7856,
  },
  {
    title1: "Floor 1",
    title2: "Table 10",
    caption: "Slide Window",
    isRed: false,
    price: 7856,
  },
  {
    title1: "Floor 1",
    title2: "Table 10",
    caption: "Slide Window",
    isRed: true,
    price: 7856,
  },
  {
    title1: "Floor 1",
    title2: "Table 10",
    caption: "Slide Window",
    isRed: false,
    price: 7856,
  },
];
const TabularContent = () => {
  const [openPopup, setOpenPopup] = useToggle(true);
  const [openPopupE, setOpenPopupE] = useToggle(true);
  const [SSUserList, setSSUserList] = useState([])
  const [noUser, setNoUser] = useState([])
  const Pass = useNavigate();

   
  
  const getSSUserList = async() =>{
    try{
      let res = await fetch("http://localhost:8000/user/getUser", { 
      method: "GET",
      })
      setSSUserList(await res.json())
    }catch(err){
      return(
      console.log(err))
    }
  }

   useEffect(()=>{
    getSSUserList();
   },[])


   const PopupHandler = () => {
    setOpenPopup(!openPopup);
  }

   const PopupEHandler = () => {
    setOpenPopupE(!openPopupE);
  }


   const handleEdit = (ssuser)  => {
    setOpenPopupE(!openPopupE);
    
    setNoUser(ssuser);
    // <PopupEditBtn PopupEHandler={PopupEHandler} ssuser={ssuser}/>
    console.log(`${ssuser.user_email}`)
   

    }


  return (
    <>
       <button className="addNew_btn"
        style={
          {
            width: "170px",
            margin: "30px auto 10px auto",
            padding: "10px 40px",
            // backgroundColor: "#4472C4",
            backgroundColor: "#DEFAE2",
            fontSize: "15px",
            borderRadius: "5px",
            border: "0",
            color: "black",
            fontSize: "bold",
            cursor: "pointer",
          }
        }
        onClick={() => {
          setOpenPopup(true);
        }}
      >
        + Add New
      </button>

      {!openPopup ? (
        <PopUp PopupHandler={PopupHandler}/>
      ) : null}
      {
        !openPopupE ?
      <PopupEditBtn PopupEHandler={PopupEHandler} ssuser={noUser}/>
        : null
      }

      <div className="tabular-content">

     
        <table>
          <thead>
            <tr>
              <th>User Title</th>
              <th>Username</th>
              <th>User Email</th>
              <th>User Mobile</th>
              <th>Organization Access</th>
              <th>Details</th>
            </tr>
          </thead>
          {SSUserList ?
            SSUserList.filter(el => el.user_type === "0")
            .map((ssuser) => {
              // if(ssuser.Org_access == "0"){
              //   return ssuser.Org_access = "All"
              // }else if(ssuser.Org_access == "1"){
              //   return ssuser.Org_access = "Self"
              // }
              return (
                <tbody key={ssuser._id}>
                  <tr>
                    <td>{ssuser.user_title}</td>
                    <td>{ssuser.user_name}</td>
                    <td>{ssuser.user_email}</td>
                    <td>{ssuser.user_mobile_number}</td>
                    <td>{ssuser.Org_access}</td>
                    <td><button key = {ssuser._id}  className="table__btn" onClick={() => handleEdit(ssuser) }>Edit</button></td>
                  </tr> 

                </tbody>
              )
            }) : "no user found"
          }
          
        </table>
      </div>
    </>
  );
};

export default TabularContent;