import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Save, X, Pencil } from 'lucide-react';

const ModernDatePicker = ({ value, onChange, onClose, onSave }) => {
  const [currentDate, setCurrentDate] = useState(() => {
    if (value) {
      return new Date(value);
    }
    return new Date();
  });
  
  const [viewDate, setViewDate] = useState(new Date(currentDate));
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  const handleDateClick = (day) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setCurrentDate(newDate);
    onChange(formatDate(newDate));
  };
  
  const navigateMonth = (direction) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(viewDate.getMonth() + direction);
    setViewDate(newDate);
  };
  
  const navigateYear = (direction) => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(viewDate.getFullYear() + direction);
    setViewDate(newDate);
  };
  
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(viewDate);
    const firstDay = getFirstDayOfMonth(viewDate);
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = currentDate.getDate() === day && 
                        currentDate.getMonth() === viewDate.getMonth() && 
                        currentDate.getFullYear() === viewDate.getFullYear();
      const isToday = new Date().toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toDateString();
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`p-2 text-sm rounded-lg hover:bg-blue-50 transition-colors ${
            isSelected 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : isToday 
                ? 'bg-blue-100 text-blue-600 font-semibold' 
                : 'text-gray-700 hover:text-blue-600'
          }`}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };
  
  return (
    <div className="absolute top-full left-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateYear(-1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>
        </div>
        
        <div className="text-center">
          <div className="font-semibold text-gray-800">
            {months[viewDate.getMonth()]} {viewDate.getFullYear()}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth(1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
          <button
            onClick={() => navigateYear(1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="p-2 text-xs font-medium text-gray-500 text-center">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {renderCalendar()}
      </div>
      
      {/* Actions */}
      <div className="flex justify-end space-x-2 pt-2 border-t">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Select
        </button>
      </div>
    </div>
  );
};

export default ModernDatePicker;

const ProfileFormWithModernDatePicker = () => {
  const [activeTab] = useState("profile");
  const [editingField, setEditingField] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userProfile, setUserProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    phoneNumber: "+1 (555) 123-4567",
    username: "johndoe",
    dob: "1990-01-15",
    email: "john.doe@example.com"
  });
  const [tempProfile, setTempProfile] = useState({ ...userProfile });

  const handleFieldEdit = (field, value) => {
    setTempProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFieldSave = (field) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: tempProfile[field]
    }));
    setEditingField(null);
    if (field === 'dob') {
      setShowDatePicker(false);
    }
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleDatePickerEdit = () => {
    setEditingField('dob');
    setTempProfile(prev => ({ ...prev, dob: userProfile.dob }));
    setShowDatePicker(true);
  };

  const handleDatePickerClose = () => {
    setShowDatePicker(false);
    setEditingField(null);
  };

  const handleDatePickerSave = () => {
    handleFieldSave('dob');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div>
            <h3 className="sm:text-lg font-medium mb-4">
              Personal Information
            </h3>
            <div className="space-y-4 max-w-2xl">
              {Object.entries({
                firstName: "First Name",
                lastName: "Last Name",
                phoneNumber: "Phone Number",
                username: "Username",
              }).map(([field, label]) => (
                <div key={field} className="space-y-2">
                  <label htmlFor={field} className="text-sm font-medium text-gray-700">
                    {label}
                  </label>
                  <div className="flex gap-2">
                    <input
                      id={field}
                      value={
                        editingField === field
                          ? tempProfile[field]
                          : userProfile[field]
                      }
                      onChange={(e) =>
                        handleFieldEdit(field, e.target.value)
                      }
                      disabled={editingField !== field}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                      placeholder={`Enter your ${label.toLowerCase()}`}
                    />
                    {editingField === field ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleFieldSave(field)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingField(null)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingField(field)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Date of Birth with Modern Date Picker */}
              <div className="space-y-2 relative">
                <label htmlFor="dob" className="text-sm font-medium text-gray-700">
                  Date Of Birth
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      id="dob"
                      value={formatDisplayDate(userProfile.dob)}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-pointer"
                      placeholder="Select your date of birth"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    
                    {showDatePicker && (
                      <ModernDatePicker
                        value={tempProfile.dob}
                        onChange={(date) => handleFieldEdit('dob', date)}
                        onClose={handleDatePickerClose}
                        onSave={handleDatePickerSave}
                      />
                    )}
                  </div>
                  
                  {showDatePicker ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleDatePickerSave}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleDatePickerClose}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleDatePickerEdit}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={userProfile.email}
                  disabled={true}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};