import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import postgresConfig from './config/postgres.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import jwtConfig from './config/jwt.config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectModule } from './projects/project.module';
import { TemplateModule } from './templates/template.module';
import mongoConfig from './config/mongo.config';
import corsConfig from './config/cors.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [postgresConfig, jwtConfig, mongoConfig, corsConfig],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) =>
        configService.getOrThrow('postgres'),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) =>
        configService.getOrThrow('mongo'),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    ProjectModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'static'),
      serveRoot: '/static',
      serveStaticOptions: {
        index: false,
      },
    }),
    TemplateModule,
  ],
})
export class AppModule {}
