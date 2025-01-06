import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';

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
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${JSON.stringify(value)};${expires};path=/;SameSite=Strict`;
};

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    performance: false,
    analytics: false,
    marketing: false
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
      marketing: true
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
        analytics_storage: 'granted'
      });
    }

    if (prefs.marketing) {
      window.gtag?.('consent', 'update', {
        ad_storage: 'granted'
      });
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 p-4 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-2xl mx-auto">
        <Card className="rounded-xl bg-white shadow-lg border">
          <CardContent className="p-6">
            {!showDetails ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4 justify-between">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">We value your privacy</h3>
                    <p className="text-sm text-muted-foreground">
                      We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowDetails(true)}
                      className="whitespace-nowrap"
                    >
                      Customize
                    </Button>
                    <Button 
                      onClick={handleAcceptAll}
                      className="whitespace-nowrap"
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
                <div className="flex justify-end gap-2 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDetails(false)}
                  >
                    Back
                  </Button>
                  <Button onClick={handleSavePreferences}>
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const CookieSettings = ({ preferences, setPreferences }) => {
  const cookieTypes = {
    essential: {
      title: "Essential Cookies",
      description: "Required for the website to function properly. Cannot be disabled."
    },
    performance: {
      title: "Performance Cookies",
      description: "Help us improve site speed and user experience."
    },
    analytics: {
      title: "Analytics Cookies",
      description: "Help us understand how visitors interact with our website."
    },
    marketing: {
      title: "Marketing Cookies",
      description: "Used to deliver relevant advertisements and track their effectiveness."
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-lg">Cookie Settings</h3>
        <p className="text-sm text-muted-foreground">Manage your cookie preferences</p>
      </div>
      
      <div className="space-y-4">
        {Object.entries(cookieTypes).map(([key, { title, description }]) => (
          <div key={key} className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="font-medium">{title}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Switch
              checked={preferences[key]}
              disabled={key === 'essential'}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, [key]: checked }))
              }
              className="mt-1"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CookieConsent;