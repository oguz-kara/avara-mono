export enum ChannelType {
  RETAIL = 'RETAIL',
  B2B = 'B2B',
  MARKETPLACE = 'MARKETPLACE',
  LOCALE = 'LOCALE',
  OTHER = 'OTHER',
}

export enum ChannelStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export interface Channel {
  id: string
  name: string
  code: string
  isDefault: boolean
  type: ChannelType
  status: ChannelStatus
  channel_token: string // Assuming you have a channel_token field
}
