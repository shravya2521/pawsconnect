import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PawPrint, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    setError('');

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Sending reset request with:', {
        token: searchParams.get('token'),
        type: searchParams.get('type'),
        newPassword
      });

      const response = await fetch('https://pawsconnect.rf.gd/update_password.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: searchParams.get('token'),
          type: searchParams.get('type'),
          newPassword
        }),
      });

      const data = await response.json();
      console.log('Reset response:', data);

      if (data.status === 'success') {
        alert('Password has been reset successfully!');
        navigate('/login');
      } else {
        throw new Error(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset error:', error);
      setError(error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        {/* Logo and Title */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <PawPrint className="h-12 w-12 text-indigo-600" />
            <span className="text-3xl font-bold text-gray-900">Reset Password</span>
          </div>
        </div>

        {/* Reset Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError(validatePassword(e.target.value));
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  error ? 'border-red-500' : ''
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-indigo-600 text-white py-4 rounded-lg transition duration-200 font-semibold text-lg ${
              isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'
            }`}
          >
            {isLoading ? 'Processing...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
