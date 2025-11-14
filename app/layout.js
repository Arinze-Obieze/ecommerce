import './globals.css'

export const metadata = {
  title: 'SWOO Telemart - Electronics & Gadgets',
  description: 'Shop quality electronics, cell phones, tablets, and gadgets at SWOO Telemart',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-white text-gray-900">
        {children}
      </body>
    </html>
  )
}