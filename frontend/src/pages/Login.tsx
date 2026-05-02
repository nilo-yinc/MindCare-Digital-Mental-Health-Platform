import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Heart, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  UserCheck, 
  Shield, 
  ShieldCheck, 
  ArrowLeft,
  Key,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/Common/Logo';

import toast from 'react-hot-toast';
import gsap from 'gsap';

// Reusable Shimmer Button
const LoginButton = ({ 
  children, 
  isLoading, 
  onClick,
  type = "submit",
  className = "" 
}: { 
  children: React.ReactNode, 
  isLoading?: boolean, 
  onClick?: () => void,
  type?: "submit" | "button",
  className?: string 
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.1, y: middleY * 0.1 });

    if (shimmerRef.current && !isLoading) {
      gsap.fromTo(shimmerRef.current, 
        { x: '-100%', opacity: 0.5 }, 
        { x: '200%', opacity: 0, duration: 0.8, ease: 'power2.out', overwrite: true }
      );
    }
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isLoading}
      onClick={onClick}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`relative w-full flex justify-center py-4 px-4 text-sm font-bold rounded-2xl text-[#0A0F14] bg-[#00F5D4] hover:bg-[#00D1B2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00F5D4] focus:ring-offset-[#0A0F14] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 overflow-hidden ${className}`}
    >
      <span className="relative z-10 flex items-center justify-center w-full">
        {isLoading ? (
          <div className="flex items-center">
            <div className="w-5 h-5 border-2 border-[#0A0F14]/30 border-t-[#0A0F14] rounded-full animate-spin mr-2" />
            Processing...
          </div>
        ) : (
          children
        )}
      </span>
      <div 
        ref={shimmerRef} 
        className="absolute top-0 bottom-0 left-0 w-1/3 bg-white/40 -skew-x-12 z-0 transform -translate-x-full pointer-events-none" 
      />
    </motion.button>
  );
};

