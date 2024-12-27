import { RequestContext } from '@av/common'

export interface TranslateProvider {
  translate(
    ctx: RequestContext,
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<string | Record<string, string>>
}
