import { format, addDays, isSunday } from "date-fns";

// Define zones based on first 2 digits of pincodes
const ZONES = {
  // Maharashtra
  '40': { type: 'local', days: 1 }, // Mumbai
  '41': { type: 'state', days: 2 }, // Thane, Navi Mumbai
  '42': { type: 'state', days: 2 }, // Nashik, Dhule
  '43': { type: 'state', days: 2 }, // Pune
  '44': { type: 'state', days: 2 }, // Nagpur
  
  // Neighboring states
  '36': { type: 'zone1', days: 3 }, // Gujarat
  '39': { type: 'zone1', days: 3 }, // Gujarat
  '38': { type: 'zone1', days: 3 }, // Gujarat
  '37': { type: 'zone1', days: 3 }, // Daman
  '45': { type: 'zone1', days: 3 }, // MP
  '46': { type: 'zone1', days: 3 }, // MP
  '49': { type: 'zone1', days: 3 }, // Goa
  
  // Rest of India
  default: { type: 'zone2', days: 5 }
};

const isValidPincode = (pincode) => {
  return /^[1-9][0-9]{5}$/.test(pincode);
};

const getDeliveryMessage = (type) => {
  switch (type) {
    case 'same-day':
      return "Available for same day delivery";
    case 'local':
      return "Express delivery available";
    case 'state':
      return "Standard state delivery";
    case 'zone1':
      return "Standard interstate delivery";
    case 'zone2':
      return "Pan India delivery";
    default:
      return "Standard delivery";
  }
};

const calculateBusinessDays = (startDate, days) => {
  let currentDate = startDate;
  let remainingDays = days;

  while (remainingDays > 0) {
    currentDate = addDays(currentDate, 1);
    if (!isSunday(currentDate)) {
      remainingDays--;
    }
  }

  return currentDate;
};

export const calculateDeliveryDate = (pincode) => {
  if (!isValidPincode(pincode)) {
    return {
      success: false,
      error: "Please enter a valid 6-digit pincode"
    };
  }

  // Processing time at origin
  const processingDays = 1;
  
  // Get zone based on first 2 digits
  const zonePrefix = pincode.substring(0, 2);
  const zone = ZONES[zonePrefix] || ZONES.default;
  
  // Special handling for Borivali and nearby areas
  if (pincode === "400066") {
    const today = new Date();
    return {
      success: true,
      estimatedDate: format(today, 'd MMM yyyy'),
      type: 'same-day',
      message: "Same day delivery available"
    };
  }

  // Calculate delivery date including business days
  const today = new Date();
  const deliveryDate = calculateBusinessDays(today, processingDays + zone.days);

  return {
    success: true,
    estimatedDate: format(deliveryDate, 'd MMM yyyy'),
    type: zone.type,
    message: getDeliveryMessage(zone.type)
  };
};