export function Login() {
  const location = useLocation();
  const processedGoogleHashRef = useRef(false);
  const [view, setView] = useState<'login' | 'register' | 'otp' | 'forgot-password' | 'reset-password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('student');
  
  const { login, register, verifyOTP, googleLogin, forgotPassword, resetPassword, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.view) {
      setView(location.state.view);
    }
  }, [location.state]);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const buildRandomToken = () => {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  };

  const startGoogleRedirectAuth = () => {
    if (!googleClientId) {
      toast.error('Google client ID is missing. Please contact support.');
      return;
    }

    const state = buildRandomToken();
    const nonce = buildRandomToken();
    const redirectUri = `${window.location.origin}/auth/google/callback`;

    sessionStorage.setItem('mindcare_google_state', state);
    sessionStorage.setItem('mindcare_google_nonce', nonce);

    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: redirectUri,
      response_type: 'id_token',
      scope: 'openid email profile',
      state,
      nonce,
      prompt: 'select_account',
    });

    window.location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  };

  const handleGoogleSuccess = async (response: any) => {
    try {
      await googleLogin(response.credential);
      toast.success('Welcome back!');
      navigate('/student');
    } catch (error: any) {
      toast.error(error.message || 'Google login failed');
    }
  };

  const handleGooglePopupError = () => {
    toast.error('Popup blocked or unavailable. Switching to redirect sign-in...');
    startGoogleRedirectAuth();
  };

  useEffect(() => {
    if (processedGoogleHashRef.current) return;

    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const idToken = params.get('id_token');
    const state = params.get('state');
    const error = params.get('error');

    if (!idToken && !error) return;
    processedGoogleHashRef.current = true;

    const expectedState = sessionStorage.getItem('mindcare_google_state');
    sessionStorage.removeItem('mindcare_google_state');
    sessionStorage.removeItem('mindcare_google_nonce');

    window.history.replaceState({}, document.title, window.location.pathname + window.location.search);

    if (error) {
      toast.error('Google sign-in was cancelled or failed.');
      return;
    }

    if (!idToken || !state || !expectedState || state !== expectedState) {
      toast.error('Google sign-in validation failed. Please try again.');
      return;
    }

    handleGoogleSuccess({ credential: idToken });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login(email, password);
      if ((result as any).requiresVerification) {
        toast.success((result as any).message);
        setView('otp');
        return;
      }
      toast.success('Welcome back!');
      navigate(`/${(result as any).role}`);
    } catch (error: any) {
      if (error.message.includes('Account not verified')) {
        setView('otp');
      }
      toast.error(error.message || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await register(name, email, password, userType as any);
      if ((result as any).message && !(result as any).token) {
        toast.success((result as any).message);
        setView('otp');
        return;
      }
      toast.success('Account created! Welcome to MindCare.');
      navigate(`/${(result as any).role}`);
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    }
  };


  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await verifyOTP(email, otp);
      toast.success('Verification successful!');
      navigate(`/${user.role}`);
    } catch (error: any) {
      toast.error(error.message || 'Verification failed');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      toast.success('Reset code sent to your email');
      setView('reset-password');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset code');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPassword(email, otp, newPassword);
      toast.success('Password reset successfully');
      setView('login');
    } catch (error: any) {
      toast.error(error.message || 'Reset failed');
    }
  };

  const demoAccounts = [
    { type: 'student', email: 'student@demo.com', password: 'demo123' },
  ];

  const fillDemoAccount = (account: typeof demoAccounts[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    setUserType(account.type);
    setView('login');
  };


  return (
    <div className="min-h-screen bg-[#0A0F14] font-sans flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Auras - Simplified for performance */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[#00F5D4]/5 opacity-20" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        {/* Header */}
        <div className="text-center flex flex-col items-center">
          <Logo withText={false} className="mb-4" />
          <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight">
            {view === 'login' && 'Welcome Back'}
            {view === 'register' && 'Create Account'}
            {view === 'otp' && 'Verify Identity'}
            {view === 'forgot-password' && 'Reset Password'}
            {view === 'reset-password' && 'Enter New Password'}
          </h2>
          <p className="mt-2 text-sm text-slate-400 font-medium">
            {view === 'login' && 'Access your digital sanctuary.'}
            {view === 'register' && 'Join the MindCare community.'}
            {view === 'otp' && 'Enter the code sent to your email.'}
            {view === 'forgot-password' && 'Tell us your email to receive a code.'}
            {view === 'reset-password' && 'Secure your account with a new password.'}
          </p>
        </div>




        {/* Main Form Container */}
        <motion.div
          layout
          className="bg-[#141C24]/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden min-h-[400px] flex flex-col justify-center"
        >
          <AnimatePresence mode="wait">
            {view === 'login' && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
                onSubmit={handleLogin}
              >
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2 tracking-wide">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-[#00F5D4] transition-colors h-5 w-5" strokeWidth={1.5} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-[#0A0F14] border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-[#00F5D4]/50 focus:border-[#00F5D4] transition-all outline-none"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2 tracking-wide">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-[#00F5D4] transition-colors h-5 w-5" strokeWidth={1.5} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 bg-[#0A0F14] border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-[#00F5D4]/50 focus:border-[#00F5D4] transition-all outline-none"
                        placeholder="Enter your password"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showPassword ? <EyeOff className="h-5 w-5" strokeWidth={1.5} /> : <Eye className="h-5 w-5" strokeWidth={1.5} />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input type="checkbox" id="remember" className="peer appearance-none w-5 h-5 bg-[#0A0F14] border border-white/10 rounded-md checked:bg-[#00F5D4] transition-all cursor-pointer" />
                    <label htmlFor="remember" className="ml-3 text-sm font-medium text-slate-400">Remember me</label>
                  </div>
                  <button type="button" onClick={() => setView('forgot-password')} className="text-sm font-medium text-[#00F5D4] hover:text-[#00D1B2]">Forgot password?</button>
                </div>
                <LoginButton isLoading={isLoading}>Sign In</LoginButton>
                <div className="relative py-4 flex items-center">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="flex-shrink mx-4 text-slate-500 text-xs font-bold tracking-widest uppercase">Or continue with</span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>
                <div className="flex justify-center w-full">
                  {googleClientId && (
                    <button 
                      type="button" 
                      onClick={startGoogleRedirectAuth} 
                      className="flex items-center justify-center space-x-2 bg-white text-gray-800 font-bold py-3 px-6 rounded-full shadow-md hover:bg-gray-100 transition duration-300 w-full"
                    >
                      <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                      <span>Continue with Google</span>
                    </button>
                  )}
                </div>
                <p className="text-center text-sm text-slate-400">
                  Don't have an account? <button type="button" onClick={() => setView('register')} className="text-[#00F5D4] font-bold">Create one</button>
                </p>
              </motion.form>
            )}

            {view === 'register' && (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
                onSubmit={handleRegister}
              >
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2 tracking-wide">Full Name</label>
                    <div className="relative group">
                      <UserCheck className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-[#00F5D4] h-5 w-5" strokeWidth={1.5} />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-[#0A0F14] border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-[#00F5D4]/50 transition-all outline-none"
                        placeholder="Enter your name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2 tracking-wide">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-[#00F5D4] h-5 w-5" strokeWidth={1.5} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-[#0A0F14] border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-[#00F5D4]/50 transition-all outline-none"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2 tracking-wide">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-[#00F5D4] h-5 w-5" strokeWidth={1.5} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-[#0A0F14] border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-[#00F5D4]/50 transition-all outline-none"
                        placeholder="Create a password"
                      />
                    </div>
                  </div>
                </div>
                <LoginButton isLoading={isLoading}>Register Account</LoginButton>
                <div className="relative py-4 flex items-center">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="flex-shrink mx-4 text-slate-500 text-xs font-bold tracking-widest uppercase">Or continue with</span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>
                <div className="flex justify-center w-full">
                  {googleClientId && (
                    <button 
                      type="button" 
                      onClick={startGoogleRedirectAuth} 
                      className="flex items-center justify-center space-x-2 bg-white text-gray-800 font-bold py-3 px-6 rounded-full shadow-md hover:bg-gray-100 transition duration-300 w-full"
                    >
                      <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                      <span>Continue with Google</span>
                    </button>
                  )}
                </div>
                <p className="text-center text-sm text-slate-400">
                  Already have an account? <button type="button" onClick={() => setView('login')} className="text-[#00F5D4] font-bold">Sign in</button>
                </p>
              </motion.form>
            )}

            {view === 'otp' && (
              <motion.form
                key="otp"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
                onSubmit={handleVerifyOTP}
              >
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#00F5D4]/10 text-[#00F5D4] mb-4">
                    <ShieldCheck className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2 tracking-wide">Verification Code</label>
                  <div className="relative group">
                    <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-[#00F5D4] h-5 w-5" strokeWidth={1.5} />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-12 pr-4 py-4 bg-[#0A0F14] border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-[#00F5D4]/50 text-center text-2xl tracking-[1em] font-mono outline-none"
                      placeholder="000000"
                    />
                  </div>
                </div>
                <LoginButton isLoading={isLoading}>Verify Code</LoginButton>
                <div className="flex flex-col gap-3">
                  <button type="button" onClick={() => setView('login')} className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-300">
                    <ArrowLeft className="w-4 h-4" /> Back to Sign In
                  </button>
                  <button type="button" onClick={() => handleRegister({ preventDefault: () => {} } as any)} className="flex items-center justify-center gap-2 text-sm text-[#00F5D4] hover:text-[#00D1B2]">
                    <RefreshCw className="w-4 h-4" /> Resend Code
                  </button>
                </div>
              </motion.form>
            )}

            {view === 'forgot-password' && (
              <motion.form
                key="forgot"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
                onSubmit={handleForgotPassword}
              >
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2 tracking-wide">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-[#00F5D4] h-5 w-5" strokeWidth={1.5} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-[#0A0F14] border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:ring-2 focus:ring-[#00F5D4]/50 transition-all outline-none"
                      placeholder="Enter registered email"
                    />
                  </div>
                </div>
                <LoginButton isLoading={isLoading}>Send Reset Code</LoginButton>
                <button type="button" onClick={() => setView('login')} className="w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-300">
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </button>
              </motion.form>
            )}

            {view === 'reset-password' && (
              <motion.form
                key="reset"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
                onSubmit={handleResetPassword}
              >
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2 tracking-wide">Verification Code</label>
                    <div className="relative group">
                      <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 h-5 w-5" strokeWidth={1.5} />
                      <input
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-[#0A0F14] border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-[#00F5D4]/50"
                        placeholder="Enter code"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2 tracking-wide">New Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 h-5 w-5" strokeWidth={1.5} />
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-[#0A0F14] border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-[#00F5D4]/50"
                        placeholder="Create new password"
                      />
                    </div>
                  </div>
                </div>
                <LoginButton isLoading={isLoading}>Reset Password</LoginButton>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Privacy Notice */}
        <div className="pt-4 border-t border-white/5 text-center flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
          <p className="text-xs font-medium text-slate-500">All data is encrypted and HIPAA-compliant.</p>
        </div>
      </motion.div>
    </div>
  );
}
