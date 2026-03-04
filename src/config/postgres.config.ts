import { registerAs } from '@nestjs/config';
import { OauthAccount } from 'src/users/entities/oauth-account.entity';
import { User } from 'src/users/entities/user.entity';

export default registerAs('postgres', () => ({
  type: 'postgres' as const,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT!, 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [User, OauthAccount],
  synchronize: false,
}));
