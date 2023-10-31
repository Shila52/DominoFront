import React, { useState } from "react";
import { connect } from "react-redux";
import Api from "../../Api";

function Withdraw(props) {
  const [Data, setData] = useState({
    Amount: 5000,
    PhoneNumber: "",
    PaymentOption: "Asia",
  });
  const [err, seterr] = useState("");

  const HandleSubmit = async () => {
    seterr("");
    if (Data.Amount < 5000) {
      seterr("u need enter above 5000");
      return;
    }
    if (Data.Amount > props.user.coins) {
      seterr("u need enter under " + props.user.coins);
      return;
    }
    if (!isValidNumber(Data.PhoneNumber)) {
      seterr("enter number correctly");
      return;
    }
    try {
      Api.post("/users/withdrawl", {
        data: Data,
        credentials: "include",
      }).then((res) => {
        console.log(res);
        alert("every thing okaya ");
      });
    } catch (error) {
      console.log(error, "on Creating withdrawl");
    }
  };
  function isValidNumber(number) {
    // Check if the input is a string and has a length of 11
    if (typeof number !== "string" || number.length !== 11) {
      return false;
    }

    // Use a regular expression to check if the string consists of only digits
    const regex = /^[0-9]+$/;
    return regex.test(number);
  }

  return (
    <div className=" flex flex-col gap-3">
      {err && (
        <div className="p-2 w-96 text-white font-bold text-lg bg-red-500">
          {err}
        </div>
      )}
      <input
        type="number"
        disabled={props.user.coins < 5000}
        max={props.user.coins}
        onInput={(e) => setData({ ...Data, Amount: e.target.value })}
        defaultValue={Data.Amount}
        className="p-2 w-96 text-xl text-center disabled:bg-red-400 rounded-lg text-white font-bold "
        placeholder="Enter amount ... u want "
      />
      <input
        type="text"
        onInput={(e) => setData({ ...Data, PhoneNumber: e.target.value })}
        className="p-2 w-96 text-xl text-center disabled:bg-red-400 rounded-lg mt-4 text-white font-bold "
        placeholder=" enter ur phone number  "
      />
      <button
        onClick={HandleSubmit}
        className="bg-emerald-500 p-2 text-center text-lg font-bold"
      >
        Send{" "}
      </button>
    </div>
  );
}

const mapStateToProps = (state) => ({
  user: state.user.user,
});
export default connect(mapStateToProps)(Withdraw);
