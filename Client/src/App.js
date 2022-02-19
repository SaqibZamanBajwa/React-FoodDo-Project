import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import React from 'react'
import './css/App.css';
import './css/home.css';
import './css/kds.css'
import "./css/itemavilibility.css";
import "./css/paymentpopup.css";
import "./css/saleinvoioce.css";
import "./css/dailysummary.css";
import "./css/uploader.css";


import State from './context/state'
import FrontPage from './containers/FrontPage';
import Page1 from './containers/Page1';
import Page3 from './containers/Page3';
import Login from './components/auth/Login';
import running_order_firebase from './components/running_order_firebase';

class App extends React.Component {

  constructor() {
    super()
    const token = localStorage.getItem('token')
    if (!token && window.location.pathname !== '/login') {
      window.location.pathname = '/login'
    }

    else {
      const IntervalId = setInterval(() => {
        if (localStorage.getItem('outlet_uuid') !== null && sessionStorage.getItem('haveRead') !== 'true') {
          running_order_firebase.ReadValueFromFirebase(localStorage.getItem('outlet_uuid'))
          sessionStorage.setItem('haveRead', true);
          clearInterval(IntervalId);
        }
      }, 500);
    }
  }


  render() {
    return (
      <State>
        <div className="App">
          {/* <LeftPanel /> */}

          <Router>
            <Routes>
              <Route path='' element={<FrontPage/>}/>
              <Route path='/page1' element={<Page1 />} />
              <Route path='/page3' element={<Page3 />} />
              <Route path='/login' element={<Login />} />
            </Routes>
          </Router>
        </div>
      </State>)
  }
}

export default App;
