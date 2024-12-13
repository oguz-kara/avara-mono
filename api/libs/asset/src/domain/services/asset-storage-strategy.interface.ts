import { RequestContext } from '@av/common'
import { Asset, DbTransactionalClient } from '@av/database'

export interface AssetStorageStrategy {
  save(
    ctx: RequestContext,
    asset: Asset,
    file: Buffer,
    options?: { basePath?: string; tx?: DbTransactionalClient },
  ): Promise<Asset>
  saveImageWithScreenVariations(
    ctx: RequestContext,
    asset: Asset,
    file: Buffer,
    options?: { basePath?: string; tx?: DbTransactionalClient },
  ): Promise<Asset>
  getAssetBy(ctx: RequestContext, asset: Asset): Promise<Buffer>
  delete(ctx: RequestContext, asset: Asset): Promise<void>
  deleteAll(ctx: RequestContext): Promise<void>
}
