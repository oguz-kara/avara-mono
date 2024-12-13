import { InputType, Field } from '@nestjs/graphql'
import { IsEmail, IsString, IsNotEmpty } from 'class-validator'

@InputType()
export class LoginUserDto {
  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string

  @Field()
  @IsString()
  @IsNotEmpty()
  password: string
}
