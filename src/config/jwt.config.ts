import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  global: true,
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: process.env.JWT_EXPIRATION },
}));
