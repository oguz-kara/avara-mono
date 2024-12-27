import * as crypto from 'crypto'
import { Injectable } from '@nestjs/common'
import { AsyncLocalStorage } from 'async_hooks'
import { RequestContext } from './request-context'
import { ChannelData } from './channel-context.interface'
import { LocalizationSettings } from '@av/database'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class RequestContextService {
  private readonly availableLanguages: string[]
  private static asyncLocalStorage = new AsyncLocalStorage<RequestContext>()

  constructor(private readonly configService: ConfigService) {
    this.availableLanguages = configService.get(
      'localization.language.available',
    )
  }

  setContext(context: RequestContext): void {
    RequestContextService.asyncLocalStorage.enterWith(context)
  }

  getContext(): RequestContext {
    const context = RequestContextService.asyncLocalStorage.getStore()
    if (!context) throw new Error('Request context is not set')

    return context
  }

  async createContext(
    channel: ChannelData,
    localizationSettings: LocalizationSettings | undefined,
    headers: Record<string, string | string[]>,
  ): Promise<RequestContext> {
    try {
      const acceptLanguage = this.extractHeader(headers, 'accept-language')
      const isAvailableLanguage = this.isLanguageAvailable(acceptLanguage)
      const languageCode = isAvailableLanguage
        ? acceptLanguage
        : channel.defaultLanguageCode

      const currencyCode =
        this.extractHeader(headers, 'x-currency-code') || channel.currencyCode
      const requestId =
        this.extractHeader(headers, 'x-request-id') || crypto.randomUUID()

      const clientInfo = this.extractClientInfo(headers)

      return new RequestContext({
        channel: channel,
        localizationSettings: localizationSettings || undefined,
        isDefaultLanguage: languageCode === channel.defaultLanguageCode,
        languageCode,
        currencyCode,
        requestId,
        clientInfo,
        timestamp: new Date(),
        correlationId: this.extractHeader(headers, 'x-correlation-id') || null,
      })
    } catch (error) {
      throw this.decorateError(error)
    }
  }

  private extractClientInfo(
    headers: Record<string, string | string[]>,
  ): ClientInfo {
    return {
      userAgent: this.extractHeader(headers, 'user-agent') || 'unknown',
      ipAddress: this.extractClientIp(headers),
      clientVersion:
        this.extractHeader(headers, 'x-client-version') || 'unknown',
      clientPlatform:
        this.extractHeader(headers, 'x-client-platform') || 'unknown',
    }
  }

  private extractClientIp(headers: Record<string, string | string[]>): string {
    const xForwardedFor = this.extractHeader(headers, 'x-forwarded-for')
    if (xForwardedFor) {
      const ips = xForwardedFor.split(',').map((ip) => ip.trim())
      if (ips.length > 0) {
        return ips[0] // Return the first IP address
      }
    }

    const realIp = this.extractHeader(headers, 'x-real-ip')
    return realIp || 'unknown'
  }

  private extractHeader(
    headers: Record<string, string | string[]>,
    key: string,
  ): string | undefined {
    const value = headers[key]
    if (Array.isArray(value)) {
      return value[0]
    }
    return value
  }

  private decorateError(error: any): Error {
    if (
      error instanceof MissingHeaderError ||
      error instanceof NotFoundError ||
      error instanceof MappingError ||
      error instanceof InvalidChannelError
    ) {
      return error
    }

    return new Error(`Failed to create request context: ${error.message}`)
  }

  private isLanguageAvailable(languageCode: string): boolean {
    console.log({ languageCode, availableLanguages: this.availableLanguages })
    return this.availableLanguages.includes(languageCode)
  }
}

class MissingHeaderError extends Error {
  constructor(headerName: string) {
    super(`Missing required header: ${headerName}`)
    this.name = 'MissingHeaderError'
  }
}

class NotFoundError extends Error {
  constructor(entity: string) {
    super(entity)
    this.name = 'NotFoundError'
  }
}

class MappingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MappingError'
  }
}

class InvalidChannelError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidChannelError'
  }
}

interface ClientInfo {
  userAgent: string
  ipAddress: string
  clientVersion: string
  clientPlatform: string
}
