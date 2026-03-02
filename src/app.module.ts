import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import postgresConfig from './config/postgres.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [postgresConfig],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const config = configService.get<DataSourceOptions>('postgres');
        if (!config) throw new Error('Postgres config not found');
        return config;
      },
      inject: [ConfigService],
    }),
    UserModule,
  ],
})
export class AppModule {}
