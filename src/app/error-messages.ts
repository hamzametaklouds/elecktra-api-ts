export const ErrorMessages = {
  // Generic errors
  INVALID_ID: 'Invalid ID provided',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  RESOURCE_NOT_FOUND: 'Requested resource not found',
  
  // Booking related
  BOOKING_NOT_FOUND: 'Booking not found',
  INVALID_BOOKING_STATUS: 'Invalid booking status',
  INVALID_PAYMENT_AMOUNT: 'Invalid payment amount',
  BOOKING_ALREADY_CANCELLED: 'Booking has already been cancelled',
  BOOKING_ALREADY_COMPLETED: 'Booking has already been completed',
  INVALID_CHECKOUT_TIME: 'Invalid checkout time for booking',
  
  // Company related
  COMPANY_NOT_FOUND: 'Company not found',
  COMPANY_ALREADY_EXISTS: 'Company with this name already exists',
  
  // Hotel/Car related
  INVALID_DATES: 'Invalid date range provided',
  HOTEL_NOT_FOUND: 'Hotel not found',
  CAR_NOT_FOUND: 'Car not found',
  INVALID_PRICE: 'Invalid price provided',
  UNAVAILABLE_DATES: 'Selected dates are unavailable',
  
  // Review related
  REVIEW_NOT_FOUND: 'Review not found',
  INVALID_RATING: 'Rating must be between 1 and 5',
  
  // Query related
  QUERY_NOT_FOUND: 'Query not found',
  
  // Validation errors
  REQUIRED_FIELDS: 'Please fill in all required fields',
  INVALID_EMAIL: 'Invalid email address provided',
  INVALID_PHONE: 'Invalid phone number provided',
  INVALID_DATE_FORMAT: 'Invalid date format',
  
  // Payment related
  PAYMENT_FAILED: 'Payment processing failed',
  INVALID_PAYMENT_METHOD: 'Invalid payment method',
  
  // Search related
  INVALID_SEARCH_PARAMS: 'Invalid search parameters provided',
  NO_RESULTS_FOUND: 'No results found for the given criteria'
}; 