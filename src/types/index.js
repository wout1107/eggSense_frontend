// Common Types based on Backend DTOs

export const RoleType = {
  ROLE_USER: "ROLE_USER",
  ROLE_ADMIN: "ROLE_ADMIN",
};

export const SaleStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export const ChickenPopulationEventType = {
  ADDITION: "ADDITION",
  MORTALITY: "MORTALITY",
  ADJUSTMENT: "ADJUSTMENT",
};

// Interfaces (JSDoc style for JS project or just reference)
/**
 * @typedef {Object} User
 * @property {string} username
 * @property {string} role
 */

/**
 * @typedef {Object} Stall
 * @property {number} id
 * @property {string} name
 * @property {string} breed
 * @property {number} capacity
 * @property {number} currentChickenCount
 * @property {string} notes
 * @property {boolean} active
 */

/**
 * @typedef {Object} Customer
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} address
 * @property {string} notes
 */

/**
 * @typedef {Object} Sale
 * @property {number} id
 * @property {string} saleTime
 * @property {number} customerId
 * @property {number} eggsSmall
 * @property {number} eggsMedium
 * @property {number} eggsLarge
 * @property {number} eggsRejected
 * @property {number} totalPrice
 * @property {string} status
 * @property {string} notes
 */
