export interface AIProvider {
  generateResponse(prompt: string, version?: string): Promise<string>
}
