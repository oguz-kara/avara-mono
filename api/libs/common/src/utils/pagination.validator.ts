import { Global, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PaginationParams } from '../types'
import { ExceedingMaxLimitError } from '../context/errors'

@Global()
@Injectable()
export class PaginationValidator {
  constructor(private readonly configService: ConfigService) {}

  validatePaginationParams(args: {
    take?: number | 'all'
    skip?: number
  }): PaginationParams {
    if (args?.take === 'all') {
      return { skip: undefined, take: undefined }
    }

    const { skip, take } = this.resolvePaginationConfig(args)

    const result = this.isExceedingMaxLimit(take) ? false : { take, skip }

    if (!result) throw new ExceedingMaxLimitError()

    return result
  }

  private resolvePaginationConfig(args: {
    take?: number | 'all'
    skip?: number
  }): PaginationParams {
    if (args?.take === 'all') return { take: undefined, skip: undefined }

    return {
      take: !isNaN(Number(args?.take))
        ? Math.abs(args?.take)
        : this.configService.get<number>('pagination.limits.default'),
      skip: !isNaN(Number(args?.skip))
        ? Math.abs(args?.skip)
        : this.configService.get<number>('pagination.defaultPosition'),
    }
  }

  private isExceedingMaxLimit(take: number) {
    const maxLimit = this.configService.get<number>('pagination.limits.max')

    return take > maxLimit
  }
}
