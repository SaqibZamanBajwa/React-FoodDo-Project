import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Context from '../../context/context'

const OrdersContent = () => {

    return (
        <div>
            <div className='sectionDiv'>
                <h1>TakeAway</h1>
                <Card title={'TakeAway'} />
            </div>
            <div className='sectionDiv'>
                <h1>Delivery</h1>
                <Card title={'Delivery'} />
            </div>
            <div className='sectionDiv'>
                <h1>Schedule</h1>
                <Card title={'Schedule'} />
            </div>
        </div>
    );
};

function Card({ title }) {

    const Navigate = useNavigate()
    const context = useContext(Context);
    const { evaluate } = context;

    return (
        <div onDoubleClick={() => evaluate({ Navigate: Navigate, order_type: title.toLowerCase() })}>
            <button className={`card-focus rounded`}>
                <div className={`card rounded`}>
                    <p className='title2'>+ {title}</p>
                    <p className='caption'></p>
                    <div className={`horizontal-line`} style={{ background: `#44cd4a` }}></div>
                    {/* {color !== '#4AC959' && on_order && <div className='seatTimer'>
                        <div>{time}</div>
                        <div>(Rs.{on_order ? on_order.price : 0})</div>
                    </div>} */}
                </div>
            </button>
        </div>
    )
}

export default OrdersContent;
