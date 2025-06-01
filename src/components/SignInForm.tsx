'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  AuthError
} from 'firebase/auth'
import { auth } from '../../firebase/config'
import { useRouter, useSearchParams  } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

// import {useAuthState} from "react-firebase-hooks/auth"

interface FormState {
  email: string;
  password: string;
}

export default function SignInForm() {
  const [form, setForm] = useState<FormState>({ email: '', password: '' })
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const router = useRouter()
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { email, password } = form
    
    if (!email || !password) {
      setError('Please enter email and password')
      setLoading(false)
      return
    }

    try {
      const authenticatedUser = await signInWithEmailAndPassword(auth, email, password)
      console.log(authenticatedUser.user)
      // console.log("returnUrl: ", returnUrl);
      router.push(returnUrl ?? '/')
    } catch (err) {
      console.error(err)
      const authError = err as AuthError
      
      // Properly handle different Firebase auth error codes
      switch (authError.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address')
          break
        case 'auth/wrong-password':
          setError('Invalid password')
          break
        case 'auth/invalid-email':
          setError('Invalid email format')
          break
        case 'auth/invalid-credential':
          setError('Invalid email or password')
          break
        case 'auth/too-many-requests':
          setError('Too many failed login attempts. Please try again later')
          break
        case 'auth/user-disabled':
          setError('This account has been disabled')
          break
        case 'auth/network-request-failed':
          setError('Network error. Please check your connection')
          break
        default:
          setError('Sign in failed. Please try again')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      router.push(returnUrl ?? '/')
    } catch (err) {
      console.error(err)
      setError('Google sign-in failed')
      setLoading(false)
    }
  }

  const handleFacebookSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      const provider = new FacebookAuthProvider()
      await signInWithPopup(auth, provider)
      router.push(returnUrl ?? '/')
    } catch (err) {
      console.error(err)
      setError('Facebook sign-in failed')
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyan-50 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl overflow-hidden rounded-3xl shadow-lg bg-white flex flex-col md:flex-row"
      >
        {/* Left Side - Form */}
        <div className="flex-1 p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-teal-800">Sign in to Medycall</h2>
            <p className="text-gray-500 mt-2">Begin Your Journey!</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSignIn}>
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <div 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mb-6">
              <Link href="/forgot-password" className="text-sm text-teal-600 hover:text-teal-800">
                Forgot Password
              </Link>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-teal-700 text-white font-medium rounded-lg flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {loading ? "Signing In..." : "Sign In"}
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="my-8 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <div className="px-4 text-sm text-gray-500">or</div>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <div className="flex justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGoogleSignIn}
                className="p-2 rounded-full border border-gray-300 hover:bg-gray-50"
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFacebookSignIn}
                className="p-2 rounded-full border border-gray-300 hover:bg-gray-50"
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </motion.button>
            </div>
          </motion.div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="text-teal-600 font-medium hover:text-teal-800">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Teal Background */}
        <div className="hidden md:flex md:w-2/5 bg-teal-700 text-white p-12 flex-col justify-center items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center"
          >
            <div className="mb-6 flex justify-center">
              <div className="p-4 rounded-full border-4 border-white/30 inline-block">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4">Hello!</h2>
            <p className="text-white/80">
              Enter your personal details<br />and start journey with us
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}