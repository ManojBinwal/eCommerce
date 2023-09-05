import React from "react"; // Importing React library
import { useSelector, useDispatch } from "react-redux"; // Importing useSelector and useDispatch hooks from react-redux
import { toast } from "react-toastify"; // Importing toast from react-toastify for notifications
import styles from "../css/cart.module.css"; // Importing CSS styles for the component
import { removeFromCart } from "../store/cartSlice"; // Importing removeFromCart action from Redux store

export default function Cart() { // Defining the Cart component as a function component
  const cartItems = useSelector((state) => state.cart); // Using useSelector to get cart items from Redux store

  const dispatch = useDispatch(); // Getting the dispatch function from Redux

  function getNetAmount() { // Function to calculate the total price of items in the cart
    let sum = 0;
    cartItems.forEach((item) => {
      sum += item.price;
    });
    return sum;
  }

  function handleRemoveItem(id) { // Function to remove an item from the cart
    dispatch(removeFromCart(id)); // Dispatching the removeFromCart action to remove the item from Redux store
    let oldCart = JSON.parse(localStorage.getItem("cartItems")); // Getting the cart items from local storage
    localStorage.setItem( // Updating local storage to remove the deleted item
      "cartItems",
      JSON.stringify(oldCart.filter((item) => item.id !== id))
    );
    toast.warning("Item deleted from cart", {
      position: "bottom-center",
    }); // Displaying a notification using react-toastify
  }

  // Razorpay integration starts
  function loadScript() { // Function to load the Razorpay script dynamically
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  async function handleCheckout(amount) { // Function to handle the checkout process with Razorpay
    amount *= 1000; // Convert the amount to paise (Indian currency)
    const res = await loadScript(); // Load the Razorpay script dynamically
    if (!res) {
      alert("Payment Failed!"); // Display an alert if the script loading fails
      return;
    }

    const options = {
      key: "rzp_test_8BiyI71UqrlDqT", // Razorpay API key (test mode)
      currency: "INR", // Currency (Indian Rupees)
      amount: amount, // Total amount in paise
      name: "E Commerce", // Name of the store
      description: "We have extremely low dollar conversion rate", // Description
      handler: (res) => {
        alert(
          `Payment Successful with Payment ID - ${res.razorpay_payment_id}`
        ); // Display a success message with payment ID
      },
    };

    const paymentObject = new window.Razorpay(options); // Create a Razorpay payment object
    paymentObject.open(); // Open the payment modal
  }
  // Razorpay integration ends

  return (
    <div className={styles.container}>
      {cartItems.map((item, index) => { // Map through cart items and display them
        return (
          <div className={styles.cartItem} key={index}>
            <div className={styles.itemWrapper}>
              <div className={styles.itemImage}>
                <img src={item.image} alt={item.title} /> {/* Display item image */}
              </div>
              <div>
                <div className={styles.itemTitle}>{item.title}</div> {/* Display item title */}
                <div className={styles.itemPrice}>$ {item.price}</div> {/* Display item price */}
              </div>
            </div>
            <div className={styles.itemDelete}>
              <button onClick={() => handleRemoveItem(item.id)}>
                <i className="fa fa-trash" aria-hidden="true"></i> {/* Display delete button */}
              </button>
            </div>
          </div>
        );
      })}
      <div className={styles.totalAmount}>Total : $ {getNetAmount()}</div> {/* Display total amount */}
      {getNetAmount() ? ( // Display checkout button if there are items in the cart
        <button
          className={styles.checkout}
          onClick={() => handleCheckout(getNetAmount())}
        >
          Proceed To Checkout
        </button>
      ) : (
        ""
      )}
    </div>
  );
}
