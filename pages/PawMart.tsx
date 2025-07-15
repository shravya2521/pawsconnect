import React, { useState, useEffect } from 'react';
import { ShoppingCart, ArrowLeft, Minus, Plus, X, Edit, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  quantity: number;
  cartQuantity?: number;
}

// Function to format price in Indian Rupees
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

// Add this helper function near the top
const validateImageUrl = (url: string) => {
  try {
    const imgUrl = new URL(url);
    // Allow images from common image hosting sites
    const allowedDomains = [
      'images.unsplash.com',
      'i.imgur.com',
      'images.pexels.com',
      'via.placeholder.com',
      'placehold.co',
      'static.wikia.nocookie.net',
      'media.istockphoto.com'
    ];
    
    // For Google Images, transform the URL if needed
    if (url.includes('googleusercontent.com')) {
      return url.split('=')[0]; // Get the base image URL without parameters
    }
    
    return allowedDomains.some(domain => imgUrl.hostname.includes(domain)) 
      ? url 
      : 'https://placehold.co/400x300?text=Invalid+Image+URL';
  } catch {
    return 'https://placehold.co/400x300?text=Invalid+Image+URL';
  }
};

// Add size validation helper
const validateAndOptimizeData = (data: any) => {
  const maxSize = 5 * 1024 * 1024;
  
  // Use product_id for cart items
  const productId = data.product_id || data.id;
  if (!productId) {
    throw new Error('Invalid product data: No ID found');
  }

  const optimizedData = {
    id: productId, // Use product_id as the main ID
    name: data.name,
    price: data.price,
    quantity: data.quantity || 1
  };

  if (JSON.stringify(optimizedData).length > maxSize) {
    throw new Error('Data size too large');
  }

  return optimizedData;
};

