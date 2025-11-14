import Header from '@/components/Header'
import HeroBanner from '@/components/HeroBanner'
import PopularCategories from '@/components/PopularCategories'
import ProductGrid from '@/components/ProductGrid'
import Sidebar from '@/components/Sidebar'
import BottomNavigation from '@/components/BottomNavigation'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Main Content */}
      <main className="pb-20 md:pb-0">
        {/* Hero Banner */}
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <HeroBanner />
        </div>

        {/* Popular Categories */}
        <PopularCategories />

        {/* Main Grid Layout */}
        <div className="max-w-7xl mx-auto px-4 flex gap-6">
          <Sidebar />
          <div className="flex-1">
            <ProductGrid title="All Products" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
