import React from 'react'

const TableRowCollapse = () => {
  return (
    <tr className='collapse'>
      <td colSpan={4}>
        <table>
          <thead>
            <tr>
              <td colSpan={8}>
                <div className="collapse-nav">
                  <div className="collapse-nav-link active">General</div>
                  <div className="collapse-nav-link">Comments</div>
                  <div className="collapse-nav-link">Logs</div>
                </div>
              </td>
            </tr>
            <tr>
              <td>Created</td>
              <td>14/12/21 13:17</td>
              <td>By</td>
              <td>Ramesh</td>
              <td>Payment By</td>
              <td>Sanjay</td>
              <td>Preparation Status</td>
              <td>Ready</td>
            </tr>
            <tr>
              <td>Order</td>
              <td>A4125</td>
              <td>At</td>
              <td>First Floor - Table 5</td>
              <td>Payment Time</td>
              <td>14:04</td>
              <td>Delivery Status</td>
              <td>-</td>
            </tr>
            <tr>
              <td>Order Total</td>
              <td>Rs 1012</td>
              <td>Customer</td>
              <td>Ram - 9857412365</td>
              <td>Payment Received</td>
              <td>Rs 1012</td>
              <td>Delivery Boy</td>
              <td>-</td>
            </tr>
            <tr>
              <td colSpan={2}></td>
              <td colSpan={2}></td>
              <td>UUID</td>
              <td>4543525434</td>
              <td>Time Occupied</td>
              <td>1:02:15</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>S.No</td>
              <td>Item</td>
              <td>Qty</td>
              <td>Price</td>
              <td>Tax</td>
              <td>Amount</td>
              <td>Chef</td>
            </tr>
          </tbody>
          <tbody>
            <tr style={{ border: 'none' }}>
              <td colSpan={8}>
                <div className="collapse-info">
                  <div className="KOT">KOT <b>19</b></div>
                  <div className="created">Created <b>14/12/21 14:02</b></div>
                  <div className="by">By <b>Suresh</b></div>
                  <div className="amt">Amt <b>Rs 204</b></div>
                  <div className="qty">Qty <b>9</b></div>
                </div>
              </td>
            </tr>
            <tr className='pending'>
              <td>1</td>
              <td>Farm Pizza</td>
              <td>3</td>
              <td>100</td>
              <td>5</td>
              <td>315</td>
              <td>Golu</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Farm Pizza <br /> + Extra Cheez</td>
              <td>3</td>
              <td>100 <br /> 20</td>
              <td>5 <br /> 5</td>
              <td>315 <br /> 75</td>
              <td>Golu</td>
            </tr>
            <tr className='delivered'>
              <td>3</td>
              <td>Farm Pizza</td>
              <td>3</td>
              <td>100</td>
              <td>5</td>
              <td>315</td>
              <td>Golu</td>
            </tr>
          </tbody>
          <tbody>
            <tr style={{ border: 'none' }}>
              <td colSpan={8}>
                <div className="collapse-info">
                  <div className="KOT">KOT <b>19</b></div>
                  <div className="created">Created <b>14/12/21 14:02</b></div>
                  <div className="by">By <b>Suresh</b></div>
                  <div className="amt">Amt <b>Rs 204</b></div>
                  <div className="qty">Qty <b>9</b></div>
                </div>
              </td>
            </tr>
            <tr className='pending'>
              <td>1</td>
              <td>Farm Pizza</td>
              <td>3</td>
              <td>100</td>
              <td>5</td>
              <td>315</td>
              <td>Golu</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Farm Pizza</td>
              <td>3</td>
              <td>100</td>
              <td>5</td>
              <td>315</td>
              <td>Golu</td>
            </tr>
            <tr className='delivered'>
              <td>3</td>
              <td>Farm Pizza</td>
              <td>3</td>
              <td>100</td>
              <td>5</td>
              <td>315</td>
              <td>Golu</td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  )
}

export default TableRowCollapse
