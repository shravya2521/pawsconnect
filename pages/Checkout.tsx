import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

interface Product {
  id: number;
  name: string;
  price: string | number;
  quantity?: number;
  imageKey?: string;
}

type PaymentMethod = 'card' | 'upi' | 'cod';

interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  name: string;
}

interface UPIDetails {
  upiId: string;
}

interface CheckoutFormData {
  name: string;
  address: string;
  phone: string;
  paymentMethod: 'card' | 'upi' | 'cod';
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  upiId?: string;
}

interface FormData {
  email: string;
  phone: string;
  address: string;
  paymentMethod: 'card' | 'upi' | 'cod';
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardName: string;
  upiId: string;
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Add user session validation
  useEffect(() => {
    // Get user info from localStorage as backup
    const userType = localStorage.getItem('userType');
    const userId = userType === 'customer' 
      ? localStorage.getItem('customerId') 
      : userType === 'center' 
        ? localStorage.getItem('centerId') 
        : null;

    // Check if we have user info either in location state or localStorage
    if ((!location.state?.user_id || !location.state?.user_type) && (!userId || !userType)) {
      alert('Session expired. Please log in again.');
      navigate('/pawmart');
      return;
    }

    // Use location state if available, otherwise use localStorage
    if (!location.state.user_id) {
      location.state.user_id = parseInt(userId || '0');
      location.state.user_type = userType;
    }
  }, [location.state, navigate]);

