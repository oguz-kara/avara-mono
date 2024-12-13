import { Injectable } from '@nestjs/common'
import { promises as fs } from 'fs'

import { FileSystemService } from '@av/asset/domain/services/file-system-service.interface'

@Injectable()
export class LocalFileSystemService implements FileSystemService {
  async ensureDirectoryExists(directory: string): Promise<void> {
    try {
      await fs.mkdir(directory, { recursive: true })
    } catch (error: any) {
      if (error.code !== 'EEXIST') throw error
    }
  }

  async writeFile(filePath: string, data: Buffer): Promise<void> {
    await fs.writeFile(filePath, data)
  }

  async readFile(filePath: string): Promise<Buffer> {
    return await fs.readFile(filePath)
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath)
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        console.error(`Failed to delete file: ${filePath}`, error)
        throw error
      }
    }
  }

  async deleteDirectory(directory: string): Promise<void> {
    try {
      await fs.rm(directory, { recursive: true, force: true })
    } catch (error) {
      console.error(`Error deleting directory: ${directory}`, error)
      throw error
    }
  }
}
