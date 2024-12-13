import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

import { Permission as PermissionEnum, RequestContext } from '@av/common'
import { Permission, User } from '@av/database'

import { UserService, UserWithRole } from './user.service'
import { PasswordService } from '../../infrastructure/services/password.service'
import { RegisterUserDto } from '../graphql/dto/register-user.dto'
import { LoginUserDto } from '../graphql/dto/login-user.dto'
import {
  AuthenticateUserSuccess,
  CreateUserAccountSuccess,
} from '../../infrastructure/graphql/auth.graphql'
import { RoleService } from './role.service'
import { PermissionService } from './permission.service'
import { fullNavbarItems } from '../ui/full-navbar-items'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService,
    private readonly pwService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(
    ctx: RequestContext,
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.userService.getByEmail(ctx, email)
    if (
      user &&
      (await this.pwService.validatePassword(password, user.passwordHash))
    ) {
      return user
    }
    return null
  }

  async createUserAccount(
    ctx: RequestContext,
    { email, password, roleId, isActive }: RegisterUserDto,
  ): Promise<CreateUserAccountSuccess> {
    const user = await this.userService.getByEmail(ctx, email)

    if (user) {
      throw new ConflictException(`User with email ${email} already exists.`)
    }

    const role = await this.roleService.getById(ctx, roleId)
    if (!role) throw new NotFoundException(`Role with ID ${roleId} not found.`)

    const passwordHash = await this.pwService.hashPassword(password)

    const newUser = {
      password: passwordHash,
      email,
      roleId,
      isActive,
      emailVerified: false,
    }

    const createdUser = await this.userService.create(ctx, newUser)

    return createdUser as CreateUserAccountSuccess
  }

  async getUserFromToken(
    ctx: RequestContext,
    token: string,
  ): Promise<User | null> {
    try {
      if (!token) throw new UnauthorizedException('Token is required')
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      })

      const user = await this.userService.getByEmail(ctx, decoded.email)
      return user
    } catch (error) {
      return null
    }
  }

  async authenticateUser(
    context: any,
    ctx: RequestContext,
    { email, password }: LoginUserDto,
  ): Promise<AuthenticateUserSuccess> {
    const user = await this.validateUser(ctx, email, password)
    if (!user) throw new ConflictException('Invalid credentials!')

    const token = this.signToken(user.id, user.email)
    context.req?.res?.cookie('access_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    return { token }
  }

  signToken(userId: string, email: string): string {
    const payload = { userId, email }
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('authentication.jwt.expiresIn'),
    })
  }

  async isAuthorizedToPerformAction(
    ctx: RequestContext,
    userId: string,
    requiredPermissions: PermissionEnum[],
    operator: 'OR' | 'AND',
  ): Promise<boolean> {
    const user: UserWithRole = (await this.userService.getUserById(
      ctx,
      userId,
      {
        role: true,
      },
    )) as UserWithRole

    if (user?.role.name === 'SUPER_ADMIN') return true

    if (!user) throw new ConflictException('User not found!')

    const permissions = await this.permissionService.getManyByRoleId(
      ctx,
      user.roleId,
    )
    const permissionNames = permissions.map(
      (permission) =>
        `${permission.resource}:${permission.action}:${permission.scope}`,
    ) as PermissionEnum[]

    if (operator === 'OR') {
      return requiredPermissions.some((permission) =>
        permissionNames.includes(permission),
      )
    } else {
      return requiredPermissions.every((permission) =>
        permissionNames.includes(permission),
      )
    }
  }

  async getUserAccessUI(ctx: RequestContext, userId: string) {
    const user = (await this.userService.getUserById(ctx, userId, {
      role: true,
    })) as UserWithRole

    if (user.role.name === 'SUPER_ADMIN') return fullNavbarItems

    const roleId = user.roleId
    const permissions = await this.permissionService.getManyByRoleId(
      ctx,
      roleId,
    )

    const userPermissions = new Set<string>(
      permissions.map((perm) => this.mapPermissionToString(perm)),
    )

    const hasPermissions = (requiredPermissions: string[]) =>
      requiredPermissions.every((perm) => userPermissions.has(perm))

    const filterNavbar = (items: any[]): any[] => {
      return items
        .map((item) => {
          if (!hasPermissions(item.permission)) {
            return null
          }

          const filteredItem = { ...item }

          if (filteredItem.children) {
            filteredItem.children = filterNavbar(filteredItem.children)
            if (filteredItem.children.length === 0) {
              return null
            }
          }

          return filteredItem
        })
        .filter((item) => item !== null)
    }

    const navbarItems = filterNavbar(fullNavbarItems)
    return navbarItems
  }

  mapPermissionToString(permission: Permission): string {
    return `${permission.action}_${permission.resource}`
  }
}
