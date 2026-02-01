import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StarkUI - Jarvis Interface',
  description: 'Jarvis Completion System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
