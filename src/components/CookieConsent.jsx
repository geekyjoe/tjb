import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { IoWarning } from 'react-icons/io5';
import * as Separator from '@radix-ui/react-separator';

const COOKIE_NAME = 'cookiePreferences';
const COOKIE_EXPIRY_DAYS = 365;

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    try {
      return JSON.parse(parts.pop().split(';').shift());
    } catch {
      return null;
    }
  }
  return null;
};

const setCookie = (name, value, days) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${JSON.stringify(
    value
  )};${expires};path=/;SameSite=Strict`;
};

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    performance: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check for existing consent in both cookies and localStorage
    const cookiePreferences = getCookie(COOKIE_NAME);
    const localPreferences = localStorage.getItem(COOKIE_NAME);

    let savedPreferences = null;

    if (cookiePreferences) {
      savedPreferences = cookiePreferences;
    } else if (localPreferences) {
      try {
        savedPreferences = JSON.parse(localPreferences);
        setCookie(COOKIE_NAME, savedPreferences, COOKIE_EXPIRY_DAYS);
      } catch {
        localStorage.removeItem(COOKIE_NAME);
      }
    }

    if (savedPreferences) {
      setPreferences(savedPreferences);
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allEnabled = {
      essential: true,
      performance: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allEnabled);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowDetails(false);
  };

  const savePreferences = (prefs) => {
    setCookie(COOKIE_NAME, prefs, COOKIE_EXPIRY_DAYS);
    localStorage.setItem(COOKIE_NAME, JSON.stringify(prefs));

    setPreferences(prefs);
    setShowBanner(false);
    setShowDetails(false);

    updateTrackingConsent(prefs);
  };

  const updateTrackingConsent = (prefs) => {
    if (prefs.analytics) {
      window.gtag?.('consent', 'update', {
        analytics_storage: 'granted',
      });
    }

    if (prefs.marketing) {
      window.gtag?.('consent', 'update', {
        ad_storage: 'granted',
      });
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className='fixed inset-x-0 bottom-0 p-1 z-5 max-w-2xl mx-auto'>
      <Card className='rounded-lg bg-white dark:bg-cornsilk-dark shadow-lg border-2 dark:border-white/5 hover:dark:border-white/5'>
        <CardContent className='p-2 md:pl-3'>
          {!showDetails ? (
            <div className='space-y-4'>
              <div className='flex flex-col md:flex-row gap-2 justify-between'>
                <div className='space-y-1.5 md:space-y-2'>
                  <h3 className='font-semibold leading-6 text-sm md:text-md'>
                    We value your privacy
                  </h3>
                  <Separator.Root
                    className='h-px bg-black/10 dark:bg-white/10'
                    orientation='horizontal'
                  />
                  <p className='text-xs md:text-sm text-muted-foreground'>
                    We use cookies to enhance your browsing experience, serve
                    personalized content, and analyze our traffic.
                  </p>
                </div>
                <Separator.Root
                  className='w-px bg-black/10 dark:bg-white/10'
                  orientation='vertical'
                />
                <div className='flex items-center md:flex-col-reverse justify-end gap-2'>
                  <Button
                    variant='ghost'
                    onClick={() => setShowDetails(true)}
                    className='whitespace-nowrap text-xs md:text-sm h-8 md:h-9.5 w-fit rounded-sm'
                  >
                    Customize
                  </Button>
                  <Button
                    onClick={handleAcceptAll}
                    className='whitespace-nowrap text-xs md:text-sm h-8 md:h-9.5 w-fit rounded-sm'
                  >
                    Accept All
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <CookieSettings
                preferences={preferences}
                setPreferences={setPreferences}
              />
              <div className='flex justify-end gap-2 mt-2 md:mt-6'>
                <Button variant='ghost' onClick={() => setShowDetails(false)} className='text-xs md:text-sm h-8 md:h-9.5 w-fit rounded-md'>
                  Back
                </Button>
                <Button onClick={handleSavePreferences} className='text-xs md:text-sm h-8 md:h-9.5 w-fit rounded-md'>
                  Save Preferences
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const CookieSettings = ({ preferences, setPreferences }) => {
  const cookieTypes = {
    essential: {
      title: 'Essential Cookies',
      description: 'Required for the website to function properly.',
    },
    performance: {
      title: 'Performance Cookies',
      description: 'Help us improve site speed and user experience.',
    },
    analytics: {
      title: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website.',
    },
    marketing: {
      title: 'Marketing Cookies',
      description:
        'Used to deliver relevant advertisements and track their effectiveness.',
    },
  };

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='font-semibold leading-7 text-sm md:text-lg'>Cookie Settings</h3>
        <p className='text-xs md:text-sm text-muted-foreground'>
          Manage your cookie preferences
        </p>
      </div>
      <Separator.Root
        className='h-px bg-black/10 dark:bg-white/10'
        orientation='horizontal'
      />
      <div className='space-y-4'>
        {Object.entries(cookieTypes).map(([key, { title, description }]) => (
          <div key={key} className='flex items-center justify-between gap-2'>
            <div className='space-y-1'>
              <p className='font-bold text-xs sm:text-sm leading-5'>{title}</p>
              <p className='flex flex-col md:flex-row items-start md:items-center text-[0.675rem] md:text-sm text-muted-foreground'>
                {description}{' '}
                {key === 'essential' && (
                  <span className='flex items-center md:ml-2 text-yellow-500'>
                    Cannot be disabled.{' '}
                    <IoWarning className='ml-1 text-amber-500' />
                  </span>
                )}
              </p>
            </div>
            <Switch
              checked={preferences[key]}
              disabled={key === 'essential'}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({ ...prev, [key]: checked }))
              }
              className={`shrink-0 ${
                key === 'essential'
                  ? 'opacity-50 data-[state=checked]:bg-black'
                  : 'data-[state=checked]:bg-yellow-300'
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CookieConsent;
