import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function Page({
  params,
}: {
  params: Promise<{ notFound: string }>
}) {
  const { notFound } = await params
  const notFoundTranslations = ['sayfa-bulunamadi', 'page-not-found']
  const notFoundTranslation = notFoundTranslations.find(
    (translation) => translation === notFound
  )

  if (!notFoundTranslation) {
    return redirect('/sayfa-bulunamadi')
  }

  return (
    <div>
      {notFoundTranslation} --{' '}
      <Link style={{ color: 'deepskyblue' }} href="/katalog/urunler">
        Urunler
      </Link>
    </div>
  )
}
