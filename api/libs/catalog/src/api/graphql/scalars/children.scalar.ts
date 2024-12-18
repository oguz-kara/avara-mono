// children.scalar.ts
import { Scalar, CustomScalar } from '@nestjs/graphql'
import { Kind, ValueNode } from 'graphql'
import { GraphQLError } from 'graphql'

@Scalar('Children', () => [String])
export class ChildrenScalar implements CustomScalar<any, any> {
  description =
    'Children custom scalar that accepts either an array of strings or an array of GenerateFacetCollectionItem objects'

  parseValue(value: any) {
    // Validate that value is either array of strings or array of objects with 'title'
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return value
      }

      const allStrings = value.every((item) => typeof item === 'string')
      const allObjects = value.every(
        (item) => typeof item === 'object' && item !== null && 'title' in item,
      )

      if (allStrings || allObjects) {
        return value
      }
    }

    throw new GraphQLError(
      `Invalid value for Children scalar. Expected an array of strings or an array of GenerateFacetCollectionItem objects.`,
    )
  }

  serialize(value: any) {
    // Similar to parseValue
    return this.parseValue(value)
  }

  parseLiteral(ast: ValueNode) {
    if (ast.kind !== Kind.LIST) {
      throw new GraphQLError(`Children must be a list.`)
    }

    const values = ast.values.map((node) => {
      if (node.kind === Kind.STRING) {
        return node.value
      } else if (node.kind === Kind.OBJECT) {
        const obj: any = {}
        node.fields.forEach((field) => {
          if (field.value.kind === Kind.STRING) {
            obj[field.name.value] = field.value.value
          }
        })
        return obj
      } else {
        throw new GraphQLError(
          `Children list can only contain strings or objects with a 'title' field.`,
        )
      }
    })

    // Validate the parsed values
    const allStrings = values.every((item) => typeof item === 'string')
    const allObjects = values.every(
      (item) => typeof item === 'object' && item !== null && 'title' in item,
    )

    if (allStrings || allObjects) {
      return values
    }

    throw new GraphQLError(
      `Invalid value for Children scalar. Expected all elements to be strings or all elements to be GenerateFacetCollectionItem objects.`,
    )
  }
}
