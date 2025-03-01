// Admin user credentials - DO NOT COMMIT ACTUAL CREDENTIALS
export const ADMIN_CREDENTIALS = {
  email: 'admin@tennant-ticker.com',
  password: 'TT_Admin_2024!', // Change this to a secure password
};

// Admin user permissions
export const ADMIN_PERMISSIONS = {
  canAccessAll: true,
  canManageUsers: true,
  canManageSubscriptions: true,
  canViewAnalytics: true,
  canModifySettings: true,
  messageLimit: Infinity,
  stockLimit: Infinity,
};

// Function to check if a user is an admin
export function isAdmin(email: string): boolean {
  return email === ADMIN_CREDENTIALS.email;
} 