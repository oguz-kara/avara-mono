import { RestClient } from '../rest-client'

export class AssetSDK {
  private client: RestClient

  constructor(client: RestClient) {
    this.client = client
  }

  async getAssets() {
    const response = await this.client.get('assets/multiple')
    return response
  }

  async getAsset(id: string) {
    const response = await this.client.get(`assets/single/${id}`)
    return response.data
  }
}
