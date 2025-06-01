'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  AuthError
} from 'firebase/auth'
import { auth } from '../../firebase/config'
import { useRouter } from 'next/navigation'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
// import Image from 'next/image'

export default function SignUpPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    // Clear error when user starts typing again
    if (error) setError('')
  }

  const checkPhoneExists = async (phoneNumber: string): Promise<boolean> => {
    try {
      setIsChecking(true)
      const response = await axios.post('/api/check-phone', { phoneNumber })
      return response.data.exists
    } catch (err) {
      console.error('Error checking phone number:', err)
      setError('Error verifying phone number. Please try again.')
      return false
    } finally {
      setIsChecking(false)
    }
  }

  const handleSubmit = async () => {
    setError('')
    const { name, email, phone, password, confirmPassword } = form

    // Validate form fields
    if (!name) return setError('Name is required')
    if (!email) return setError('Email is required')
    if (!phone) return setError('Phone number is required')
    if (!password) return setError('Password is required')
    if (password !== confirmPassword) return setError('Passwords do not match')

    try {
      // Check if phone number already exists
      const phoneExists = await checkPhoneExists(phone)
      if (phoneExists) {
        return setError('This phone number is already registered. Please use a different number or sign in.')
      }

      // Proceed with user creation
      const res = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(res.user, { displayName: name })

      // Store phone temporarily for OTP linking
      window.sessionStorage.setItem('userData', JSON.stringify({ name, email, phone }))
      router.push('/sign-up/verify-otp')
    } catch (err: unknown) {
      if (err instanceof Error) {
        const authError = err as AuthError;
        if (authError.code === 'auth/email-already-in-use') {
          setError('Email is already in use')
        } else if (authError.code === 'auth/invalid-email') {
          setError('Invalid email format')
        } else if (authError.code === 'auth/weak-password') {
          setError('Password should be at least 6 characters')
        } else {
          setError('Something went wrong. Please try again.')
        }
      } else {
        setError('Something went wrong. Please try again.')
      }
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const {user} = await signInWithPopup(auth, provider)
      console.log( user.displayName,  user.email)
      window.sessionStorage.setItem('userData', JSON.stringify({ name: user.displayName, email: user.email }))
      router.push('/clinic-management')
    } catch (err: unknown) {
      console.log(err)
      setError('Google Sign-in failed')
    }
  }

  const handleFacebookSignIn = async () => {
    try {
      const provider = new FacebookAuthProvider()
      const {user} = await signInWithPopup(auth, provider)
      window.sessionStorage.setItem('userData', JSON.stringify({ name: user.displayName, email: user.email }))
      router.push('/clinic-management')
      router.push('/clinic-management')
    } catch (error) {
      console.log(error)
      setError('Facebook Sign-in failed')
    }
  }

  const handleSignIn = () => {
    router.push('/sign-in')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-50 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left Section */}
        <div className="bg-teal-700 text-white p-8 md:w-1/3 flex flex-col items-center justify-center text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M12 4C13.1046 4 14 4.89543 14 6H16C16 3.79086 14.2091 2 12 2C9.79086 2 8 3.79086 8 6H10C10 4.89543 10.8954 4 12 4Z" fill="white"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M18 8H6C4.89543 8 4 8.89543 4 10V16C4 18.2091 5.79086 20 8 20H16C18.2091 20 20 18.2091 20 16V10C20 8.89543 19.1046 8 18 8ZM12 14C10.8954 14 10 13.1046 10 12H14C14 13.1046 13.1046 14 12 14Z" fill="white"/>
                <path d="M12 14C13.1046 14 14 13.1046 14 12H10C10 13.1046 10.8954 14 12 14Z" fill="white"/>
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2">Welcome</h2>
          <p className="text-sm opacity-80">to keep connected with us<br />please login with your personal info</p>
        </div>

        {/* Right Section */}
        <div className="p-8 flex-1">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-teal-700">Create Account</h1>
            <p className="text-gray-500 text-sm">Sign Up & Begin Your Journey!</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                name="name"
                onChange={handleChange}
                placeholder="Name"
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-teal-500 pl-10"
              />
              <span className="absolute left-3 top-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </span>
            </div>

            <div className="relative">
              <input
                name="phone"
                onChange={handleChange}
                placeholder="+91"
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-teal-500 pl-10"
              />
              <span className="absolute left-3 top-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </span>
            </div>

            <div className="relative">
              <input
                name="email"
                type="email"
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-teal-500 pl-10"
              />
              <span className="absolute left-3 top-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </span>
            </div>

            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                onChange={handleChange}
                placeholder="Password"
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-teal-500 pl-10"
              />
              <span className="absolute left-3 top-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-teal-500 pl-10"
              />
              <span className="absolute left-3 top-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </span>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm bg-red-50 p-2 rounded"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isChecking}
              className={`w-full ${isChecking ? 'bg-teal-500' : 'bg-teal-700'} text-white py-3 rounded-lg font-medium transition duration-300 ${isChecking ? 'cursor-not-allowed' : ''}`}
            >
              {isChecking ? 'Checking...' : 'Sign Up'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSignIn}
              className="w-full bg-white text-teal-700 py-3 rounded-lg font-medium border border-teal-700 transition duration-300 mt-3"
            >
              Sign In
            </motion.button>

            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="mx-4 text-gray-500 text-sm">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <div className="flex justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleGoogleSignIn}
                className="p-2 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleFacebookSignIn}
                className="p-2 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}