import { Global, Module } from '@nestjs/common'
import { PaginationValidator } from './utils'

@Global()
@Module({
  providers: [PaginationValidator],
  exports: [PaginationValidator],
})
export class CommonModule {}
