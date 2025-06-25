import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { useToast } from '../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from '../components/ui/dialog';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Github,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  LogIn,
  X,
  Mail,
  Lock,
} from 'lucide-react';
import Tooltip from '../components/ui/Tooltip';
import { AuthService } from '../api/client';
import Cookies from 'js-cookie'; // Make sure to install this package: npm install js-cookie
import './Login.css'; // Import your CSS file for styling
import { GoogleLoginButton } from './google-auth';

const LoginModal = ({ isOpen, onClose }) => {
  // States for form mode and steps
  const [mode, setMode] = useState('login'); // login or signup
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Form data state
  const [formData, setFormData] = useState({
    // Login fields
    email: '',
    password: '',
    rememberMe: false,
    // Additional signup fields
    firstName: '',
    lastName: '',
    username: '',
    phoneNumber: '',
    confirmPassword: '',
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  const { toast } = useToast();
  const { register, login, isAuthenticated } = useAuth();

  // Cookie configuration constants
  const TOKEN_COOKIE_NAME = 'auth_token';
  const REMEMBER_ME_EXPIRY = 7; // 7 days for remember me
  const DEFAULT_EXPIRY = 1; // 1 day default expiry

  // Reset form when opening modal
  useEffect(() => {
    if (isOpen) {
      setMode('login');
      setCurrentStep(1);
      setErrors({});
      setAuthError('');
      setFormData({
        email: '',
        password: '',
        rememberMe: false,
        firstName: '',
        lastName: '',
        username: '',
        phoneNumber: '',
        confirmPassword: '',
      });
    }
  }, [isOpen]);

  // Close modal if authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
    }
  }, [isAuthenticated, isOpen, onClose]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === 'checkbox' ? checked : value,
    });

    // Clear error when field is edited
    if (errors[id]) {
      setErrors({
        ...errors,
        [id]: undefined,
      });
    }

    // Clear auth error when user edits fields
    if (authError && (id === 'email' || id === 'password')) {
      setAuthError('');
    }
  };

  // Format phone number as user types
  const formatPhoneNumber = (e) => {
    const input = e.target.value.replace(/\D/g, '').substring(0, 10);
    setFormData({
      ...formData,
      phoneNumber: input,
    });
  };

  const validateStep = () => {
    const newErrors = {};

    if (mode === 'login') {
      if (currentStep === 1) {
        // Validate email step
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Email is invalid';
        }
      } else if (currentStep === 2) {
        // Validate password step
        if (!formData.password) {
          newErrors.password = 'Password is required';
        }
      }
    } else if (mode === 'signup') {
      if (currentStep === 1) {
        // Validate first step of signup
        if (!formData.firstName.trim())
          newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim())
          newErrors.lastName = 'Last name is required';
        if (!formData.username.trim())
          newErrors.username = 'Username is required';
      } else if (currentStep === 2) {
        // Validate second step of signup (email and phone)
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Email is invalid';
        }

        // Phone validation (if provided)
        if (
          formData.phoneNumber &&
          !/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))
        ) {
          newErrors.phoneNumber = 'Phone number must be 10 digits';
        }
      } else if (currentStep === 3) {
        // Validate third step of signup (password)
        if (!formData.password) {
          newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  /**
   * Save authentication token to cookies
   * @param {string} token - The authentication token
   * @param {boolean} rememberMe - Whether to use extended expiry
   */
  const saveAuthToken = (token, rememberMe) => {
    try {
      // Set cookie with appropriate expiration
      const expiryDays = rememberMe ? REMEMBER_ME_EXPIRY : DEFAULT_EXPIRY;

      // Set cookie options
      const cookieOptions = {
        expires: expiryDays, // Days until expiry
        secure: process.env.NODE_ENV === 'production', // Use secure in production
        sameSite: 'strict', // Strict same-site policy for security
      };

      // Save token to cookie
      Cookies.set(TOKEN_COOKIE_NAME, token, cookieOptions);
      // Store expiration timestamp in localStorage for tracking
      const expiryTime = new Date(
        Date.now() + expiryDays * 24 * 60 * 60 * 1000
      ).getTime();
      localStorage.setItem('tokenExpiry', expiryTime.toString());

      console.log(`Token saved with ${expiryDays} day expiry`);
    } catch (error) {
      console.error('Error saving authentication token:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep()) {
      return;
    }

    setIsLoading(true);
    setAuthError('');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      if (mode === 'login') {
        // Handle login
        const response = await login(
          formData.email,
          formData.password,
          formData.rememberMe
        );

        if (response.success) {
          // Check if the response contains a token
          if (response.token) {
            // Save token based on remember me selection
            saveAuthToken(response.token, formData.rememberMe);
          }

          toast({
            title: 'Welcome back!',
            description: `Logged in as ${formData.email}${
              formData.rememberMe ? '' : ' (Session expires in 24 hours)'
            }`,
          });
          onClose();
        } else {
          setAuthError(
            response.message || 'Invalid email or password. Please try again.'
          );
        }
      } else {
        // Handle signup
        const userData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          email: formData.email,
          phoneNumber: formData.phoneNumber || null,
          password: formData.password,
        };

        const response = await register(userData);

        if (response.success) {
          toast({
            title: 'Success!',
            description: 'Account created successfully.',
          });

          // Auto-login after signup
          const loginResponse = await login(formData.email, formData.password);

          // Save token with default expiry after signup (not using remember me by default)
          if (loginResponse.success && loginResponse.token) {
            saveAuthToken(loginResponse.token, false);
          }

          onClose();
        } else {
          setAuthError(
            response.message || 'Failed to create account. Please try again.'
          );
        }
      }
    } catch (error) {
      console.error(`${mode} error:`, error);
      setAuthError(
        error.message ||
          `Failed to ${
            mode === 'login' ? 'log in' : 'create account'
          }. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider) => {
    setSocialLoading(provider);
    setAuthError('');

    try {
      toast({
        title: 'Feature Not Implemented',
        description: `Sign ${
          mode === 'login' ? 'in' : 'up'
        } with ${provider} is not implemented yet.`,
        variant: 'default',
      });
    } catch (error) {
      console.error(`${provider} auth error:`, error);
      setAuthError(
        `Failed to authenticate with ${provider}. Please try again.`
      );
    } finally {
      setSocialLoading('');
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setCurrentStep(1);
    setErrors({});
    setAuthError('');
  };

  // Get step description for current mode and step
  const getStepDescription = () => {
    if (mode === 'login') {
      return currentStep === 1
        ? 'Enter your email address'
        : 'Enter your password and preferences';
    } else {
      return currentStep === 1
        ? 'Your info'
        : currentStep === 2
        ? 'Contact details'
        : 'Security';
    }
  };

  // Render the correct form based on mode and step
  const renderForm = () => {
    if (mode === 'login') {
      if (currentStep === 1) {
        // Login Step 1: Email
        return (
          <div className='space-y-4'>
            {authError && (
              <div className='p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 flex items-start'>
                <AlertCircle className='h-4 w-4 mr-2 mt-0.5 flex-shrink-0' />
                <span>{authError}</span>
              </div>
            )}

            <div className='flex flex-col space-y-2'>
              <Label
                htmlFor='email'
                className={errors.email ? 'text-red-500' : ''}
              >
                Email Address
              </Label>
              <Input
                id='email'
                type='email'
                placeholder='Enter your email'
                value={formData.email}
                onChange={handleChange}
                className={errors.email || authError ? 'border-red-500' : ''}
                aria-invalid={errors.email || authError ? 'true' : 'false'}
                autoFocus
              />
              {errors.email && (
                <p className='text-xs text-red-500 flex items-center mt-1'>
                  <AlertCircle className='h-3 w-3 mr-1' />
                  {errors.email}
                </p>
              )}
            </div>

            <Button
              type='button'
              onClick={nextStep}
              className='w-full'
              disabled={!formData.email}
            >
              <div className='flex items-center gap-2'>
                <Mail className='w-4 h-4' />
                <span className='mb-0.5'>Continue</span>
                <ChevronRight className='w-4 h-4' />
              </div>
            </Button>
          </div>
        );
      } else if (currentStep === 2) {
        // Login Step 2: Password and Options
        return (
          <form onSubmit={handleSubmit}>
            <div className='space-y-4'>
              {authError && (
                <div className='p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 flex items-start'>
                  <AlertCircle className='h-4 w-4 mr-2 mt-0.5 flex-shrink-0' />
                  <span>{authError}</span>
                </div>
              )}

              {/* Show email for context */}
              <div className='p-3 bg-emerald-50/75 dark:bg-gray-800 rounded-md'>
                <p className='text-sm text-gray-600 dark:text-gray-300'>
                  Logging in as:{' '}
                  <span className='font-semibold'>{formData.email}</span>
                </p>
              </div>

              <div className='flex flex-col space-y-2'>
                <Label
                  htmlFor='password'
                  className={errors.password ? 'text-red-500' : ''}
                >
                  Password
                </Label>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Enter your password'
                    value={formData.password}
                    onChange={handleChange}
                    className={
                      errors.password || authError
                        ? 'border-red-500 pr-10'
                        : 'pr-10'
                    }
                    aria-invalid={
                      errors.password || authError ? 'true' : 'false'
                    }
                    autoFocus
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='absolute right-0 top-1/2 -translate-y-1/2 hover:bg-transparent'
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex='-1'
                  >
                    <Tooltip
                      content={showPassword ? 'Hide password' : 'Show password'}
                      placement='right'
                    >
                      {showPassword ? (
                        <EyeOff className='h-4 w-4 text-gray-500' />
                      ) : (
                        <Eye className='h-4 w-4 text-gray-500' />
                      )}
                    </Tooltip>
                  </Button>
                </div>
                {errors.password && (
                  <p className='text-xs text-red-500 flex items-center mt-1'>
                    <AlertCircle className='h-3 w-3 mr-1' />
                    {errors.password}
                  </p>
                )}
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='rememberMe'
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, rememberMe: checked })
                  }
                />
                <Label
                  htmlFor='rememberMe'
                  className='text-sm font-medium leading-none cursor-pointer'
                >
                  Remember me for 7 days
                </Label>
              </div>

              <div
                className={`flex justify-center gap-2 ${isLoading && 'mt-6'}`}
              >
                <Button
                  type='button'
                  onClick={prevStep}
                  variant='outline'
                  className={`w-1/2 ${isLoading && 'hidden'}`}
                >
                  <div className='flex items-center gap-2'>
                    <ChevronLeft className='w-4 h-4' />
                    Back
                  </div>
                </Button>

                {isLoading ? (
                  // <div className='flex items-center gap-2'>
                  //   <div className='typing-indicator'>
                  //     <div className='typing-circle'></div>
                  //     <div className='typing-circle'></div>
                  //     <div className='typing-circle'></div>
                  //     <div className='typing-shadow'></div>
                  //     <div className='typing-shadow'></div>
                  //     <div className='typing-shadow'></div>
                  //   </div>
                  // </div>
                  <div className='relative w-12 h-12'>
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className='absolute w-1 h-2.5 bg-gray-800 rounded-full'
                        style={{
                          top: '10px',
                          left: '50%',
                          transformOrigin: '0.125rem 1.050rem',
                          transform: `translateX(-50%) rotate(${i * 30}deg)`,
                          opacity: 0.1,
                          animation: `iosSpinner 1s linear infinite`,
                          animationDelay: `${i * (1000 / 12)}ms`,
                        }}
                      ></div>
                    ))}
                  </div>
                ) : (
                  <Button
                    type='submit'
                    className={`${
                      isLoading
                        ? 'w-full bg-transparent dark:bg-transparent shadow-none'
                        : 'w-1/2'
                    }`}
                    disabled={isLoading}
                  >
                    <div className='flex items-center gap-2'>
                      Login
                      <LogIn className='w-4 h-4' />
                    </div>
                  </Button>
                )}
              </div>
            </div>
          </form>
        );
      }
    } else if (mode === 'signup') {
      if (currentStep === 1) {
        return (
          <div className='space-y-4'>
            {authError && (
              <div className='p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 flex items-start'>
                <AlertCircle className='h-4 w-4 mr-2 mt-0.5 flex-shrink-0' />
                <span>{authError}</span>
              </div>
            )}

            <div className='grid grid-cols-2 gap-4'>
              <div className='flex flex-col space-y-2'>
                <Label
                  htmlFor='firstName'
                  className={errors.firstName ? 'text-red-500' : ''}
                >
                  First Name
                </Label>
                <Input
                  id='firstName'
                  type='text'
                  placeholder='First name'
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? 'border-red-500' : ''}
                  aria-invalid={errors.firstName ? 'true' : 'false'}
                />
                {errors.firstName && (
                  <p className='text-xs text-red-500 flex items-center mt-1'>
                    <AlertCircle className='h-3 w-3 mr-1' />
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div className='flex flex-col space-y-2'>
                <Label
                  htmlFor='lastName'
                  className={errors.lastName ? 'text-red-500' : ''}
                >
                  Last Name
                </Label>
                <Input
                  id='lastName'
                  type='text'
                  placeholder='Last name'
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? 'border-red-500' : ''}
                  aria-invalid={errors.lastName ? 'true' : 'false'}
                />
                {errors.lastName && (
                  <p className='text-xs text-red-500 flex items-center mt-1'>
                    <AlertCircle className='h-3 w-3 mr-1' />
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className='flex flex-col space-y-2'>
              <Label
                htmlFor='username'
                className={errors.username ? 'text-red-500' : ''}
              >
                Username
              </Label>
              <Input
                id='username'
                type='text'
                placeholder='Choose a username'
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? 'border-red-500' : ''}
                aria-invalid={errors.username ? 'true' : 'false'}
              />
              {errors.username && (
                <p className='text-xs text-red-500 flex items-center mt-1'>
                  <AlertCircle className='h-3 w-3 mr-1' />
                  {errors.username}
                </p>
              )}
            </div>

            <Button type='button' onClick={nextStep} className='w-full'>
              <div className='flex items-center gap-2'>
                Next
                <ChevronRight className='w-4 h-4' />
              </div>
            </Button>
          </div>
        );
      } else if (currentStep === 2) {
        return (
          <div className='space-y-4'>
            {authError && (
              <div className='p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 flex items-start'>
                <AlertCircle className='h-4 w-4 mr-2 mt-0.5 flex-shrink-0' />
                <span>{authError}</span>
              </div>
            )}

            <div className='flex flex-col space-y-2'>
              <Label
                htmlFor='email'
                className={errors.email ? 'text-red-500' : ''}
              >
                Email
              </Label>
              <Input
                id='email'
                type='email'
                placeholder='Enter your email'
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'border-red-500' : ''}
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email && (
                <p className='text-xs text-red-500 flex items-center mt-1'>
                  <AlertCircle className='h-3 w-3 mr-1' />
                  {errors.email}
                </p>
              )}
            </div>

            <div className='flex flex-col space-y-2'>
              <Label
                htmlFor='phoneNumber'
                className={errors.phoneNumber ? 'text-red-500' : ''}
              >
                Phone Number (Optional)
              </Label>
              <Input
                id='phoneNumber'
                type='tel'
                placeholder='Enter your phone number'
                value={formData.phoneNumber}
                onChange={formatPhoneNumber}
                className={errors.phoneNumber ? 'border-red-500' : ''}
                aria-invalid={errors.phoneNumber ? 'true' : 'false'}
              />
              {errors.phoneNumber && (
                <p className='text-xs text-red-500 flex items-center mt-1'>
                  <AlertCircle className='h-3 w-3 mr-1' />
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            <div className='flex gap-2'>
              <Button
                type='button'
                onClick={prevStep}
                variant='outline'
                className='w-1/2'
              >
                <div className='flex items-center gap-2'>
                  <ChevronLeft className='w-4 h-4' />
                  Back
                </div>
              </Button>
              <Button type='button' onClick={nextStep} className='w-1/2'>
                <div className='flex items-center gap-2'>
                  Next
                  <ChevronRight className='w-4 h-4' />
                </div>
              </Button>
            </div>
          </div>
        );
      } else if (currentStep === 3) {
        return (
          <form onSubmit={handleSubmit}>
            <div className='space-y-4'>
              {authError && (
                <div className='p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 flex items-start'>
                  <AlertCircle className='h-4 w-4 mr-2 mt-0.5 flex-shrink-0' />
                  <span>{authError}</span>
                </div>
              )}

              <div className='flex flex-col space-y-2'>
                <Label
                  htmlFor='password'
                  className={errors.password ? 'text-red-500' : ''}
                >
                  Password
                </Label>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Create a password'
                    value={formData.password}
                    onChange={handleChange}
                    className={
                      errors.password ? 'border-red-500 pr-10' : 'pr-10'
                    }
                    aria-invalid={errors.password ? 'true' : 'false'}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='absolute right-0 top-1/2 -translate-y-1/2 hover:bg-transparent'
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex='-1'
                  >
                    <Tooltip
                      content={showPassword ? 'Hide password' : 'Show password'}
                      placement='right'
                    >
                      {showPassword ? (
                        <EyeOff className='h-4 w-4 text-gray-500' />
                      ) : (
                        <Eye className='h-4 w-4 text-gray-500' />
                      )}
                    </Tooltip>
                  </Button>
                </div>
                {errors.password && (
                  <p className='text-xs text-red-500 flex items-center mt-1'>
                    <AlertCircle className='h-3 w-3 mr-1' />
                    {errors.password}
                  </p>
                )}
              </div>

              <div className='flex flex-col space-y-2'>
                <Label
                  htmlFor='confirmPassword'
                  className={errors.confirmPassword ? 'text-red-500' : ''}
                >
                  Confirm Password
                </Label>
                <div className='relative'>
                  <Input
                    id='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder='Confirm your password'
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={
                      errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'
                    }
                    aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='absolute right-0 top-1/2 -translate-y-1/2 hover:bg-transparent'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex='-1'
                  >
                    <Tooltip
                      content={
                        showConfirmPassword ? 'Hide password' : 'Show password'
                      }
                      placement='right'
                    >
                      {showConfirmPassword ? (
                        <EyeOff className='h-4 w-4 text-gray-500' />
                      ) : (
                        <Eye className='h-4 w-4 text-gray-500' />
                      )}
                    </Tooltip>
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className='text-xs text-red-500 flex items-center mt-1'>
                    <AlertCircle className='h-3 w-3 mr-1' />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div
                className={`flex justify-center gap-2 ${isLoading && 'mt-6'}`}
              >
                <Button
                  type='button'
                  onClick={prevStep}
                  variant='outline'
                  className={`flex-1 ${isLoading && 'hidden'}`}
                >
                  <div className='flex items-center gap-2'>
                    <ChevronLeft className='w-4 h-4' />
                    Back
                  </div>
                </Button>
                {isLoading ? (
                  <div className='relative w-12 h-12'>
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className='absolute w-1 h-2.5 bg-gray-800 rounded-full'
                        style={{
                          top: '10px',
                          left: '50%',
                          transformOrigin: '0.125rem 1.050rem',
                          transform: `translateX(-50%) rotate(${i * 30}deg)`,
                          opacity: 0.1,
                          animation: `spinner 1s linear infinite`,
                          animationDelay: `${i * (1000 / 12)}ms`,
                        }}
                      ></div>
                    ))}
                  </div>
                ) : (
                  <Button
                    type='submit'
                    className={`flex-1 ${
                      isLoading &&
                      'bg-transparent dark:bg-transparent shadow-none'
                    }`}
                    disabled={isLoading}
                  >
                    <div className='flex items-center gap-2'>
                      <UserPlus className='w-4 h-4' />
                      Sign Up
                    </div>
                  </Button>
                )}
              </div>
            </div>
          </form>
        );
      }
    }
  };

  return (
    <Dialog open={!isOpen} onOpenChange={onClose}>
      <DialogOverlay className='backdrop-blur-xs h-screen bg-black/2' />
      <DialogContent
        aria-describedby={'Login or Sign Up'}
        className='max-w-xs sm:max-w-md p-0 overflow-hidden rounded-lg'
      >
        <DialogTitle className='sr-only'>Login or Sign Up</DialogTitle>
        <Card className='border-0 shadow-none'>
          <CardHeader className='relative'>
            <CardTitle>
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {mode === 'login'
                ? `Step ${currentStep} of 2: ${getStepDescription()}`
                : `Step ${currentStep} of 3: ${getStepDescription()}`}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Only show social auth on first step */}
            {currentStep === 1 && (
              <>
                <div className='grid grid-cols-2 gap-4'>
                  {/* <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSocialAuth("google")}
                    disabled={isLoading || !!socialLoading}
                  >
                    {socialLoading === "google" ? (
                      <span className="animate-spin mr-2">⟳</span>
                    ) : (
                      <img
                        src="/google.svg"
                        alt="Google"
                        className="w-5 h-5 mr-2"
                      />
                    )}
                    Google
                  </Button> */}
                  <GoogleLoginButton disabled className='mb-4' />
                  <Button
                    type='button'
                    variant='outline'
                    className='w-full'
                    onClick={() => handleSocialAuth('github')}
                    disabled={isLoading || !!socialLoading}
                  >
                    {socialLoading === 'github' ? (
                      <span className='animate-spin mr-2'>⟳</span>
                    ) : (
                      <Github className='w-5 h-5 mr-2' />
                    )}
                    Github
                  </Button>
                </div>

                <div className='relative'>
                  <div className='absolute inset-0 flex items-center'>
                    <span className='w-full border-t' />
                  </div>
                  <div className='relative flex justify-center text-xs uppercase'>
                    <span className='bg-white text-neutral-600 dark:text-neutral-200 dark:bg-cornsilk-dark px-2 text-muted-foreground'>
                      Or continue with email
                    </span>
                  </div>
                </div>
              </>
            )}

            {renderForm()}
          </CardContent>
          <CardFooter className='justify-center p-4 pt-0'>
            <p className='text-sm text-center text-zinc-700 dark:text-zinc-300'>
              {mode === 'login'
                ? "Don't have an account? "
                : 'Already have an account? '}
              <Button variant='link' className='p-0' onClick={toggleMode}>
                {mode === 'login' ? 'Sign Up' : 'Login'}
              </Button>
            </p>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
