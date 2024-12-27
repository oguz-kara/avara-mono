import { Global, Module } from '@nestjs/common'
import { ChannelService } from './application/channel.service'

@Global()
@Module({
  imports: [],
  providers: [ChannelService],
  exports: [ChannelService],
})
export class ChannelModule {}
