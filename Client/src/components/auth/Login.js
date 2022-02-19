import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import running_order_firebase from '../running_order_firebase';

const Login = (props) => {

    const Navigate = useNavigate();
    const [credentials, setCredentials] = useState({ username: "", password: "" });

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value })
    }

    const loginHandler = async (e) => {
        e.preventDefault();

        fetch("https://api.myfooddo.com/user/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        })
            .then(res => res.json())
            .then(content => {

                if (!content.token) return alert(content.message)

                console.log('Login Succeed')
                localStorage.setItem('token', content.token);
                localStorage.setItem('outlet_uuid', content.outlet_uuid);
                localStorage.setItem('user_uuid', content.user_uuid);

                fetch('https://api.myfooddo.com/outlet/getOutletDetail', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({ outlet_uuid: localStorage.getItem('outlet_uuid') })
                })
                    .then(res => res.json())
                    .then(content => {

                        const result = content.result;
                        const stores = ["running_orders", "unsynced_files", "Orders"];

                        result.forEach(json => {
                            const key = Object.keys(json)[0].toLocaleLowerCase()
                            stores.push(key)
                        });

                        let db = null;
                        let objectStore = null;
                        let DBOpenReq = window.indexedDB.open('FoodDo', 1);

                        DBOpenReq.addEventListener('error', (err) => {
                            console.warn(err)
                        });

                        DBOpenReq.addEventListener('success', (ev) => {

                            db = ev.target.result;
                            function addNewCollection(name, json) {

                                let tx = db.transaction(name, 'readwrite');

                                if (!Array.isArray(json)) {

                                    json.UUID = json[`${name}_uuid`]
                                    let store = tx.objectStore(`${name}`);
                                    const addReq = store.add(json);
                                }

                                Array.isArray(json) && json.length > 0 && json.forEach((obj, index) => {

                                    let key;
                                    if (name === 'payment_modes')
                                        obj.UUID = obj.payment_mode_uuid;
                                    if (name === 'seats')
                                        obj.UUID = obj.seat_uuid;
                                    else
                                        obj.UUID = obj[`${name}_uuid`] || `${index}`

                                    let store = tx.objectStore(`${name}`);
                                    const addReq = store.put(obj);
                                })

                            }

                            result.forEach(json => {
                                const key = Object.keys(json)[0].toLocaleLowerCase()
                                addNewCollection(key, json[key]);
                            })

                            Navigate('/page1');
                        });

                        DBOpenReq.addEventListener('upgradeneeded', (ev) => {

                            db = ev.target.result;
                            stores.forEach((store, i) => {
                                if (!db.objectStoreNames.contains(store)) {
                                    objectStore = db.createObjectStore(store, {
                                        keyPath: 'UUID',
                                    });
                                    console.log(store);
                                    if (i === stores.length - 1) {
                                        running_order_firebase.ReadValueFromFirebase(localStorage.getItem('outlet_uuid'))
                                        sessionStorage.setItem('haveRead', true);
                                    }
                                }
                            })
                        });

                    })
                    .catch(err => console.warn('error in fetching details', err))
            })
            .catch(err => console.log('error', err))
    }
    return (
        <div id="login-container">
            <form onSubmit={loginHandler}>
                <div className="input-container">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input type="username" className="form-input" name="username" id="username" value={credentials.username} onChange={onChange} required />
                </div>
                <div className="input-container">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" className="form-input" name="password" id="password" value={credentials.password} onChange={onChange} min="8" required />
                </div>
                <button type="submit" className="submit-btn">Log In</button>
            </form>
        </div>
    )
}

export default Login