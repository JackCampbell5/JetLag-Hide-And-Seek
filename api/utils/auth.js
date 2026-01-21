import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

export async function authenticate(fastify, request) {
  try {
    await request.jwtVerify();
    return request.user;
  } catch (err) {
    throw fastify.httpErrors.unauthorized('Invalid or expired token');
  }
}
