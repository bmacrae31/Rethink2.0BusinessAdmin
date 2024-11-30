import { randomBytes } from 'crypto';

export const generatePassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one of each required character type
  password += charset.match(/[a-z]/)[0];  // lowercase
  password += charset.match(/[A-Z]/)[0];  // uppercase
  password += charset.match(/[0-9]/)[0];  // number
  password += charset.match(/[!@#$%^&*]/)[0];  // special char
  
  // Fill the rest randomly
  while (password.length < length) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};