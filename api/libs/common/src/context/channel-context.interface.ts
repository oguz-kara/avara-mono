import { JsonValue } from '@prisma/client/runtime/library'

export interface ChannelSettings {
  baseUrl: string
  autoTranslate: boolean
  dynamicSegments: JsonValue
  brandName?: string
}

export interface ChannelData {
  token: string
  code: string
  defaultLanguageCode: string
  currencyCode: string
  settings: ChannelSettings
}

export interface ChannelContextInterface {
  findChannelByToken(token: string): Promise<ChannelData | null>
  createDefaultChannel(): Promise<ChannelData>
}
