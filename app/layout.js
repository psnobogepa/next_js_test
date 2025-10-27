import { Inter } from 'next/font/google'
import './styles/globals.scss'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata = {
  title: 'Freelance Services | Профессиональные услуги',
  description: 'Высококачественные фриланс-услуги в области веб-разработки, дизайна и маркетинга',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

