import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { AuthService } from '@av/user/application/services/auth.service'
import { AuthStorageService } from '@av/user/application/services/auth-storage.service'
import { Permission } from '../access-control'
import { RequestContextService } from '../context'
import { ChannelService } from '@av/channel'
import { ChannelData } from '../context/channel-context.interface'

@Injectable()
export class AppGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly authStorageService: AuthStorageService,
    private readonly contextService: RequestContextService,
    private readonly channelService: ChannelService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let token: string | undefined = undefined
    let payload: { userId: string } | undefined = undefined
    const authType = this.authStorageService.getStrategy('cookie')
    const isAuthActive = this.configService.get(
      'authentication.authorizationEnabled',
    )

    await this.setChannelToRequest(context)

    if (!isAuthActive) return true

    const permissionData = this.reflector.get<{
      items: Permission[]
      operator: 'OR' | 'AND'
    }>('permissionData', context.getHandler())

    if (!permissionData) return true

    const { items: requiredPermissions, operator } = permissionData

    if (!requiredPermissions) return true

    if (authType === 'cookie') {
      token = this.extractJwtFromCookie(context)
    } else if (authType === 'bearer') {
      token = this.extractJwtFromAuthorizationHeader(context)
    }

    console.log({ token })

    if (!token)
      throw new UnauthorizedException(
        'Authorization token is missing or invalid',
      )

    try {
      payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      }) as { userId: string }
    } catch (error) {
      this.handleJWTErrorByName(error.name)
    }

    const req = this.getRequest(context)
    req.user = payload

    const gqlContext = GqlExecutionContext.create(context).getContext()
    gqlContext.user = payload
    const { req: gqlReq } = gqlContext
    const ctx = await this.contextService.createContext(
      gqlReq.channel,
      gqlReq.headers,
    )

    const isAuthorized = this.authService.isAuthorizedToPerformAction(
      ctx,
      payload.userId,
      requiredPermissions,
      operator,
    )

    return isAuthorized
  }

  private extractJwtFromCookie(context: ExecutionContext): string | undefined {
    const isGraphQL = (context.getType() as string) === 'graphql'

    if (isGraphQL) {
      const gqlContext = GqlExecutionContext.create(context).getContext()
      console.log({ gqlContext })
      const accessToken = gqlContext.req?.cookies?.access_token
      console.log({ cookies: gqlContext.req?.cookies })
      return accessToken
    } else {
      const req = context.switchToHttp().getRequest()
      console.log({ req })
      console.log({ cookies: req?.cookies })
      return req?.cookies?.access_token
    }
  }

  private extractJwtFromAuthorizationHeader(
    context: ExecutionContext,
  ): string | undefined {
    const isGraphQL = (context.getType() as string) === 'graphql'

    if (isGraphQL) {
      const gqlContext = GqlExecutionContext.create(context).getContext()
      const authHeader = gqlContext.req?.headers['x-access-token']
      const extractedToken = this.extractTokenFromAuthHeader(authHeader)
      return extractedToken
    } else {
      const req = context.switchToHttp().getRequest()
      const authHeader = req?.headers['x-access-token']
      return this.extractTokenFromAuthHeader(authHeader)
    }
  }

  private extractTokenFromAuthHeader(
    authHeader: string | undefined,
  ): string | undefined {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return undefined
    }
    return authHeader.split(' ')[1] // Extract the token part
  }

  private getRequest(context: ExecutionContext) {
    const isGraphQL = (context.getType() as string) === 'graphql'

    if (isGraphQL) {
      return GqlExecutionContext.create(context).getContext().req
    } else {
      return context.switchToHttp().getRequest()
    }
  }

  private handleJWTErrorByName(errorName: string) {
    if (errorName === 'TokenExpiredError') {
      throw new UnauthorizedException('JWT token is expired')
    } else if (errorName === 'JsonWebTokenError') {
      throw new UnauthorizedException('JWT token is malformed')
    } else {
      throw new UnauthorizedException('JWT token verification failed')
    }
  }

  private async setChannelToRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    const request = ctx.getContext().req

    const channelToken = request.headers['x-channel-token']

    const channel = await this.channelService.getOrCreateDefaultChannel(
      {} as any,
      channelToken,
    )

    const channelData: ChannelData = {
      token: channel.token,
      code: channel.code,
      defaultLanguageCode: channel.defaultLanguageCode,
      currencyCode: channel.currencyCode,
    }

    request.channel = channelData
  }
}
