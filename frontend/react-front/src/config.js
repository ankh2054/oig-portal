export const api_base =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''

  // While on development, disable wallet authentication
export const admin_override = 
  process.env.NODE_ENV === 'development' ? true : false