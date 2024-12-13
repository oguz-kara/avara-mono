import cookies from 'js-cookie'

export const mutationFunction = async ({
  path,
  method = 'POST',
  body,
  options = { parseBody: true },
  headers = {},
}: {
  path: string
  method: string
  body: any
  options: { parseBody?: boolean }
  headers?: Record<string, string>
}) => {
  let url = `${process.env.NEXT_PUBLIC_REMOTE_URL}`

  url = (url as string) + path

  const channelToken = cookies.get('channel_token')

  console.log({ url })

  const res = await fetch(url, {
    method,
    ...(body && {
      body: options?.parseBody ? JSON.stringify(body) : body,
    }),
    headers: {
      ...(channelToken && { 'x-channel-token': channelToken }),
      ...headers,
    },
  })

  if (!res.ok) throw new Error('Failed to fetch data!')

  const data = await res.json()

  return data
}
