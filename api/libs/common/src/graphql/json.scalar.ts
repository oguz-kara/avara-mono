import { Scalar, CustomScalar } from '@nestjs/graphql'
import { Kind, ValueNode } from 'graphql'
import GraphQLJSON from 'graphql-type-json'

@Scalar('JSON', () => GraphQLJSON)
export class JSONScalar implements CustomScalar<any, any> {
  description = 'JSON scalar type'

  parseValue(value: any): any {
    return value
  }

  serialize(value: any): any {
    return value
  }

  parseLiteral(ast: ValueNode): any {
    if (ast.kind === Kind.OBJECT) {
      return ast
    }
    return null
  }
}
