import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as crypto from 'crypto'
import * as path from 'path'

@Injectable()
export class FilenameNormalizer {
  private readonly imageExtension: string
  private readonly prefix: string
  private readonly maxFileNameLength: number

  constructor(private readonly configService: ConfigService) {
    this.imageExtension = this.configService.get<string>(
      'asset.imageExtension',
      '',
    )
    this.prefix = this.configService.get<string>(
      'asset.filenamePrefix',
      'asset',
    )
    this.maxFileNameLength = this.configService.get<number>(
      'asset.maxFileNameLength',
      255,
    )
  }

  normalize(originalName: string, fileType: string): string {
    this.validateInput(originalName)

    const { extension } = this.parseFileName(originalName)
    const timestamp = this.generateTimestamp()
    const uniqueId = this.generateUniqueId()
    const finalExtension = this.determineExtension(extension, fileType)

    const normalizedName = this.buildNormalizedName(
      uniqueId,
      timestamp,
      finalExtension,
    )
    this.validateFinalName(normalizedName)

    return normalizedName.toLowerCase()
  }

  normalizeVariantName(originalName: string, variantKey: string): string {
    const ext = path.extname(originalName)
    const basename = path.basename(originalName, ext)
    return `${basename}-${variantKey}${ext}`
  }

  private validateInput(originalName: string): void {
    if (!originalName?.trim()) {
      throw new Error('Original filename must be provided')
    }
  }

  private parseFileName(originalName: string): {
    baseName: string
    extension: string
  } {
    const extension = path.extname(originalName)
    const baseName = path.basename(originalName, extension)

    if (!baseName) {
      throw new Error('Invalid filename format')
    }

    return { baseName, extension }
  }

  private generateTimestamp(): string {
    return Date.now().toString()
  }

  private generateUniqueId(length: number = 10): string {
    return crypto.randomBytes(length).toString('hex')
  }

  private determineExtension(
    originalExtension: string,
    fileType: string,
  ): string {
    if (fileType !== 'IMAGE') {
      return originalExtension || ''
    }

    if (!this.imageExtension) {
      return originalExtension || ''
    }

    const configExt = this.imageExtension.startsWith('.')
      ? this.imageExtension
      : `.${this.imageExtension}`

    return configExt
  }

  private buildNormalizedName(
    uniqueId: string,
    timestamp: string,
    extension: string,
  ): string {
    const nameComponents = [this.prefix, uniqueId, timestamp].filter(Boolean)

    const baseName = nameComponents.join('-')
    return `${baseName}${extension}`
  }

  private validateFinalName(filename: string): void {
    if (filename.length > this.maxFileNameLength) {
      throw new Error(
        `Generated filename exceeds maximum length of ${this.maxFileNameLength} characters`,
      )
    }

    if (!/^[a-zA-Z0-9-_.]+$/.test(filename)) {
      throw new Error('Generated filename contains invalid characters')
    }
  }

  getExtension(filename: string): string {
    return path.extname(filename).toLowerCase()
  }

  getBaseName(filename: string): string {
    const ext = this.getExtension(filename)
    return path.basename(filename, ext)
  }

  hasValidExtension(filename: string, allowedExtensions: string[]): boolean {
    const extension = this.getExtension(filename)
    return allowedExtensions.includes(extension.toLowerCase())
  }

  sanitizeFileName(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9-_.]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase()
  }
}
