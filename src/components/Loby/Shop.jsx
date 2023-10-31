import React, { useState, useEffect, useCallback } from "react";
import { connect } from 'react-redux';
import Purchase_detail from './PurchaseDetail';
import Api from "../../Api.js";

const Shop = () => {
  const [purchase, setPurchase] = useState(null);
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(false);

  const makeOrder = async () => {
    console.log("running");
    setLoading(true);
    try {
      const res = await Api.post('/users/generatePayments', {
        data: { TotalAmount: coins, PaymentOption: "USDT" },
        credentials: "include",
      });
      setPurchase(res.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

 

  return (
    <>
      {purchase ? (
        <Purchase_detail data={purchase} />
      ) : (
        <div>
          <div className="flex flex-col p-2 gap-3 items-center justify-center">
            <input
              className="text-lg text-center p-2"
              type="number"
              onInput={(event) => {
                console.log(event);
                setCoins(event.target.value);
              }}
            />
            <p className="text-lg text-slate-800 ">
              change Rate : {coins * 0.1} $
            </p>
          </div>
          <button
            disabled={loading}
            onClick={!loading ? makeOrder : () => console.log("not running")}
            className="disabled:bg-slate-400"
          >
            Buy With Crypto
          </button>
        </div>
      )}
    </>
  );
};

const mapStateToProps = (state) => ({
  user: state.user.user
});

export default connect(mapStateToProps)(Shop);