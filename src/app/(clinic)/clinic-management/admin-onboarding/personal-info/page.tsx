'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { updatePersonalInfo, setCurrentStep } from '@/store/adminSlice';
import { RootState } from '@/store/store';
import axios from 'axios';

const PersonalInfo = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // const returnURL = searchParams.get('returnURL') || '/clinic-management/admin-onboarding/clinic-info';
  const dispatch = useDispatch();
  const personalInfo = useSelector((state: RootState) => state.admin.personalInfo);
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: personalInfo.fullName || '',
    email: personalInfo.email || '',
    phone: personalInfo.phone || '',
    designation: personalInfo.designation || '',
  });
  
  const [formErrors, setFormErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    designation: '',
  });

  // Load data from sessionStorage on component mount
  useEffect(() => {
    try {
      const userDataString = window.sessionStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        
        setFormData(prev => ({
          ...prev,
          fullName: userData.name || prev.fullName,
          email: userData.email || prev.email,
          phone: userData.phone || prev.phone,
        }));
        
        // If phone exists in sessionStorage, it's already verified
        if (userData.phone) {
          setIsPhoneVerified(true);
        }
      }
    } catch (error) {
      console.error('Error loading user data from sessionStorage:', error);
    }
  }, []);

  const validateForm = () => {
    let isValid = true;
    const errors = {
      fullName: '',
      email: '',
      phone: '',
      designation: '',
    };
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
      isValid = false;
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
      isValid = false;
    }
    
    if (!formData.designation.trim()) {
      errors.designation = 'Designation is required';
      isValid = false;
    }

    // Check if phone is verified
    if (!isPhoneVerified) {
      errors.phone = 'Phone number needs to be verified';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }

    // If phone number is changed, set isPhoneVerified to false
    if (name === 'phone') {
      setIsPhoneVerified(false);
    }
  };

  const handleCheckPhone = async () => {
    if (!formData.phone.trim()) {
      setFormErrors(prev => ({ ...prev, phone: 'Phone number is required' }));
      return;
    }

    setIsCheckingPhone(true);
    try {
      const response = await axios.post('/api/check-phone', {
        phoneNumber: formData.phone
      });

      if (response.data.exists) {
        setFormErrors(prev => ({ 
          ...prev, 
          phone: 'This phone number is already registered. Please use a different number.'
        }));
      } else {
        // Store phone in sessionStorage
        const userDataString = window.sessionStorage.getItem('userData');
        const userData = userDataString ? JSON.parse(userDataString) : {};
        userData.phone = formData.phone;
        window.sessionStorage.setItem('userData', JSON.stringify(userData));
        
        // Navigate to OTP verification
        router.push(`/sign-up/verify-otp?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      }
    } catch (error) {
      console.error('Error checking phone:', error);
      setFormErrors(prev => ({ 
        ...prev, 
        phone: 'Error checking phone number. Please try again.' 
      }));
    } finally {
      setIsCheckingPhone(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Save all data to sessionStorage
      const userDataString = window.sessionStorage.getItem('userData');
      const userData = userDataString ? JSON.parse(userDataString) : {};
      userData.name = formData.fullName;
      userData.email = formData.email;
      // Phone is already in sessionStorage
      window.sessionStorage.setItem('userData', JSON.stringify(userData));
      
      // Save data to Redux
      dispatch(updatePersonalInfo(formData));
      dispatch(setCurrentStep(1));
      
      // Navigate to next step
      router.push('/clinic-management/admin-onboarding/clinic-info');
    } catch (error) {
      console.error('Error saving personal info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is coming back from OTP verification
  useEffect(() => {
    const verificationStatus = searchParams.get('verified');
    if (verificationStatus === 'true') {
      setIsPhoneVerified(true);
    }
  }, [searchParams]);

  // Determine if fields should be readonly based on sessionStorage data
  const userDataString = typeof window !== 'undefined' ? window.sessionStorage.getItem('userData') : null;
  const userData = userDataString ? JSON.parse(userDataString) : {};
  const isFullNameReadOnly = !!userData.name;
  const isEmailReadOnly = !!userData.email;
  const isPhoneReadOnly = !!userData.phone;
  
  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
      onSubmit={handleSubmit}
    >
      <div>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Full Name"
          readOnly={isFullNameReadOnly}
          className={`w-full px-4 py-3 rounded-full border ${
            formErrors.fullName ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-[#00665B] ${
            isFullNameReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        />
        {formErrors.fullName && (
          <p className="text-red-500 text-xs mt-1 ml-4">{formErrors.fullName}</p>
        )}
      </div>
      
      <div>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email Address"
          readOnly={isEmailReadOnly}
          className={`w-full px-4 py-3 rounded-full border ${
            formErrors.email ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-[#00665B] ${
            isEmailReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        />
        {formErrors.email && (
          <p className="text-red-500 text-xs mt-1 ml-4">{formErrors.email}</p>
        )}
      </div>
      
      <div className="relative">
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone Number"
          readOnly={isPhoneReadOnly}
          className={`w-full px-4 py-3 rounded-full border ${
            formErrors.phone ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-[#00665B] ${
            isPhoneReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
          } ${!isPhoneReadOnly && formData.phone ? 'pr-24' : ''}`}
        />
        {!isPhoneReadOnly && formData.phone && !isPhoneVerified && (
          <button
            type="button"
            onClick={handleCheckPhone}
            disabled={isCheckingPhone}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-[#00665B] font-medium hover:text-[#005249] focus:outline-none"
          >
            {isCheckingPhone ? 'Checking...' : 'Verify Phone'}
          </button>
        )}
        {!isPhoneReadOnly && isPhoneVerified && (
          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-green-600 font-medium">
            Verified
          </span>
        )}
        {formErrors.phone && (
          <p className="text-red-500 text-xs mt-1 ml-4">{formErrors.phone}</p>
        )}
      </div>
      
      <div>
        <input
          type="text"
          name="designation"
          value={formData.designation}
          onChange={handleChange}
          placeholder="Designation"
          className={`w-full px-4 py-3 rounded-full border ${
            formErrors.designation ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-[#00665B]`}
        />
        {formErrors.designation && (
          <p className="text-red-500 text-xs mt-1 ml-4">{formErrors.designation}</p>
        )}
      </div>
      
      <div className="pt-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#00665B] text-white py-3 rounded-full font-medium hover:bg-[#005249] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00665B] disabled:opacity-70"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Next'
          )}
        </motion.button>
      </div>
    </motion.form>
  );
};

export default PersonalInfo;