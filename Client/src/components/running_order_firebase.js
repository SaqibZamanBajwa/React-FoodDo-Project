import FBConfig from '../FBConfig'
class Running_order_firebase {

    OrgId;
    SynckData = (OrgId) => {
        this.ReadIndexDbRuningOrders(this.GetDataAndSynch);
        this.OrgId = OrgId;
    }

    GetDataAndSynch = (LocalOrder) => {
        let templocalorder = LocalOrder.filter(function (x) {
            return x.IsSynched == null || x.IsSynched == 0;
        });
        for (let i = 0; i < templocalorder.length; i++) {
            debugger;
            var FbInserOrder = JSON.parse(JSON.stringify(templocalorder[i]));
            FBConfig.set(FBConfig.ref(FBConfig.db, this.OrgId + "/RunnigOrders/" + templocalorder[i].order_uuid),
                FbInserOrder
            ).then(() => {
                // console.log('Successfully set');
                this.UpdatedSynchOrders(templocalorder[i].order_uuid, templocalorder);
            });
        }
    }

    UpdatedSynchOrders = (order_uuid, LocalOrder) => {
        var LocalOrderObj = LocalOrder.find(x => {
            return x.order_uuid == order_uuid
        });
        if (LocalOrderObj != null) {
            LocalOrderObj.IsSynched = 1;
            var order_kot_details = LocalOrderObj.order_kot_details;
            if (order_kot_details != null && order_kot_details.length > 0) {
                for (let i = 0; i < order_kot_details.length; i++) {
                    order_kot_details[i].IsSynched = 1;
                }
                LocalOrderObj.order_kot_details = order_kot_details;
            }
            this.WriteIndexDbrunnigOrders(LocalOrderObj);
        }
    }

    ReadIndexDbRuningOrders = (CallBackFun, ExtraaParamValue = null) => {
        let DBOpenReq = indexedDB.open('FoodDo', 1);
        DBOpenReq.addEventListener('error', (err) => { return null });
        DBOpenReq.addEventListener('success', (ev) => {
            var tx = ev.target.result.transaction('running_orders', 'readwrite');
            var Running_orders = tx.objectStore('running_orders');
            let getOrders = Running_orders.getAll()
            getOrders.onsuccess = async (orderReq) => {
                let collection = orderReq.target.result
                //  console.log("count data",collection.length);
                if (ExtraaParamValue == null) {
                    CallBackFun(collection);
                } else {
                    CallBackFun(collection, ExtraaParamValue);
                }

            }
        });
    }
    WriteIndexDbrunnigOrders(ObjOrder) {
        let DBOpenReq = indexedDB.open('FoodDo', 1);
        DBOpenReq.addEventListener('error', (err) => { console.warn(err) });
        DBOpenReq.addEventListener('success', (ev) => {
            var TblrRunningOrder = ev.target.result.transaction('running_orders', 'readwrite');
            var store = TblrRunningOrder.objectStore('running_orders');
            store.put(ObjOrder);
        });
    }

    ReadValueFromFirebase(OrgId) {
        //  var IsFBInitialized = localStorage.getItem('IsFBInitialized');
        //  debugger;
        //  if (IsFBInitialized == null || IsFBInitialized === "") {
        //      console.log('FB function called')
        //      localStorage.setItem('IsFBInitialized', 1);
        const commentsRef = FBConfig.ref(FBConfig.db, OrgId + '/RunnigOrders/');
        FBConfig.onChildAdded(commentsRef, (data) => {
            this.ReadIndexDbRuningOrders(this.AddOrUpdateNewOrderInLocalDb, data.val());
        });
        FBConfig.onChildChanged(commentsRef, (data) => {
            this.ReadIndexDbRuningOrders(this.AddOrUpdateNewOrderInLocalDb, data.val());
        });
        //}
    }

