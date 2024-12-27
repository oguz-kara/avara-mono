import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { GatewayModule } from '@av/gateway'
import { PrismaModule } from '@av/database'

import { appConfig } from 'config/app.config'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { CommonModule, RequestContextModule } from '@av/common'

@Module({
  imports: [
    GatewayModule,
    PrismaModule,
    RequestContextModule,
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: getEnvFilePath(),
    }),
    EventEmitterModule.forRoot(),
  ],
})
export class AppModule {}

function getEnvFilePath(): string[] {
  const nodeEnv = process.env.NODE_ENV || 'development'
  const envFile = `.env.${nodeEnv}`
  return [envFile, '.env']
}
