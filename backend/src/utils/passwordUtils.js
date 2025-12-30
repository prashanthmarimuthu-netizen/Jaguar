import bcrypt from 'bcryptjs';

const saltRounds = 10;

// Hash password
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

// Verify password
export const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};