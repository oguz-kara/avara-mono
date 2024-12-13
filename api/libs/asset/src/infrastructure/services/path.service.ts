import * as path from 'path'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PathService {
  buildAssetPath(
    basePath: string,
    assetName: string,
    variantKey?: string,
  ): string {
    const ext = path.extname(assetName)
    const basename = path.basename(assetName, ext)
    const fileName = variantKey ? `${basename}-${variantKey}${ext}` : assetName
    return path.join(basePath, fileName)
  }
}
