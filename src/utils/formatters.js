// Utility functions for formatting data in Soumadeep's Corner

/**
 * Format date to Indian format (DD/MM/YYYY)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateIndian = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Format currency to Indian Rupees
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '₹0';
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Generate a professional notification message
 * @param {string} type - Type of notification (success, error, info, warning)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @returns {object} Notification object
 */
export const createNotification = (type, title, message) => {
  return {
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    id: Math.random().toString(36).substr(2, 9)
  };
};

/**
 * Debounce function for search and other inputs
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Check if stock is available
 * @param {number} stockQuantity - Stock quantity
 * @param {number} requestedQuantity - Requested quantity
 * @returns {boolean} Whether stock is available
 */
export const isStockAvailable = (stockQuantity, requestedQuantity = 1) => {
  return stockQuantity >= requestedQuantity;
};

/**
 * Get stock status message
 * @param {number} stockQuantity - Stock quantity
 * @returns {object} Stock status object
 */
export const getStockStatus = (stockQuantity) => {
  if (stockQuantity === 0) {
    return { status: 'out-of-stock', message: 'Out of Stock', color: 'error' };
  } else if (stockQuantity <= 5) {
    return { status: 'low-stock', message: `Only ${stockQuantity} left`, color: 'warning' };
  } else {
    return { status: 'in-stock', message: 'In Stock', color: 'success' };
  }
};