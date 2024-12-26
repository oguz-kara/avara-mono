import { AsyncLocalStorage } from 'async_hooks'
import { ChannelData } from './channel-context.interface'
import { LocalizationSettings, User } from '@av/database'

export interface ClientInfo {
  userAgent?: string
  ipAddress?: string
  clientVersion?: string
  clientPlatform?: string
}

export interface RequestContextProps {
  channel?: ChannelData
  languageCode?: string
  currencyCode?: string
  requestId: string
  clientInfo: ClientInfo
  timestamp: Date
  correlationId?: string
  userId?: string
  tenantId?: string
  user?: User
  localizationSettings?: LocalizationSettings
  isDefaultLanguage: boolean
}

export class RequestContext {
  private static asyncLocalStorage = new AsyncLocalStorage<RequestContext>()

  private _channel: ChannelData
  private readonly _languageCode: string
  private readonly _currencyCode: string
  private readonly _requestId: string
  private readonly _clientInfo: ClientInfo
  private readonly _timestamp: Date
  private readonly _correlationId?: string
  private readonly _userId?: string
  private readonly _tenantId?: string
  private readonly _user?: User
  private readonly _localizationSettings?: LocalizationSettings
  private readonly _isDefaultLanguage: boolean

  constructor(props: RequestContextProps) {
    this._channel = props.channel
    this._localizationSettings = props.localizationSettings
    this._isDefaultLanguage = props.isDefaultLanguage
    this._languageCode = props.languageCode
    this._currencyCode = props.currencyCode
    this._requestId = props.requestId
    this._clientInfo = props.clientInfo
    this._timestamp = props.timestamp
    this._correlationId = props.correlationId
    this._userId = props.userId
    this._tenantId = props.tenantId
    this._user = props.user
  }

  static getCurrentContext(): RequestContext {
    const context = RequestContext.asyncLocalStorage.getStore()
    if (!context) {
      throw new Error('Request context is not set')
    }
    return context
  }

  static setCurrentContext(context: RequestContext): void {
    RequestContext.asyncLocalStorage.enterWith(context)
  }

  toJSON() {
    return {
      channelCode: this._channel.code,
      languageCode: this._languageCode,
      currencyCode: this._currencyCode,
      requestId: this._requestId,
      correlationId: this._correlationId,
      timestamp: this._timestamp,
      userId: this._userId,
      tenantId: this._tenantId,
      user: this._user,
    }
  }

  get localizationSettings(): LocalizationSettings | undefined {
    return this._localizationSettings
  }

  get channel(): ChannelData {
    return this._channel
  }

  get languageCode(): string {
    return this._languageCode
  }

  get isDefaultLanguage(): boolean {
    return this._isDefaultLanguage
  }

  get currencyCode(): string {
    return this._currencyCode
  }

  get requestId(): string {
    return this._requestId
  }

  get clientInfo(): ClientInfo {
    return this._clientInfo
  }

  get timestamp(): Date {
    return this._timestamp
  }

  get correlationId(): string | undefined {
    return this._correlationId
  }

  get userId(): string | undefined {
    return this._userId
  }

  get tenantId(): string | undefined {
    return this._tenantId
  }

  get user(): User | undefined {
    return this._user
  }

  set channel(channel: ChannelData) {
    this._channel = channel
  }

  hasUser(): boolean {
    return !!this._userId
  }

  hasTenant(): boolean {
    return !!this._tenantId
  }

  createChildContext(): RequestContext {
    return new RequestContext({
      channel: this._channel,
      languageCode: this._languageCode,
      currencyCode: this._currencyCode,
      requestId: crypto.randomUUID(),
      timestamp: new Date(),
      isDefaultLanguage: this._isDefaultLanguage,
      clientInfo: {
        ...this._clientInfo,
      },
      correlationId: this._correlationId,
      userId: this._userId,
      tenantId: this._tenantId,
    })
  }
}
