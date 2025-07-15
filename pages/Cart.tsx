// Import necessary modules and components
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Cart = ({ cartItems }) => {
  const navigate = useNavigate();

  const handleProceedToCheckout = () => {
    navigate('/checkout', { 
      state: { 
        products: cartItems,
        buyNow: false  // Explicitly set for cart checkout
      } 
    });
  };

  return (
    <div>
      <h1>Your Cart</h1>
      {/* Render cart items */}
      <ul>
        {cartItems.map((item, index) => (
          <li key={index}>
            {item.name} - {item.quantity} x ${item.price}
          </li>
        ))}
      </ul>
      <button onClick={handleProceedToCheckout}>Proceed to Checkout</button>
    </div>
  );
};

export default Cart;