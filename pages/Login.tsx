import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PawPrint, ArrowLeft, Eye, EyeOff } from 'lucide-react';

type UserType = 'customer' | 'center' | 'admin';
type CenterType = 'adoption' | 'veterinary';

export default function Login() {
  const [userType, setUserType] = useState<UserType>('customer');
  const [centerType, setCenterType] = useState<CenterType>('adoption');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
    // Clear license number input
    const licenseInput = document.getElementById('license') as HTMLInputElement;
    if (licenseInput) {
      licenseInput.value = '';
    }
  };

  const handleUserTypeChange = (type: UserType) => {
    setUserType(type);
    resetForm();
    if (type === 'center') {
      setCenterType('adoption');
    }
  };

  const handleCenterTypeChange = (type: CenterType) => {
    setCenterType(type);
    resetForm();
    
    // Clear license number input specifically
    const licenseInput = document.getElementById('license') as HTMLInputElement;
    if (licenseInput) {
      licenseInput.value = '';
    }
  };

  const handleLoginSignupToggle = (isLoginMode: boolean) => {
    setIsLogin(isLoginMode);
    resetForm();
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!minLength) {
      return 'Password must be at least 8 characters long';
    }
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!hasNumber) {
      return 'Password must contain at least one number';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin) {
      // Add password validation for signup
      const passwordValidationError = validatePassword(password);
      if (passwordValidationError) {
        setPasswordError(passwordValidationError);
        return;
      }
      setPasswordError('');
    }

    try {
      if (!isLogin) {
        // Handle signup
        const endpoint = userType === 'customer' 
          ? 'customer_signup.php'
          : 'center_signup.php';

        const response = await fetch(`https://pawsconnect.rf.gd/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password,
            ...(userType === 'center' && { 
              centerType, 
              licenseNumber: document.getElementById('license')?.value 
            })
          }),
        });

        const data = await response.json();
        if (data.status === 'success') {
          setError('');
          alert(data.message);
          setIsLogin(true);
        } else {
          setError(data.message);
        }
      } else {
        // Handle login
        const endpoint = userType === 'customer' 
          ? 'customer_login.php'
          : 'Login.php';

        const response = await fetch(`https://pawsconnect.rf.gd/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            userType,
            ...(userType === 'center' && { centerType }) // Add centerType for center login
          }),
        });

        const data = await response.json();
        
        if (data.status === 'success') {
          localStorage.setItem('userType', userType);
          
          if (userType === 'admin') {
            localStorage.setItem('adminId', data.admin_id.toString());
            localStorage.setItem('adminName', data.admin_name);
            navigate('/adminDashboard');
          } else if (userType === 'center') {
            localStorage.setItem('centerId', data.center_id.toString());
            localStorage.setItem('centerName', data.center_name);
            localStorage.setItem('centerType', data.center_type);
            localStorage.setItem('isHybrid', String(data.is_hybrid));
            navigate(data.center_type === 'veterinary' ? '/veterinaryDashboard' : '/centerDashboard');
          } else if (userType === 'customer') {
            localStorage.setItem('customerId', data.customer_id.toString());
            localStorage.setItem('customerName', data.customer_name);
            navigate('/customerDashboard'); // or wherever you want customers to land
          }
        } else {
          setError(data.message);
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Connection error. Please try again.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setError('');

    try {
      const response = await fetch('https://pawsconnect.rf.gd/reset_password.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: resetEmail,
          userType: userType
        }),
      });

      const textResponse = await response.text();
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid server response');
      }

      if (data.status === 'success') {
        alert('If an account exists with this email, you will receive password reset instructions.');
        setShowForgotPassword(false);
        setResetEmail('');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to process request. Please try again later.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('https://pawsconnect.rf.gd/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          userType
        }),
      });
  
      const data = await response.json();
      if (data.status === 'success') {
        localStorage.setItem('userType', userType);
        if (userType === 'center') {
          localStorage.setItem('centerId', data.center_id.toString());
        }
        navigate(`/${userType}Dashboard`);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Connection error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-8"
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>

        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <PawPrint className="h-12 w-12 text-indigo-600" />
            <span className="text-4xl font-bold text-gray-900">PawsConnect</span>
          </div>
        </div>

        <div className="max-w-xl mx-auto">
          {!showForgotPassword ? (
            <div className="bg-white rounded-xl shadow-xl p-10">
              {/* Main user type buttons */}
              <div className="flex gap-2 mb-6">
                <button
                  className={`flex-1 py-4 rounded-lg font-semibold transition-all duration-200
                    ${userType === 'customer' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                  onClick={() => handleUserTypeChange('customer')}
                >
                  Customer
                </button>
                <button
                  className={`flex-1 py-4 rounded-lg font-semibold transition-all duration-200
                    ${userType === 'center' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                  onClick={() => handleUserTypeChange('center')}
                >
                  Center
                </button>
                <button
                  className={`flex-1 py-4 rounded-lg font-semibold transition-all duration-200
                    ${userType === 'admin' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                  onClick={() => handleUserTypeChange('admin')}
                >
                  Admin
                </button>
              </div>

              {/* Center Type Selection - Moved below main buttons */}
              {userType === 'center' && (
                <div className="flex justify-center gap-4 mb-4">  {/* Changed from mb-10 to mb-4 */}
                  <button
                    className={`w-40 py-2 rounded-lg font-semibold transition-all duration-200
                      ${centerType === 'adoption' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                    onClick={() => handleCenterTypeChange('adoption')}
                  >
                    Adoption Center
                  </button>
                  <button
                    className={`w-40 py-2 rounded-lg font-semibold transition-all duration-200
                      ${centerType === 'veterinary' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                    onClick={() => handleCenterTypeChange('veterinary')}
                  >
                    Veterinary Center
                  </button>
                </div>
              )}

              {userType !== 'admin' && (
                <div className="flex gap-4 mb-10">
                  <button
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200
                      ${isLogin ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}
                    onClick={() => handleLoginSignupToggle(true)}
                  >
                    Login
                  </button>
                  <button
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200
                      ${!isLogin ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}
                    onClick={() => handleLoginSignupToggle(false)}
                  >
                    Sign Up
                  </button>
                </div>
              )}
               
              <form onSubmit={userType === 'admin' && isLogin ? handleSubmit : handleSubmit} className="space-y-6">
                {!isLogin && userType !== 'admin' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {userType === 'center' ? 'Center Name' : 'Full Name'}
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder={userType === 'center' ? 'Enter center name' : 'Enter your full name'}
                        required
                      />
                    </div>

                    {userType === 'center' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          License Number
                        </label>
                        <input
                          type="text"
                          id="license"
                          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder={`Enter ${centerType === 'adoption' ? 'adoption center' : 'veterinary center'} license number`}
                          required
                        />
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (!isLogin) {
                          setPasswordError(validatePassword(e.target.value));
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-12 [&::-ms-reveal]:hidden [&::-webkit-contacts-auto-fill-button]:hidden ${
                        passwordError && !isLogin ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {!isLogin && passwordError && (
                    <p className="mt-1 text-sm text-red-500">{passwordError}</p>
                  )}
                </div>

                {isLogin && userType !== 'admin' && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {error && <div className="text-red-500">{error}</div>}

                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-4 rounded-lg hover:bg-indigo-700 transition duration-200 font-semibold text-lg"
                >
                  {isLogin ? 'Login' : 'Sign Up'}
                </button>
              </form>

              {isLogin && userType !== 'admin' ? (
                <p className="mt-6 text-center text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-indigo-600 font-semibold hover:text-indigo-700"
                  >
                    Sign up here
                  </button>
                </p>
              ) : userType !== 'admin' && (
                <p className="mt-6 text-center text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-indigo-600 font-semibold hover:text-indigo-700"
                  >
                    Login here
                  </button>
                </p>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-xl p-10">
              <h2 className="text-2xl font-bold mb-6">Reset Password</h2>
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isResetting}
                  className={`w-full bg-indigo-600 text-white py-4 rounded-lg transition duration-200 font-semibold text-lg flex items-center justify-center ${
                    isResetting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'
                  }`}
                >
                  {isResetting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Instructions'
                  )}
                </button>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                  type="button"
                  disabled={isResetting}
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full bg-gray-100 text-gray-700 py-4 rounded-lg hover:bg-gray-200 transition duration-200 font-semibold text-lg"
                >
                  Back to Login
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}