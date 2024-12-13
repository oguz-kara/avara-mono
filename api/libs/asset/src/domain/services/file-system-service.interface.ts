export interface FileSystemService {
  ensureDirectoryExists(directory: string): Promise<void>
  writeFile(filePath: string, data: Buffer): Promise<void>
  readFile(filePath: string): Promise<Buffer>
  deleteFile(filePath: string): Promise<void>
  deleteDirectory(directory: string): Promise<void>
}
