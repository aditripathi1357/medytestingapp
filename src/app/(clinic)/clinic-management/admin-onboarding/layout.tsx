'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { motion } from 'framer-motion';
import { Provider } from 'react-redux';
import { store } from '@/store/store';

export default function AdminOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <AdminOnboardingWrapper>{children}</AdminOnboardingWrapper>
    </Provider>
  );
}

function AdminOnboardingWrapper({ children }: { children: React.ReactNode }) {
  const currentStep = useSelector((state: RootState) => state.admin.currentStep);
  // const steps = ['Personal Info', 'Clinic Info', 'Documents'];
  
  const getProgressPercentage = () => {
    const stepPercentages = [10, 65, 99];
    return stepPercentages[currentStep] || 0;
  };
  
  return (
    <div className="min-h-screen bg-[#f0f9f9] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-md overflow-hidden max-w-3xl w-full"
      >
        <div className="flex">
          <div className="bg-[#00665B] w-1/3 p-6 text-white flex flex-col">
            <div className="mb-8">
              <div className="flex justify-center mb-2">
                <div className="bg-white/20 rounded-full p-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center">Join Us</h2>
            </div>
            <p className="text-center text-sm mt-auto">
              to keep connected with us
              <br />please enter your personal info
            </p>
          </div>
          <div className="flex-1 p-8">
            <div className="mb-8">
              <h2 className="text-[#00665B] text-2xl font-bold text-center">Admin onboarding</h2>
              <p className="text-gray-500 text-center text-sm">Sign Up & Begin Your Journey!</p>
              
              <div className="mt-4 relative">
                <div className="h-1 bg-gray-200 rounded-full">
                  <motion.div 
                    className="h-1 bg-[#00665B] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgressPercentage()}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="text-[#00665B] text-xs mt-1 text-right">{getProgressPercentage()}%</div>
              </div>
            </div>
            
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
}