    AddOrUpdateNewOrderInLocalDb(Localorders, NewChildValue) {
        if (NewChildValue != null) {
            var LocalOrderObj = Localorders.find(x => {
                return x.order_uuid == NewChildValue.order_uuid
            });
            if (LocalOrderObj == null) {
                //  this.
                //new running_order_firebase().UpdatedSynchOrders(NewChildValue.order_uuid,NewChildValue);
                Running_order_firebase.UpdateorderInSeating(1, NewChildValue);
            } else {
                LocalOrderObj.IsSynched = 1;
                var order_kot_details = LocalOrderObj.order_kot_details;
                var Firebase_Kot_details = NewChildValue.order_kot_details;
                if (order_kot_details != null && order_kot_details.length > 0) {
                    for (let i = 0; i < Firebase_Kot_details.length; i++) {
                        //order_kot_details[i].IsSynched = 1;
                        let TempKotObj = order_kot_details.find(x => {
                            return x.kot == Firebase_Kot_details[i].kot
                        });
                        if (TempKotObj == null) {
                            Firebase_Kot_details[i].IsSynched = 1;
                            order_kot_details.push(Firebase_Kot_details[i]);
                        }
                    }
                    LocalOrderObj.order_kot_details = order_kot_details;
                    //this.WriteIndexDbrunnigOrders(LocalOrderObj)
                    Running_order_firebase.UpdateorderInSeating(0, LocalOrderObj);
                }
            }
        }
    }
    static UpdateorderInSeating(isNewOrder, ObjOrder) {

        //isNewOrder=1 means it is new order
        let DBOpenReq = indexedDB.open('FoodDo', 1);

        DBOpenReq.addEventListener('error', (err) => { console.warn(err) });
        DBOpenReq.addEventListener('success', (ev) => {

            let db = ev.target.result
            ObjOrder.order_kot_details.sort((a, b) => (+a.kot) - (+b.kot));

            if (ObjOrder.order_status !== 4) {
                let tx = db.transaction('running_orders', 'readwrite');
                let store = tx.objectStore('running_orders');

                isNewOrder === 1 ? store.add(ObjOrder) : store.put(ObjOrder)

                console.log("UpdateorderInSeating", ObjOrder);

                let onorder_seats = JSON.parse(localStorage.getItem('onorder_seats')) || [];
                let object = {
                    seat_uuid: ObjOrder.seat_uuid,
                    created_at: ObjOrder.created_at,
                    price: ObjOrder.order_total
                }

                const filteredSeats = onorder_seats.filter(obj => {
                    if (obj.seat_uuid !== ObjOrder.seat_uuid) {
                        console.log(obj.seat_uuid !== ObjOrder.seat_uuid);
                        console.log(obj.seat_uuid, ObjOrder.seat_uuid);
                        return obj
                    }
                })

                filteredSeats.push(object);
                localStorage.setItem('onorder_seats', JSON.stringify(filteredSeats));

                let yellowOrders = JSON.parse(localStorage.getItem('yellowOrders_seats')) || []
                yellowOrders = yellowOrders.filter(seat => seat !== ObjOrder.seat_uuid)

                if (ObjOrder.invoice_prints && ObjOrder.invoice_prints.length > 0)
                    yellowOrders.push(ObjOrder.seat_uuid)

                localStorage.setItem('yellowOrders_seats', JSON.stringify(yellowOrders))
                console.log(object);
            }
            else {
                let tx = db.transaction('Orders', 'readwrite');
                let store = tx.objectStore('Orders');

                isNewOrder === 1 ? store.add(ObjOrder) : store.put(ObjOrder)
                console.log("UpdateorderInSeating", ObjOrder);
            }

            let tx = db.transaction('outlet', 'readwrite');
            let store = tx.objectStore('outlet');
            const getOutlet = store.getAll();
            getOutlet.onsuccess = (e) => {
                let outlet = e.target.result[0];

                let order_number = ObjOrder.local_order_id;
                let kot_number = ObjOrder.order_kot_details[ObjOrder.order_kot_details.length - 1].kot;

                console.log(kot_number, order_number);

                outlet.invoice_series.forEach(series => {

                    if (series.user_uuid === localStorage.getItem('user_uuid')) {

                        series.next_kot_number = 1 + (+kot_number);
                        series.next_order_number = 1 + (+order_number);
                    }
                })
                store.put(outlet)
            }
        })
    }
}

const running_order_firebase = new Running_order_firebase();
export default running_order_firebase;