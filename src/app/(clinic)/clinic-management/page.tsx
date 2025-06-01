'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { setManagementType } from '@/store/adminSlice';

const ClinicManagement = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSelection = (type: 'admin' | 'doctor') => {
    dispatch(setManagementType(type));
    router.push('/clinic-management/admin-onboarding/personal-info');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f9f9] flex items-center justify-center p-4">
      <motion.div 
        className="bg-white rounded-lg shadow-md overflow-hidden max-w-3xl w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex">
          <div className="bg-[#00665B] w-1/4 p-6"></div>
          <div className="flex-1 p-10">
            <motion.h1 
              className="text-[#00665B] text-3xl font-bold mb-10 text-center"
              variants={itemVariants}
            >
              How is your clinic managed?
            </motion.h1>

            <motion.div className="space-y-6" variants={containerVariants}>
              <motion.div 
                className="flex items-center gap-4 mb-6"
                variants={itemVariants}
              >
                <div className="w-16 h-16 flex items-center justify-center">
                  <div className="bg-[#00665B] p-3 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-gray-500">Reception D...</p>
                </div>
                <button 
                  onClick={() => handleSelection('admin')} 
                  className="bg-[#00665B] text-white py-2 px-4 rounded-md hover:bg-[#005249] transition-colors"
                >
                  Managed by Admin
                </button>
              </motion.div>

              <motion.div 
                className="flex items-center gap-4"
                variants={itemVariants}
              >
                <div className="w-16 h-16 flex items-center justify-center">
                  <div className="bg-[#00665B] p-3 rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-gray-500">Doctor</p>
                </div>
                <button 
                  onClick={() => handleSelection('doctor')} 
                  className="bg-[#00665B] text-white py-2 px-4 rounded-md hover:bg-[#005249] transition-colors"
                >
                  Doctor manages everything
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ClinicManagement;