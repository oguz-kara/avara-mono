import { Module } from '@nestjs/common'
import { PaginationValidator } from './utils'

@Module({
  providers: [PaginationValidator],
  exports: [PaginationValidator],
})
export class CommonModule {}
