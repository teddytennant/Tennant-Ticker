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

// Admin email should be configured via environment variable
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';

// Function to check if a user is an admin
export function isAdmin(email: string): boolean {
  if (!ADMIN_EMAIL) {
    console.warn('VITE_ADMIN_EMAIL environment variable is not set. Admin check will always return false.');
    return false;
  }
  return email === ADMIN_EMAIL;
}
