import { Global, Module } from '@nestjs/common'
import { RequestContextService } from './request-context.service'
import { RequestContextInterceptor } from './request-context.interceptor'

@Global()
@Module({
  imports: [],
  providers: [RequestContextService, RequestContextInterceptor],
  exports: [RequestContextService, RequestContextInterceptor],
})
export class RequestContextModule {}
