import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

const KEYLEN = 64;
const SALT_LEN = 32;
const SEPARATOR = ':';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(SALT_LEN).toString('hex');
  const hash = (await scryptAsync(password, salt, KEYLEN)) as Buffer;
  return `${salt}${SEPARATOR}${hash.toString('hex')}`;
};

export const verifyPassword = async (
  password: string,
  stored: string
): Promise<boolean> => {
  const [salt, storedHash] = stored.split(SEPARATOR);

  if (!salt || !storedHash) return false;

  const hash = (await scryptAsync(password, salt, KEYLEN)) as Buffer;
  const storedHashBuffer = Buffer.from(storedHash, 'hex');

  // Buffers must be same length for timingSafeEqual
  if (hash.length !== storedHashBuffer.length) return false;

  return timingSafeEqual(hash, storedHashBuffer);
};
