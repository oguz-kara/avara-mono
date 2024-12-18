import Link from 'next/link'
import { redirect } from 'next/navigation'

export default function Page({ params }: { params: { notFound: string } }) {
  const notFoundTranslations = ['sayfa-bulunamadi', 'page-not-found']
  const notFoundTranslation = notFoundTranslations.find(
    (translation) => translation === params.notFound
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
