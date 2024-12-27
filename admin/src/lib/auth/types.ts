export type Session = {
  user?: {
    id?: string
    username: string
    email: string
    roles: string[]
  }
  status: 'authenticated' | 'loading' | 'unauthenticated'
}
