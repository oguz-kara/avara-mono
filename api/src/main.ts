import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use(cookieParser())
  app.enableCors({
    origin: 'http://88.223.95.88:3003',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'x-channel-token',
      'x-access-token',
      'cookie',
      'cookies',
    ],
  })

  await app.listen(3000)
}
bootstrap()
