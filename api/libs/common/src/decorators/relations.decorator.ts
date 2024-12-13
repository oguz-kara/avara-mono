import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { GraphQLResolveInfo } from 'graphql'
import * as graphqlFields from 'graphql-fields'

export const WithRelations = createParamDecorator(
  (data: { depth?: number; keys?: string[] }, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context)
    const info: GraphQLResolveInfo = ctx.getInfo()

    const maxDepth = data?.depth ?? 3
    const fields = graphqlFields(info)

    return extractPrismaRelations(fields, maxDepth)
  },
)

function extractPrismaRelations(
  fields: Record<string, any>,
  maxDepth: number,
  currentDepth = 0,
  excludeFields: string[] = ['items', 'rules', 'pagination', 'args'],
): Record<string, object | boolean> {
  if (currentDepth >= maxDepth) {
    return {}
  }

  const relations: Record<string, any> = {}

  for (const [key, value] of Object.entries(fields)) {
    if (excludeFields.includes(key)) {
      const nestedRelations = extractPrismaRelations(
        value,
        maxDepth,
        currentDepth + 1,
        excludeFields,
      )
      Object.assign(relations, nestedRelations)
      continue
    }

    const hasNestedFields = Object.keys(value).some((nestedKey) => {
      return Object.keys(value[nestedKey] || {}).length > 0
    })

    if (hasNestedFields) {
      relations[key] = {
        include: extractPrismaRelations(
          value,
          maxDepth,
          currentDepth + 1,
          excludeFields,
        ),
      }
    } else if (Object.keys(value).length > 0) {
      relations[key] = true
    }
  }

  return Object.keys(relations).length > 0 ? relations : undefined
}
