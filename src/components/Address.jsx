import React, { lazy, useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Pencil,
  Save,
  X,
  Building,
  MapPin,
  Navigation,
  Route,
  Map,
  Building2,
  Globe,
  Hash,
  Tag,
  Home,
  ChevronDown,
} from 'lucide-react';

import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

import { useToast } from '../hooks/use-toast';

import { AuthService, UserService } from '../api/client';
import * as Separator from '@radix-ui/react-separator';

// Indian states matching backend
const indianStates = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Ladakh',
  'Lakshadweep',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

// Address validation functions matching backend
const validatePinCode = (pinCode) => {
  if (!pinCode) return { isValid: true, error: null }; // Optional field
  const pinRegex = /^[1-9][0-9]{5}$/;
  const isValid = pinRegex.test(pinCode.toString());
  return {
    isValid,
    error: isValid ? null : 'PIN code must be 6 digits and cannot start with 0',
  };
};

const validateAddress = (address) => {
  const errors = [];

  // Validate PIN code
  if (address.pinCode) {
    const pinValidation = validatePinCode(address.pinCode);
    if (!pinValidation.isValid) {
      errors.push(pinValidation.error);
    }
  }

  // Validate state
  if (address.state && !indianStates.includes(address.state)) {
    errors.push('Please select a valid Indian state');
  }

  // Validate country (should always be India)
  if (address.country && address.country !== 'India') {
    errors.push('Only Indian addresses are supported');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const Address = ({ user, userAddress, setUserAddress, showToast }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [editingAddress, setEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState({ ...userAddress });
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Toast function with fallback
  const displayToast = (title, description, variant = 'default') => {
    if (showToast) {
      showToast(title, description, variant);
    } else if (toast) {
      toast({ variant, title, description });
    }
  };

  // Fetch user profile and address on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user || !user.id) {
        setIsInitialLoading(false);
        return;
      }

      try {
        setIsInitialLoading(true);
        const response = await UserService.getUserProfile(user.id);

        if (response.success && response.data) {
          const profileData = response.data;

          // Update address if it exists in the profile
          if (profileData.address) {
            setUserAddress(profileData.address);
            setTempAddress(profileData.address);
          }
        } else {
          console.warn('Failed to fetch user profile:', response.message);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);

        // Only show error toast if it's not a 404 (user profile not found)
        if (error.response?.status !== 404) {
          displayToast(
            'Loading Error',
            'Failed to load address information. Please refresh the page.',
            'destructive'
          );
        }
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchUserProfile();
  }, [user?.id, setUserAddress]);

  // Update temp address when userAddress changes
  useEffect(() => {
    setTempAddress({ ...userAddress });
  }, [userAddress]);

  const getAddressFieldIcon = (field) => {
    const iconMap = {
      houseNumber: <Home className='h-4 w-4 text-slate-400' />,
      buildingName: <Building className='h-4 w-4 text-slate-400' />,
      locality: <MapPin className='h-4 w-4 text-slate-400' />,
      landmark: <Navigation className='h-4 w-4 text-slate-400' />,
      street: <Route className='h-4 w-4 text-slate-400' />,
      area: <Map className='h-4 w-4 text-slate-400' />,
      city: <Building2 className='h-4 w-4 text-slate-400' />,
      district: <MapPin className='h-4 w-4 text-slate-400' />,
      state: <Globe className='h-4 w-4 text-slate-400' />,
      pinCode: <Hash className='h-4 w-4 text-slate-400' />,
      addressType: <Tag className='h-4 w-4 text-slate-400' />,
    };
    return iconMap[field] || <MapPin className='h-4 w-4 text-slate-400' />;
  };

  const handleAddressEdit = (field, value) => {
    setTempAddress((prev) => ({ ...prev, [field]: value }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddressFieldEdit = () => {
    setEditingAddress(true);
    setValidationErrors({});
  };

  const handleAddressFieldCancel = () => {
    setTempAddress(userAddress);
    setEditingAddress(false);
    setValidationErrors({});
  };

  const handleAddressFieldSave = async () => {
    if (!user || !user.id) {
      displayToast(
        'Authentication Error',
        'User not authenticated. Please login again.',
        'destructive'
      );
      navigate('/login');
      return;
    }

    // Validate address before saving
    const validation = validateAddress(tempAddress);
    if (!validation.isValid) {
      displayToast(
        'Validation Error',
        validation.errors.join(', '),
        'destructive'
      );
      return;
    }

    setIsLoading(true);

    try {
      // Check if any fields have changed
      const hasChanges = Object.keys(tempAddress).some(
        (key) => tempAddress[key] !== userAddress[key]
      );

      // If no fields changed, just close editing mode
      if (!hasChanges) {
        setEditingAddress(false);
        displayToast('No Changes', 'No address fields were modified');
        return;
      }

      // Send the complete address object to ensure all fields are preserved
      // This prevents backend from overwriting existing fields
      const completeAddress = {
        ...userAddress, // Start with current address
        ...tempAddress, // Apply all changes from temp
        // Ensure required fields have proper defaults
        country: tempAddress.country || 'India',
        addressType: tempAddress.addressType || 'home',
        isDefault: tempAddress.isDefault || false,
      };

      const response = await UserService.updateUserProfile(user.id, {
        address: completeAddress,
      });

      if (response.success) {
        // Update the main address state with the complete address
        setUserAddress(completeAddress);
        setEditingAddress(false);
        displayToast(
          'Address Updated',
          'Your address has been updated successfully',
          'success'
        );
      } else {
        throw new Error(response.message || 'Failed to update address');
      }
    } catch (error) {
      console.error('Error updating address:', error);

      // Check if it's a validation error from backend
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        displayToast(
          'Validation Error',
          backendErrors.join(', '),
          'destructive'
        );
      } else {
        displayToast(
          'Update Failed',
          error.message || 'Failed to update address. Please try again.',
          'destructive'
        );
      }

      // Reset temp address on error
      setTempAddress(userAddress);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state during initial fetch
  if (isInitialLoading) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between mb-4'>
          {/* <h3 className='sm:text-lg font-medium'>Address</h3> */}
        </div>
        {/* <Separator.Root
          className='h-px bg-black/10 dark:bg-white/25'
          orientation='horizontal'
        /> */}
        <div className='space-y-4'>
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className='flex items-center justify-between gap-6'
            >
              <div className='h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-32 animate-pulse'></div>
              <div className='h-10 bg-neutral-200 dark:bg-neutral-700 rounded flex-2 animate-pulse'></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='sm:text-lg font-medium'>Address</h3>
        {editingAddress ? (
          <div className='flex gap-2'>
            <Button
              onClick={handleAddressFieldSave}
              size='icon'
              variant='ghost'
              disabled={isLoading}
              className='h-8 w-8 hover:bg-neutral-200 dark:hover:bg-neutral-800 focus:bg-neutral-300 dark:focus:bg-neutral-700 hover:ring hover:ring-stone-300 dark:hover:ring-stone-700 focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-700 outline-none'
            >
              <Save className='size-4' />
            </Button>
            <Button
              onClick={handleAddressFieldCancel}
              size='icon'
              variant='ghost'
              disabled={isLoading}
              className='h-8 w-8 hover:bg-neutral-200 dark:hover:bg-neutral-800 focus:bg-neutral-300 dark:focus:bg-neutral-700 hover:ring hover:ring-stone-300 dark:hover:ring-stone-700 focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-700 outline-none'
            >
              <X className='size-4' />
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleAddressFieldEdit}
            size='icon'
            variant='ghost'
            className='h-8 w-8 hover:bg-neutral-200 dark:hover:bg-neutral-800 focus:bg-neutral-300 dark:focus:bg-neutral-700 hover:ring hover:ring-stone-300 dark:hover:ring-stone-700 focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-700 outline-none hover:shadow'
          >
            <Pencil className='size-4' />
          </Button>
        )}
      </div>

      <Separator.Root
        className='h-px bg-black/10 dark:bg-white/25'
        orientation='horizontal'
      />

      <div className='space-y-4 max-w-2xl'>
        {Object.entries({
          houseNumber: 'House/Flat Number',
          buildingName: 'Building/Apartment Name',
          locality: 'Locality/Area',
          landmark: 'Nearby Landmark',
          street: 'Street/Road Name',
          area: 'Sub-locality/Area',
          city: 'City/Town',
          district: 'District',
          state: 'State',
          pinCode: 'PIN Code',
          addressType: 'Address Type',
        }).map(([field, label]) => (
          <div
            key={field}
            className='group flex items-center justify-between gap-6'
          >
            <Label
              htmlFor={field}
              className='text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 flex-1 sm:flex-2 flex-shrink-0'
            >
              {label}
            </Label>
            <div className='relative flex-2'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <span>{getAddressFieldIcon(field)}</span>
              </div>

              {field === 'state' ? (
                <Select
                  value={
                    editingAddress
                      ? tempAddress[field] || ''
                      : userAddress[field] || ''
                  }
                  onValueChange={(value) => handleAddressEdit(field, value)}
                  disabled={!editingAddress}
                >
                  <SelectTrigger
                    className={`flex-1 pl-10 pr-4 py-3 disabled:border-none disabled:shadow-none ${
                      validationErrors[field] ? 'border-red-500' : ''
                    }`}
                  >
                    <SelectValue className='text-xs sm:text-sm' placeholder='Select your state' />
                  </SelectTrigger>
                  <SelectContent>
                    {indianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field === 'addressType' ? (
                <Select
                  value={
                    editingAddress
                      ? tempAddress[field] || 'home'
                      : userAddress[field] || 'home'
                  }
                  onValueChange={(value) => handleAddressEdit(field, value)}
                  disabled={!editingAddress}
                >
                  <SelectTrigger className='flex-1 pl-10 pr-4 py-3 disabled:border-none disabled:shadow-none'>
                    <SelectValue placeholder='Select address type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='home'>Home</SelectItem>
                    <SelectItem value='office'>Office</SelectItem>
                    <SelectItem value='other'>Other</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field}
                  value={
                    editingAddress
                      ? tempAddress[field] || ''
                      : userAddress[field] || ''
                  }
                  onChange={(e) => handleAddressEdit(field, e.target.value)}
                  disabled={!editingAddress}
                  className={`flex-1 text-xs sm:text-sm pl-10 pr-4 py-3 disabled:border-none disabled:shadow-none ${
                    validationErrors[field] ? 'border-red-500' : ''
                  }`}
                  placeholder={`Enter your ${label.toLowerCase()}`}
                  maxLength={field === 'pinCode' ? 6 : undefined}
                  type={field === 'pinCode' ? 'text' : 'text'}
                  inputMode={field === 'pinCode' ? 'numeric' : 'text'}
                  pattern={field === 'pinCode' ? '[0-9]*' : undefined}
                />
              )}

              {validationErrors[field] && (
                <p className='text-red-500 text-xs mt-1 ml-10'>
                  {validationErrors[field]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {(isLoading || isInitialLoading) && (
        <div className='text-sm text-slate-500 mt-2'>
          {isInitialLoading ? 'Loading address...' : 'Updating address...'}
        </div>
      )}
    </>
  );
};