  const { products } = location.state as { products: Product[] };
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });
  const [upiDetails, setUPIDetails] = useState<UPIDetails>({
    upiId: ''
  });

  const [formData, setFormData] = useState<FormData>({
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: '',
    upiId: ''
  });

  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  const [productImages, setProductImages] = useState<Record<string, string>>({});

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10); // Only allow numbers and limit to 10 digits
    setFormData({ ...formData, phone: value });
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    
    // Basic info validation
    if (!formData.email?.trim()) {
        errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Email is invalid';
    }

    if (!formData.phone?.trim()) {
        errors.phone = 'Phone is required';
    } else if (formData.phone.length !== 10) {
        errors.phone = 'Phone number must be exactly 10 digits';
    }

    if (!formData.address?.trim()) {
        errors.address = 'Address is required';
    }

    // Payment method specific validations
    switch (formData.paymentMethod) {
        case 'card':
            const cardNumberClean = formData.cardNumber.replace(/\s/g, '');
            if (!cardNumberClean) {
                errors.cardNumber = 'Card number is required';
            } else if (cardNumberClean.length !== 16) {
                errors.cardNumber = 'Card number must be 16 digits';
            }

            if (!formData.cardExpiry) {
                errors.cardExpiry = 'Expiry date is required';
            } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.cardExpiry)) {
                errors.cardExpiry = 'Invalid expiry date (MM/YY)';
            }

            if (!formData.cardCvv) {
                errors.cardCvv = 'CVV is required';
            } else if (!/^\d{3}$/.test(formData.cardCvv)) {
                errors.cardCvv = 'CVV must be 3 digits';
            }

            if (!formData.cardName?.trim()) {
                errors.cardName = 'Name on card is required';
            }
            break;

        case 'upi':
            if (!formData.upiId?.trim()) {
                errors.upiId = 'UPI ID is required';
            } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z]+$/.test(formData.upiId)) {
                errors.upiId = 'Invalid UPI ID format';
            }
            break;

        case 'cod':
            // No additional validation needed for COD
            break;
    }

    // Show validation errors if any
    setFormErrors(errors);
    console.log('Validation errors:', errors);
    return Object.keys(errors).length === 0;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
    if (value.length <= 16) {
      // Add space after every 4 digits
      const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
      setFormData({ ...formData, cardNumber: formatted });
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // If backspace is pressed and we're at a slash, remove the slash too
    if (value.length < (formData.cardExpiry?.length ?? 0) && value.endsWith('/')) {
      value = value.slice(0, -1);
    }

    // Remove non-digits and slashes
    value = value.replace(/[^\d/]/g, '');

    // Validate month when 2 digits are entered
    if (value.length === 2 && !value.includes('/')) {
      const month = parseInt(value);
      if (month < 1 || month > 12) {
        alert('Please enter a valid month (01-12)');
        return;
      }
      value = value + '/';
    } else if (value.length > 2 && !value.includes('/')) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }

    if (value.length <= 5) {
      setFormData({ ...formData, cardExpiry: value });
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setFormData({ ...formData, cardCvv: value });
    }
  };

  const total = products.reduce((sum, product) => sum + (product.price * (product.quantity || 1)), 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const validateCardDetails = () => {
    const cardNumberValid = formData.cardNumber?.replace(/\s/g, '').length === 16;
    const expiryValid = formData.cardExpiry?.length === 5 && /^\d{2}\/\d{2}$/.test(formData.cardExpiry);
    const cvvValid = formData.cardCvv?.length === 3;
    const nameValid = formData.name?.length > 0;

    if (!cardNumberValid || !expiryValid || !cvvValid || !nameValid) {
      let message = 'Please check the following:\n';
      if (!cardNumberValid) message += '- Enter a valid 16-digit card number\n';
      if (!expiryValid) message += '- Enter a valid expiry date (MM/YY)\n';
      if (!cvvValid) message += '- Enter a valid 3-digit CVV\n';
      if (!nameValid) message += '- Enter the name on card\n';
      alert(message);
      return false;
    }
    return true;
  };

  const validateUPIDetails = () => {
    return formData.upiId?.includes('@') && formData.upiId?.length > 3;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const errorMessages = Object.values(formErrors).join('\n');
      alert('Please fix the following errors:\n\n' + errorMessages);
      return;
    }

    try {
      // Get user info from location state
      const { user_id, user_type } = location.state;
      
      if (!user_id || !user_type) {
        throw new Error('User session not found. Please login again.');
      }

      const orderData = {
        user_id: parseInt(user_id),
        user_type: user_type,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        products: location.state.products,
        payment_method: formData.paymentMethod,
        total_amount: total,
        is_buy_now: location.state.buyNow || false
      };

      console.log('Sending order data:', orderData);

      const response = await fetch('https://pawsconnect.rf.gd/create_order.php', {
          method: 'POST',
          headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
          },
          body: JSON.stringify(orderData)
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Order response:', result); // Debug log

      if (result.status === 'success') {
          // Clear cart only if this is a cart checkout (not buy now)
          if (!location.state.buyNow) {
              try {
                  const clearCartResponse = await fetch('https://pawsconnect.rf.gd/clear_cart.php', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                          user_id: parseInt(user_id), // Use consistent naming
                          user_type: user_type // Add user_type
                      })
                  });

                  const clearResult = await clearCartResponse.json();
                  if (clearResult.status !== 'success') {
                      console.error('Failed to clear cart:', clearResult.message);
                  }
              } catch (error) {
                  console.error('Error clearing cart:', error);
              }
          }

          let message = '';
          switch (paymentMethod) {
            case 'cod':
              message = 'Order confirmed!\nDelivery within 5-7 business days.\nPayment will be collected upon delivery.';
              break;
            case 'card':
              message = 'Order confirmed!\nPayment successful!\nDelivery within 5-7 business days.';
              break;
            case 'upi':
              message = 'Order confirmed!\nUPI payment successful!\nDelivery within 5-7 business days.';
              break;
          }
          alert(message);
          window.location.href = '/pawmart';
      } else {
          throw new Error(result.message || 'Failed to create order');
      }
    } catch (error) {
        console.error('Order error:', error);
        alert('Failed to process order. Please try again. ' + (error instanceof Error ? error.message : ''));
        if (error instanceof Error && error.message.includes('session')) {
          navigate('/pawmart');
        }
    }
  };

  // Replace the existing getImageUrl function
  const getImageUrl = (product: Product) => {
    // First check if we have the image in our state
    if (productImages[product.id]) {
      return productImages[product.id];
    }
  
    // Try to get from localStorage and store in state
    if (product.imageKey) {
      const storedImage = localStorage.getItem(product.imageKey);
      if (storedImage) {
        const imageUrl = storedImage.startsWith('data:') 
          ? storedImage 
          : `data:image/jpeg;base64,${storedImage}`;
        
        // Store in state for persistence
        setProductImages(prev => ({
          ...prev,
          [product.id]: imageUrl
        }));
        
        return imageUrl;
      }
    }
  
    return 'https://placehold.co/400x300?text=No+Image';
  };

  // Replace the renderProductImage function
  const renderProductImage = (product: Product) => {
    return (
      <img
        src={getImageUrl(product)}
        alt={product.name}
        className="w-20 h-20 object-cover rounded-lg"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          console.error('Image load failed:', product);
          target.onerror = null;
          target.src = 'https://placehold.co/400x300?text=No+Image';
        }}
      />
    );
  };

  // Update the useEffect hook
  useEffect(() => {
    // Store all product images in state when component mounts
    products.forEach(product => {
      if (product.imageKey) {
        const storedImage = localStorage.getItem(product.imageKey);
        if (storedImage) {
          const imageUrl = storedImage.startsWith('data:') 
            ? storedImage 
            : `data:image/jpeg;base64,${storedImage}`;
          
          setProductImages(prev => ({
            ...prev,
            [product.id]: imageUrl
          }));
        }
      }
    });
  }, [products]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft size={20} />
          Back to PawMart
        </button>
        <h2 className="text-2xl font-bold mb-8">Checkout</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Payment Details</h2>
              <form onSubmit={handleCheckout} className="space-y-6">
                {/* Payment Method Selection */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-medium">Select Payment Method</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <label className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer ${
                      formData.paymentMethod === 'card' ? 'border-indigo-500 bg-indigo-50' : ''
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: 'card' })}
                        className="mr-2"
                      />
                      Credit/Debit Card
                    </label>
                    <label className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer ${
                      formData.paymentMethod === 'upi' ? 'border-indigo-500 bg-indigo-50' : ''
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi"
                        checked={formData.paymentMethod === 'upi'}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: 'upi' })}
                        className="mr-2"
                      />
                      UPI
                    </label>
                    <label className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer ${
                      formData.paymentMethod === 'cod' ? 'border-indigo-500 bg-indigo-50' : ''
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: 'cod' })}
                        className="mr-2"
                      />
                      Cash on Delivery
                    </label>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3 border rounded"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    maxLength={10} // Add maxLength attribute
                    pattern="[0-9]{10}" // Add pattern attribute
                    className="w-full p-3 border rounded"
                    required
                  />
                  <textarea
                    placeholder="Delivery Address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-3 border rounded"
                    rows={3}
                    required
                  />
                </div>

                {/* Payment Method Forms */}
                <div className="mt-6">
                  {formData.paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Card Number"
                        value={formData.cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full p-3 border rounded"
                        maxLength={19}
                        required
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={formData.cardExpiry}
                          onChange={handleExpiryChange}
                          className="w-full p-3 border rounded"
                          maxLength={5}
                          required
                        />
                        <input
                          type="text"
                          placeholder="CVV"
                          value={formData.cardCvv}
                          onChange={handleCvvChange}
                          className="w-full p-3 border rounded"
                          maxLength={3}
                          required
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Name on Card"
                        value={formData.cardName}
                        onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                        className="w-full p-3 border rounded"
                        required
                      />
                    </div>
                  )}

                  {formData.paymentMethod === 'upi' && (
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="UPI ID (e.g., name@upi)"
                        value={formData.upiId}
                        onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                        className="w-full p-3 border rounded"
                        required
                      />
                    </div>
                  )}

                  {formData.paymentMethod === 'cod' && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-yellow-800">
                        Cash will be collected at the time of delivery. Please keep exact change ready.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-200"
                >
                  {formData.paymentMethod === 'cod' ? 'Place Order' : `Pay ${formatPrice(total)}`}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
            <div className="bg-white rounded-lg shadow-md p-6">
              {products.map((product) => (
                <div key={product.id} className="flex items-center gap-4 mb-4 pb-4 border-b">
                  {renderProductImage(product)}
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-gray-600">
                      {formatPrice(product.price)} × {product.quantity || 1}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatPrice(product.price * (product.quantity || 1))}
                  </p>
                </div>
              ))}
              <div className="flex justify-between items-center text-xl font-semibold mt-4">
                <span>Total:</span>
                <span>{formatPrice(total)}</span>
              </div>
              <p className="mt-4 text-sm text-indigo-600">
                50% of your purchase will be donated to local pet adoption centers.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}