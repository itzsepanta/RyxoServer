import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { join } from 'path';
import { CleanUrlMiddleware } from './common/middleware/clean-url.middleware';
import { GlobalExceptionFilter } from './common/filters/exception.filter';
import { AuthModule } from './modules/auth/auth.module';
import { UserEntity } from './modules/user/user.entity';
import { MonitorModule } from './monitor/monitor.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    ScheduleModule.forRoot(),

    MonitorModule,

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'docs'),
      serveRoot: '/docs',
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/', 
      exclude: ['/v1/(.*)'],
    }),

    CacheModule.register({
      isGlobal: true,
      ttl: 10000,
      max: 500,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (): Promise<TypeOrmModuleOptions> => ({
        type: 'better-sqlite3',
        database: 'database.sqlite',
        entities: [UserEntity],
        synchronize: true,
        logging: false,
      }),
    }),

    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        pinoHttp: {
          level: configService.get<string>('LOG_LEVEL', 'info'),
          transport: configService.get<string>('NODE_ENV') !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss Z' } }
            : undefined,
        },
      }),
    }),

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => [
        {
          ttl: configService.get<number>('THROTTLER_TTL', 60000),
          limit: configService.get<number>('THROTTLER_LIMIT', 100),
        },
      ],
    }),

    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(CleanUrlMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}