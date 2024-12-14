import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { AuthService } from '../../application/services/auth.service'
import { LoginUserDto } from '../../application/graphql/dto/login-user.dto'
import { RegisterUserDto } from '../../application/graphql/dto/register-user.dto'
import {
  AuthenticateUserSuccess,
  CreateUserAccountSuccess,
} from '../../infrastructure/graphql/auth.graphql'
import { UserType } from '@av/user/infrastructure/graphql/user.graphql'
import { Allow, Ctx, CurrentUser, Permission, RequestContext } from '@av/common'
import { NavbarResponse } from '@av/user/application/graphql/dto/navigation'

@Resolver(() => UserType)
export class AuthResolver {
  constructor(private readonly userAuthService: AuthService) {}

  @Mutation(() => AuthenticateUserSuccess)
  async authenticateUser(
    @Context() context: any,
    @Ctx() ctx: RequestContext,
    @Args('input') input: LoginUserDto,
  ) {
    return await this.userAuthService.authenticateUser(context, ctx, input)
  }

  @Mutation(() => CreateUserAccountSuccess)
  async createUserAccount(
    @Ctx() ctx: RequestContext,
    @Args('input') input: RegisterUserDto,
  ) {
    return await this.userAuthService.createUserAccount(ctx, input)
  }

  @Query(() => UserType, { nullable: true })
  async activeUser(@Context() context: any, @Ctx() ctx: RequestContext) {
    const token = context.req.headers['x-access-token'] as string
    return await this.userAuthService.getUserFromToken(ctx, token)
  }

  @Allow(Permission.READ_NAVBAR_ITEMS_GLOBAL)
  @Query(() => [NavbarResponse])
  async getUserAccessUI(@CurrentUser() user: any, @Ctx() ctx: RequestContext) {
    return await this.userAuthService.getUserAccessUI(ctx, user.userId)
  }
}
