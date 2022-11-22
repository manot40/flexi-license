import { object, string, boolean } from 'yup';

export const createUser = object({
  username: string().min(6, 'Username must be minimal 6 characters').required('Username is required'),
  password: string().required('Password is required').min(6, 'Password is too short - should be 6 chars minimum.'),
  role: string().oneOf(['SUPPORT', 'SALES', 'ADMIN'], 'Invalid role provided'),
  isActive: boolean(),
});

export const authenticateUser = object({
  username: string().min(6, 'Username must be minimal 6 characters').required('Username is required'),
  password: string().required('Password is required').min(6, 'Password is too short - should be 6 chars minimum.'),
});
