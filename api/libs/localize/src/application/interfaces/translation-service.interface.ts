export interface TranslateService {
  translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<string | Record<string, string>>
}
