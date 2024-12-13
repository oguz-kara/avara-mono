import cookies from 'js-cookie'

export const getFetcherFunction = <T = any>(path: string) => {
  return async () => {
    let url = `${process.env.NEXT_PUBLIC_REMOTE_URL}`

    url = (url as string) + path

    const channelToken = cookies.get('channel_token')

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        ...(channelToken && { 'x-channel-token': channelToken }),
      },
    })

    if (!res.ok) throw new Error('Failed to fetch data!')

    const data = await res.json()

    return data as T
  }
}
