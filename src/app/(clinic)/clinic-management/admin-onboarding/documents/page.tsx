'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { updateDocuments, submitAdminData } from '@/store/adminSlice';
import { AppDispatch, RootState } from '@/store/store';

// Define interfaces for file metadata
interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

const DocumentUpload = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const documents = useSelector((state: RootState) => state.admin.documents);
  const loading = useSelector((state: RootState) => state.admin.loading);
  const error = useSelector((state: RootState) => state.admin.error);
  const success = useSelector((state: RootState) => state.admin.success);
  
  // Keep actual File objects in component state
  const [files, setFiles] = useState<{
    governmentId: File | null;
    registrationCertificate: File | null;
    accreditation: File | null;
  }>({
    governmentId: null,
    registrationCertificate: null,
    accreditation: null,
  });
  
  const [formData, setFormData] = useState({
    // Store file metadata objects instead of File objects
    governmentId: documents.governmentId || null,
    registrationCertificate: documents.registrationCertificate || null,
    accreditation: documents.accreditation || null,
    departments: documents.departments || '',
    doctorsCount: documents.doctorsCount || '',
    communicationMode: documents.communicationMode || '',
  });
  
  const [formErrors, setFormErrors] = useState({
    governmentId: '',
    registrationCertificate: '',
    departments: '',
    doctorsCount: '',
    communicationMode: '',
  });
  
  // Refs for file inputs
  const govIdInputRef = useRef<HTMLInputElement>(null);
  const regCertInputRef = useRef<HTMLInputElement>(null);
  const accreditationInputRef = useRef<HTMLInputElement>(null);
  
  const communicationModes = [
    'Email',
    'Phone',
    'SMS',
    'WhatsApp',
    'In-app Notifications'
  ];
  
  const validateForm = () => {
    let isValid = true;
    const errors = {
      governmentId: '',
      registrationCertificate: '',
      departments: '',
      doctorsCount: '',
      communicationMode: '',
    };
    
    if (!files.governmentId) {
      errors.governmentId = 'Government-issued ID is required';
      isValid = false;
    }
    
    if (!files.registrationCertificate) {
      errors.registrationCertificate = 'Registration certificate is required';
      isValid = false;
    }
    
    if (!formData.departments.trim()) {
      errors.departments = 'Departments & specialties are required';
      isValid = false;
    }
    
    if (!formData.doctorsCount.trim()) {
      errors.doctorsCount = 'Number of doctors is required';
      isValid = false;
    } else if (isNaN(Number(formData.doctorsCount)) || Number(formData.doctorsCount) <= 0) {
      errors.doctorsCount = 'Please enter a valid number';
      isValid = false;
    }
    
    if (!formData.communicationMode) {
      errors.communicationMode = 'Communication mode is required';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Convert File to serializable metadata
  const createFileMetadata = (file: File): FileMetadata => {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    };
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'governmentId' | 'registrationCertificate' | 'accreditation') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Store actual file in component state
      setFiles(prev => ({
        ...prev,
        [fileType]: file,
      }));
      
      // Store serializable metadata in form state
      setFormData(prev => ({
        ...prev,
        [fileType]: createFileMetadata(file),
      }));
      
      // Clear error
      if (formErrors[fileType as keyof typeof formErrors]) {
        setFormErrors(prev => ({ ...prev, [fileType]: '' }));
      }
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Save serializable metadata to Redux
    dispatch(updateDocuments(formData));
    
    // Submit all data with actual files
    dispatch(submitAdminData({
      governmentId: files.governmentId || undefined,
      registrationCertificate: files.registrationCertificate || undefined,
      accreditation: files.accreditation || undefined,
    }));
  };
  
  const handleBack = () => {
    dispatch({ type: 'admin/setCurrentStep', payload: 1 });
    router.push('/clinic-management/admin-onboarding/clinic-info');
  };
  
  const getFileName = (fileData: FileMetadata | null) => {
    if (!fileData) return '';
    return fileData.name.length > 20 ? fileData.name.substring(0, 17) + '...' : fileData.name;
  };
  
  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
      onSubmit={handleSubmit}
    >
      {/* Government ID Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Upload Government-Issued ID</label>
        <div className="relative">
          <input
            type="file"
            ref={govIdInputRef}
            onChange={(e) => handleFileChange(e, 'governmentId')}
            className="hidden"
            accept="image/*,.pdf"
          />
          <div 
            className={`flex items-center justify-between w-full px-4 py-3 rounded-full border 
            ${formErrors.governmentId ? 'border-red-500' : 'border-gray-300'} 
            cursor-pointer focus:outline-none hover:bg-gray-50`}
            onClick={() => govIdInputRef.current?.click()}
          >
            <span className="text-gray-500 truncate">
              {formData.governmentId ? getFileName(formData.governmentId as FileMetadata) : 'Choose File'}
            </span>
            <span className="bg-[#00665B] text-white p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </span>
          </div>
        </div>
        {formErrors.governmentId && (
          <p className="text-red-500 text-xs mt-1 ml-4">{formErrors.governmentId}</p>
        )}
      </div>
      
      {/* Registration Certificate Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Upload Clinic/Hospital Registration Certificate</label>
        <div className="relative">
          <input
            type="file"
            ref={regCertInputRef}
            onChange={(e) => handleFileChange(e, 'registrationCertificate')}
            className="hidden"
            accept="image/*,.pdf"
          />
          <div 
            className={`flex items-center justify-between w-full px-4 py-3 rounded-full border 
            ${formErrors.registrationCertificate ? 'border-red-500' : 'border-gray-300'} 
            cursor-pointer focus:outline-none hover:bg-gray-50`}
            onClick={() => regCertInputRef.current?.click()}
          >
            <span className="text-gray-500 truncate">
              {formData.registrationCertificate ? getFileName(formData.registrationCertificate as FileMetadata) : 'Choose File'}
            </span>
            <span className="bg-[#00665B] text-white p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </span>
          </div>
        </div>
        {formErrors.registrationCertificate && (
          <p className="text-red-500 text-xs mt-1 ml-4">{formErrors.registrationCertificate}</p>
        )}
      </div>
      
      {/* Accreditation Upload (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Upload Medical Association Accreditation (If Applicable)</label>
        <div className="relative">
          <input
            type="file"
            ref={accreditationInputRef}
            onChange={(e) => handleFileChange(e, 'accreditation')}
            className="hidden"
            accept="image/*,.pdf"
          />
          <div 
            className="flex items-center justify-between w-full px-4 py-3 rounded-full border border-gray-300 cursor-pointer focus:outline-none hover:bg-gray-50"
            onClick={() => accreditationInputRef.current?.click()}
          >
            <span className="text-gray-500 truncate">
              {formData.accreditation ? getFileName(formData.accreditation as FileMetadata) : 'Choose File'}
            </span>
            <span className="bg-[#00665B] text-white p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </span>
          </div>
        </div>
      </div>
      
      {/* Departments & Specialties */}
      <div>
        <input
          type="text"
          name="departments"
          value={formData.departments}
          onChange={handleChange}
          placeholder="Departments & Specialties Offered"
          className={`w-full px-4 py-3 rounded-full border ${
            formErrors.departments ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-[#00665B]`}
        />
        {formErrors.departments && (
          <p className="text-red-500 text-xs mt-1 ml-4">{formErrors.departments}</p>
        )}
      </div>
      
      {/* Number of Doctors */}
      <div>
        <input
          type="text"
          name="doctorsCount"
          value={formData.doctorsCount}
          onChange={handleChange}
          placeholder="Number Of Doctors In Clinic/ Hospital"
          className={`w-full px-4 py-3 rounded-full border ${
            formErrors.doctorsCount ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-[#00665B]`}
        />
        {formErrors.doctorsCount && (
          <p className="text-red-500 text-xs mt-1 ml-4">{formErrors.doctorsCount}</p>
        )}
      </div>
      
      {/* Preferred Communication Mode */}
      <div>
        <div className={`relative w-full rounded-full border ${
            formErrors.communicationMode ? 'border-red-500' : 'border-gray-300'
          } focus-within:ring-2 focus-within:ring-[#00665B]`}>
          <select
            name="communicationMode"
            value={formData.communicationMode}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-full appearance-none bg-transparent focus:outline-none"
          >
            <option value="" disabled>Preferred Mode Of Communication</option>
            {communicationModes.map((mode) => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        {formErrors.communicationMode && (
          <p className="text-red-500 text-xs mt-1 ml-4">{formErrors.communicationMode}</p>
        )}
      </div>
      
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">
          Registration successful! You will be redirected shortly.
        </div>
      )}
      
      <div className="pt-4 flex space-x-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleBack}
          disabled={loading}
          className="w-1/3 bg-gray-200 text-gray-700 py-3 rounded-full font-medium hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-70"
        >
          Back
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-2/3 bg-[#00665B] text-white py-3 rounded-full font-medium hover:bg-[#005249] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00665B] disabled:opacity-70"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Submit'
          )}
        </motion.button>
      </div>
    </motion.form>
  );
};

export default DocumentUpload;