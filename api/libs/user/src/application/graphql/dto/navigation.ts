import { ObjectType, Field, registerEnumType } from '@nestjs/graphql'
import { Permission as CommonPermission } from '@av/common/access-control'

registerEnumType(CommonPermission, {
  name: 'CommonPermission',
  description: 'Available user permissions',
})

@ObjectType()
export class NavbarChildItem {
  @Field()
  label: string

  @Field(() => String, { nullable: true })
  route?: string

  @Field(() => [CommonPermission])
  permission: CommonPermission[]
}

@ObjectType()
export class NavbarItem {
  @Field()
  label: string

  @Field(() => [CommonPermission])
  permission: CommonPermission[]

  @Field(() => String, { nullable: true })
  route?: string

  @Field(() => [NavbarChildItem], { nullable: 'itemsAndList' })
  children?: NavbarChildItem[]
}

@ObjectType()
export class NavbarResponse {
  @Field(() => [NavbarItem])
  navbarItems: NavbarItem[]
}