export default function PawMart() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>(
    products.reduce((acc, product) => ({ ...acc, [product.id]: 1 }), {})
  );
  const [showCart, setShowCart] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const navigate = useNavigate();
  const userType = localStorage.getItem('userType');
  const isAdmin = userType === 'admin';
  const isCenter = userType === 'center';
  const isCustomer = userType === 'customer';
  const userId = isCustomer 
    ? localStorage.getItem('customerId') 
    : isCenter 
      ? localStorage.getItem('centerId') 
      : null; // This is used throughout the component

  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    description: '',
    image: '',
    quantity: 0
  });

  // Add state for form inputs
  const [productPrice, setProductPrice] = useState<string>(''); // Change to string type

  // Add new state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Add refresh interval to fetch products periodically
  useEffect(() => {
    fetchProducts();
  }, []); // Only fetch once on mount

  // Update useEffect to check for userId instead of centerId
  useEffect(() => {
    if (userId) {
      fetchCartItems();
    }
  }, [userId]);

  // Update fetchProducts function
  const fetchProducts = async () => {
    try {
      const response = await fetch(encodeURI('https://pawsconnect.rf.gd/get_products.php'));
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      
      if (result.status === 'success' && Array.isArray(result.data)) {
        setProducts(result.data.map((product: any) => ({
          id: parseInt(product.id),
          name: product.name,
          price: parseFloat(product.price),
          description: product.description,
          image: product.image_url ? `data:image/jpeg;base64,${product.image_url}` : 'https://placehold.co/400x300?text=No+Image',
          quantity: parseInt(product.quantity)
        })));
      } else {
        throw new Error(result.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchCartItems = async () => {
    try {
      const response = await fetch(`https://pawsconnect.rf.gd/get_cart_items.php?user_id=${userId}&user_type=${userType}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setCartItems(data.cartItems);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  const handleQuantityChange = (productId: number, delta: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setQuantities(prev => ({
      ...prev,
      [productId]: Math.min(
        Math.max(1, prev[productId] || 1) + delta,
        product.quantity
      )
    }));
  };
  
  const handleCartQuantityChange = async (productId: number, delta: number) => {
    try {
        const item = cartItems.find(item => item.product_id === productId || item.id === productId || item.productId === productId);
        if (!item) {
            console.error('Item not found:', { productId, cartItems });
            return;
        }

        // Find the product to check stock
        const product = products.find(p => p.id === productId);
        if (!product) {
            console.error('Product not found:', productId);
            return;
        }

        const newQuantity = Math.max(1, (item.quantity || 1) + delta);
        
        // Check if new quantity exceeds available stock
        if (newQuantity > product.quantity) {
            alert(`Only ${product.quantity} items available in stock`);
            return;
        }

        // Continue with the update...
        console.log('Updating cart with:', {
            user_id: parseInt(userId || '0'),
            user_type: userType,
            product_id: item.product_id || item.id || productId,
            quantity: newQuantity
        });

        const response = await fetch('https://pawsconnect.rf.gd/update_cart_quantity.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: parseInt(userId || '0'),
                user_type: userType,
                product_id: item.product_id || item.id || productId,
                quantity: newQuantity
            })
        });

        const data = await response.json();
        console.log('Cart update response:', data);

        if (data.status === 'success') {
            await fetchCartItems();
        } else {
            throw new Error(data.message || 'Failed to update cart');
        }
    } catch (err) {
        console.error('Error updating cart:', err);
        alert(err instanceof Error ? err.message : 'Failed to update cart quantity');
    }
};

const handleAddToCart = async (product: Product) => {
  try {
    // Add validation for userId
    if (!userId) {
      alert('Please log in to add items to cart');
      return;
    }

    // Check if product is out of stock
    if (product.quantity <= 0) {
      alert('This item is out of stock');
      return;
    }

    const selectedQuantity = quantities[product.id] || 1;
    console.log('Adding to cart:', {
      user_id: userId,
      user_type: userType,
      product_id: product.id,
      quantity: selectedQuantity
    });

    const response = await fetch('https://pawsconnect.rf.gd/add_to_cart.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: parseInt(userId),
        user_type: userType,
        product_id: product.id,
        quantity: selectedQuantity
      })
    });
    const data = await response.json();
    if (data.status === 'success') {
      await fetchCartItems();
      setQuantities(prev => ({
        ...prev,
        [product.id]: 1
      }));
    } else {
      throw new Error(data.message);
    }
  } catch (err) {
    console.error('Error adding to cart:', err);
    alert('Failed to add item to cart');
  }
};

// Modify navigateToCheckout function
const navigateToCheckout = () => {
  if (!userId || !userType) {
    alert('Please log in to checkout');
    return;
  }

  // Validate session
  const validUserTypes = ['customer', 'center'];
  if (!validUserTypes.includes(userType)) {
    alert('Invalid user type. Please log in again.');
    return;
  }

  const checkoutProducts = cartItems.map(item => {
    const imageKey = `checkout_image_${item.product_id || item.id}`;
    if (item.image) {
      localStorage.setItem(imageKey, item.image);
    }
    return {
      ...item,
      imageKey
    };
  });

  navigate('/checkout', {
    state: {
      products: checkoutProducts,
      user_id: parseInt(userId),
      user_type: userType,
      buyNow: false
    }
  });
};

const handleBuyNow = (product: Product) => {
  if (!userId || !userType) {
    alert('Please log in to purchase items');
    return;
  }

  // Validate session
  const validUserTypes = ['customer', 'center'];
  if (!validUserTypes.includes(userType)) {
    alert('Invalid user type. Please log in again.');
    return;
  }

  const imageKey = `checkout_image_${product.id}`;
  if (product.image) {
    localStorage.setItem(imageKey, product.image);
  }

  const productData = {
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: quantities[product.id] || 1,
    imageKey
  };

  navigate('/checkout', {
    state: {
      products: [productData],
      buyNow: true,
      user_id: parseInt(userId),
      user_type: userType
    }
  });
};

  const handleRemoveFromCart = async (productId: number) => {
    try {
        // Debug log
        console.log('Cart removal data:', {
            userId,
            userType,
            productId
        });

        // Validate data
        if (!userId || !userType || typeof productId === 'undefined' ) {
            console.error('Invalid cart removal data:', { userId, userType, productId });
            throw new Error('Missing required fields for cart removal');
        }

        const response = await fetch('https://pawsconnect.rf.gd/remove_from_cart.php', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: parseInt(userId),
                user_type: userType,
                product_id: parseInt(productId)
            })
        });

        const data = await response.json();
        console.log('Remove cart response:', data);

        if (data.status === 'success') {
            await fetchCartItems();
        } else {
            throw new Error(data.message || 'Failed to remove item');
        }
    } catch (err) {
        console.error('Error removing item:', err);
        alert('Failed to remove item from cart');
    }
};

  // Modify handleAddProduct to prevent duplicates
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('price', productPrice);
      formData.append('description', newProduct.description);
      formData.append('quantity', newProduct.quantity.toString());

      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      // If editing, add id to formData
      if (editingProduct) {
        formData.append('id', editingProduct.id.toString());
      }

      const url = editingProduct 
        ? 'https://pawsconnect.rf.gd/edit_product.php'
        : 'https://pawsconnect.rf.gd/add_product.php';

      const response = await fetch(url, {
        method: 'POST',
        body: formData, // Send FormData instead of JSON
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Server response:', data);

      if (data.status === 'success') {
        // Reset form
        setNewProduct({ name: '', price: 0, description: '', image: '', quantity: 0 });
        setProductPrice('');
        setSelectedImage(null);
        setEditingProduct(null);
        setShowAddProduct(false);
        
        // Immediately fetch updated products
        await fetchProducts();
      } else {
        throw new Error(data.message || 'Failed to save product');
      }
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Error saving product. Please try again.');
    }
  };

  const handleEditProduct = async (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image,
      quantity: product.quantity
    });
    setProductPrice(product.price.toString());
    setShowAddProduct(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(encodeURI('https://pawsconnect.rf.gd/delete_product.php'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ id: productId })
        });

        const data = await response.json();
        if (data.status === 'success') {
          setProducts(products.filter(p => p.id !== productId));
          setCartItems(cartItems.filter(item => item.id !== productId));
        } else {
          alert(data.message);
        }
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Error deleting product. Please try again.');
      }
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  const renderCartImage = (imageUrl: string) => {
    if (!imageUrl) return 'https://placehold.co/100x100?text=No+Image';
    if (imageUrl.startsWith('data:image')) return imageUrl;
    return `data:image/jpeg;base64,${imageUrl}`;
  };

  // Add this helper function
  const checkCartStockAvailability = () => {
    const outOfStockItems = cartItems.filter(cartItem => {
      const product = products.find(p => p.id === (cartItem.product_id || cartItem.id));
      return !product || product.quantity < cartItem.quantity;
    });

    return {
      available: outOfStockItems.length === 0,
      outOfStockItems
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Donation Message */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-8">
          <p className="text-indigo-800 text-center">
            50% of your purchases from PawMart go directly to supporting local pet adoption centers. 
            Together, we can make a difference in the lives of pets in need. 🐾
          </p>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="mb-8">
            <button
              onClick={() => {
                setEditingProduct(null);
                setNewProduct({ name: '', price: 0, description: '', image: '', quantity: 0 });
                setShowAddProduct(true);
              }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              Add New Product
            </button>
          </div>
        )}

        {/* Cart Icon */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          {!isAdmin && (
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition duration-200"
            >
              <ShoppingCart size={24} />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <p className="text-sm text-gray-600 mb-2">
                  {product.quantity > 0 
                    ? `${product.quantity} in stock` 
                    : 'Out of stock'}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-indigo-600">{formatPrice(product.price)}</span>
                  {!isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(product.id, -1)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center">{quantities[product.id] || 1}</span>
                      <button
                        onClick={() => handleQuantityChange(product.id, 1)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  )}
                </div>
                {isAdmin ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center justify-center gap-2"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition duration-200 flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    {product.quantity <= 0 ? (
                      // Single Out of Stock button when quantity is 0
                      <button 
                        className="w-full bg-gray-400 text-white py-2 rounded-lg cursor-not-allowed"
                        disabled
                      >
                        Out of Stock
                      </button>
                    ) : (
                      // Show both buttons when product is in stock
                      <>
                        <button 
                          onClick={() => handleAddToCart(product)}
                          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
                        >
                          Add to Cart
                        </button>
                        <button 
                          onClick={() => handleBuyNow(product)}
                          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
                        >
                          Buy Now
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Product Modal */}
        {showAddProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-xl font-semibold">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddProduct} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (in ₹)
                  </label>
                  <input
                    type="number"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Enter product price"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setSelectedImage(e.target.files[0]);
                      }
                    }}
                    className="w-full px-4 py-2 border rounded-lg"
                    required={!editingProduct} // Only required for new products
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity in Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.quantity}  // Remove the || 0
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewProduct({
                        ...newProduct,
                        quantity: value === '' ? 0 : parseInt(value)
                      });
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-200"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Cart Modal */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-xl font-semibold">Shopping Cart</h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                {cartItems.length === 0 ? (
                  <p className="text-center text-gray-500">Your cart is empty</p>
                ) : (
                  cartItems.map((item) => (
                    <div key={`cart-item-${item.id}`} className="flex items-center gap-4 mb-4 pb-4 border-b">
                      <img
                        src={renderCartImage(item.image)}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/100x100?text=Error';
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-gray-600">{formatPrice(item.price)}</p>
                        {(() => {
                          const product = products.find(p => p.id === (item.product_id || item.id));
                          const isOutOfStock = !product || product.quantity < item.quantity;
                          
                          return isOutOfStock ? (
                            <p className="text-red-500 text-sm mt-1">Out of stock - Please remove this item</p>
                          ) : (
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => handleCartQuantityChange(item.product_id || item.id, -1)}
                                className="p-1 rounded-full hover:bg-gray-100"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => handleCartQuantityChange(item.product_id || item.id, 1)}
                                className="p-1 rounded-full hover:bg-gray-100"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          {formatPrice(item.price * (item.quantity || 1))}
                        </p>
                        <button
                          onClick={() => handleRemoveFromCart(item.product_id || item.id)}
                          className="text-red-500 hover:text-red-600 text-sm mt-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {cartItems.length > 0 && (
                <div className="p-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-semibold">Total:</span>
                    <span className="text-xl font-bold text-indigo-600">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>
                  <p className="text-sm text-indigo-600 mb-4">
                    50% of your purchase will be donated to local pet adoption centers.
                  </p>
                  {checkCartStockAvailability().available ? (
                    <Link
                      to="/checkout"
                      state={{ 
                        products: cartItems.map(item => {
                          const imageKey = `checkout_image_${item.product_id || item.id}`;
                          if (item.image) {
                            localStorage.setItem(imageKey, item.image);
                          }
                          return {
                            id: item.product_id || item.id,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity || 1,
                            imageKey
                          };
                        }),
                        user_id: parseInt(userId || '0'),
                        user_type: userType,
                        buyNow: false
                      }}
                      className="block w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-200 text-center font-semibold"
                      onClick={(e) => {
                        if (!userId || !userType) {
                          e.preventDefault();
                          alert('Please log in to proceed with checkout');
                          return;
                        }
                        // ... rest of the existing onClick code ...
                      }}
                    >
                      Proceed to Checkout
                    </Link>
                  ) : (
                    <div>
                      <button 
                        className="w-full bg-gray-400 text-white py-3 rounded-lg cursor-not-allowed mb-2"
                        disabled
                      >
                        Cannot Checkout - Items Out of Stock
                      </button>
                      <p className="text-red-500 text-sm">
                        Some items in your cart are no longer available. Please remove them to continue.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}