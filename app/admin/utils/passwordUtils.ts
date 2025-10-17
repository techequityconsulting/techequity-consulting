// app/admin/utils/passwordUtils.ts
// Password hashing utilities using bcrypt

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12; // Higher = more secure but slower

/**
 * Hash a plaintext password
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare plaintext password with hashed password
 */
export async function verifyPassword(
  plaintext: string,
  hashed: string
): Promise<boolean> {
  return await bcrypt.compare(plaintext, hashed);
}

/**
 * Generate a strong random password
 */
export function generateStrongPassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}