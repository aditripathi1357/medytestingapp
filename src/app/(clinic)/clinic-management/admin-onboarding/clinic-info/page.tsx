'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { updateClinicInfo, setCurrentStep } from '@/store/adminSlice';
import { RootState } from '@/store/store';

const ClinicInfo = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const clinicInfo = useSelector((state: RootState) => state.admin.clinicInfo);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    clinicName: clinicInfo.clinicName || '',
    clinicType: clinicInfo.clinicType || '',
    registrationNumber: clinicInfo.registrationNumber || '',
    establishmentYear: clinicInfo.establishmentYear || '',
    address: clinicInfo.address || '',
  });
  
  const [formErrors, setFormErrors] = useState({
    clinicName: '',
    clinicType: '',
    registrationNumber: '',
    establishmentYear: '',
    address: '',
  });

  const clinicTypes = [
    'General Practice',
    'Specialty Clinic',
    'Multi-specialty Hospital',
    'Dental Clinic',
    'Eye Care Center',
    'Diagnostic Center',
    'Rehabilitation Center',
    'Other'
  ];
  
  const validateForm = () => {
    let isValid = true;
    const errors = {
      clinicName: '',
      clinicType: '',
      registrationNumber: '',
      establishmentYear: '',
      address: '',
    };
    
    if (!formData.clinicName.trim()) {
      errors.clinicName = 'Clinic/Hospital name is required';
      isValid = false;
    }
    
    if (!formData.clinicType) {
      errors.clinicType = 'Clinic type is required';
      isValid = false;
    }
    
    if (!formData.registrationNumber.trim()) {
      errors.registrationNumber = 'Registration number is required';
      isValid = false;
    }
    
    if (!formData.establishmentYear.trim()) {
      errors.establishmentYear = 'Year of establishment is required';
      isValid = false;
    } else if (!/^\d{4}$/.test(formData.establishmentYear)) {
      errors.establishmentYear = 'Please enter a valid year (YYYY)';
      isValid = false;
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Save data to Redux
      dispatch(updateClinicInfo(formData));
      dispatch(setCurrentStep(2));
      
      // Navigate to next step
      router.push('/clinic-management/admin-onboarding/documents');
    } catch (error) {
      console.error('Error saving clinic info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    dispatch(setCurrentStep(0));
    router.push('/clinic-management/admin-onboarding/personal-info');
  };
  
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
          name="clinicName"
          value={formData.clinicName}
          onChange={handleChange}
          placeholder="Clinic/Hospital Name"
          className={`w-full px-4 py-3 rounded-full border ${
            formErrors.clinicName ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-[#00665B]`}
        />
        {formErrors.clinicName && (
          <p className="text-red-500 text-xs mt-1 ml-4">{formErrors.clinicName}</p>
        )}
      </div>
      
      <div>
        <div className={`relative w-full rounded-full border ${
            formErrors.clinicType ? 'border-red-500' : 'border-gray-300'
          } focus-within:ring-2 focus-within:ring-[#00665B]`}>
          <select
            name="clinicType"
            value={formData.clinicType}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-full appearance-none bg-transparent focus:outline-none"
          >
            <option value="" disabled>Type Of Hospital/Clinic</option>
            {clinicTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        {formErrors.clinicType && (
          <p className="text-red-500 text-xs mt-1 ml-4">{formErrors.clinicType}</p>
        )}
      </div>
      
      <div>
        <input
          type="text"
          name="registrationNumber"
          value={formData.registrationNumber}
          onChange={handleChange}
          placeholder="Registration Number / License ID"
          className={`w-full px-4 py-3 rounded-full border ${
            formErrors.registrationNumber ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-[#00665B]`}
        />
        {formErrors.registrationNumber && (
          <p className="text-red-500 text-xs mt-1 ml-4">{formErrors.registrationNumber}</p>
        )}
      </div>
      
      <div>
        <input
          type="text"
          name="establishmentYear"
          value={formData.establishmentYear}
          onChange={handleChange}
          placeholder="Year Of Establishment"
          className={`w-full px-4 py-3 rounded-full border ${
            formErrors.establishmentYear ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-[#00665B]`}
        />
        {formErrors.establishmentYear && (
          <p className="text-red-500 text-xs mt-1 ml-4">{formErrors.establishmentYear}</p>
        )}
      </div>
      
      <div>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Address"
          className={`w-full px-4 py-3 rounded-full border ${
            formErrors.address ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-[#00665B]`}
        />
        {formErrors.address && (
          <p className="text-red-500 text-xs mt-1 ml-4">{formErrors.address}</p>
        )}
      </div>
      
      <div className="pt-4 flex space-x-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleBack}
          className="w-1/3 bg-gray-200 text-gray-700 py-3 rounded-full font-medium hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
        >
          Back
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-2/3 bg-[#00665B] text-white py-3 rounded-full font-medium hover:bg-[#005249] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00665B] disabled:opacity-70"
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

export default ClinicInfo;