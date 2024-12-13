import { Module } from '@nestjs/common'
import { GatewayModule } from '@av/gateway'
import { PrismaModule } from '@av/database'
import { ConfigModule } from '@nestjs/config'
import { appConfig } from 'config/app.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: getEnvFilePath(),
    }),
    GatewayModule,
    PrismaModule,
  ],
})
export class AppModule {}

function getEnvFilePath(): string[] {
  const nodeEnv = process.env.NODE_ENV || 'development'
  const envFile = `.env.${nodeEnv}`
  return [envFile, '.env']
}
