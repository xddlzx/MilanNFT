import "./DeliveryAddress.css";
import { useUserData } from "../../../../contexts/UserDataProvider.js";
import { v4 as uuid } from "uuid";

import React from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../../contexts/AuthProvider.js";
import { useNavigate } from "react-router-dom";

export const DeliveryAddress = () => {
  const { userDataState, dispatch, clearCartHandler } = useUserData();

  const {
    cartProducts,
    addressList,
    orderDetails: { cartItemsDiscountTotal, orderAddress },
  } = userDataState;

  const KEY_ID = "rzp_test_VAxHG0Dkcr9qc6";

  const totalAmount = cartItemsDiscountTotal;

  const navigate = useNavigate();

  const userContact = addressList?.find(
    ({ _id }) => _id === orderAddress?._id
  )?.phone;

  const { auth, setCurrentPage } = useAuth();

  const successHandler = (response) => {
    const paymentId = response.razorpay_payment_id;
    const orderId = uuid();
    const order = {
      paymentId,
      orderId,
      amountPaid: totalAmount,
      orderedProducts: [...cartProducts],
      deliveryAddress: { ...orderAddress },
    };

    dispatch({ type: "SET_ORDERS", payload: order });
    clearCartHandler(auth.token);
    setCurrentPage("orders");
    navigate("/profile/orders");
  };

  const razorpayOptions = {
    key: KEY_ID,
    currency: "INR",
    amount: Number(totalAmount) * 100,
    name: "Art Waves Unleashed",
    description: "Order for products",
    prefill: {
      name: auth.firstName,
      email: auth.email,
      contact: userContact,
    },
    notes: { address: orderAddress },
    theme: { color: "#000000" },
    handler: (response) => successHandler(response),
  };

  const placeOrderHandler = () => {
    if (orderAddress) {
      const razorpayInstance = new window.Razorpay(razorpayOptions);
      razorpayInstance.open();
    } else {
      toast("Please select an address!");
    }
  };

  return (
    <div className="delivery-address-container">
      <p>Delivering To</p>

      <div className="delivery-address-description">
        <span className="name">
          Name: {userDataState.orderDetails?.orderAddress?.name}
        </span>
        <span className="address">
          Address: {orderAddress?.street}, {orderAddress?.city},{" "}
          {orderAddress?.state}, {orderAddress?.country},{" "}
          {orderAddress?.pincode}
        </span>
        <span className="contact">Contact: {orderAddress?.phone}</span>
        <button onClick={placeOrderHandler} className="place-order-btn">
          Place Order
        </button>
      </div>
    </div>
  );
};
