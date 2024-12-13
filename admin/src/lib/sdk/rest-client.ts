import { cookies } from 'next/headers'

export class RestClient {
  private baseUrl: string = ''
  private channelToken: string = ''
  private static instance: Promise<RestClient>

  private constructor() {}

  static async getInstance() {
    if (!RestClient.instance) {
      const client = new RestClient()
      RestClient.instance = client.initialize()
    }
    return RestClient.instance
  }

  private async initialize() {
    const cookieStore = await cookies()
    this.channelToken = cookieStore.get('channel_token')?.value || ''
    this.baseUrl = `${process.env.NEXT_PUBLIC_REMOTE_URL}/admin-api` || ''

    if (!this.baseUrl) {
      throw new Error('Base URL is not defined in the .env file as REMOTE_URL')
    }
    return this
  }

  private async request(endpoint: string, options: RequestInit) {
    const url = `${this.baseUrl}/${endpoint}`
    options.headers = {
      'x-channel-token': this.channelToken || '',
      ...options.headers,
    }
    const response = await fetch(url, options)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      )
    }

    return response.json()
  }

  public get(endpoint: string, params?: Record<string, string>) {
    let url = endpoint

    if (params) {
      const queryString = new URLSearchParams(params).toString()
      url += `?${queryString}`
    }

    console.log({ params })
    console.log({ channelToken: this.channelToken })

    return this.request(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-channel-token': this.channelToken || '',
      },
    })
  }

  public post(endpoint: string, body: any) {
    return this.request(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-channel-token': this.channelToken || '',
      },
      body: JSON.stringify(body),
    })
  }

  public put(endpoint: string, body: any) {
    return this.request(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-channel-token': this.channelToken || '',
      },
      body: JSON.stringify(body),
    })
  }

  public delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-channel-token': this.channelToken || '',
      },
    })
  }
}

export const getRestClient = RestClient.getInstance.bind(RestClient)
