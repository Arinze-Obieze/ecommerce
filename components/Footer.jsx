'use client'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16 mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white font-bold mb-4">About Us</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-green-500">About SWOO</a></li>
              <li><a href="/" className="hover:text-green-500">Careers</a></li>
              <li><a href="/" className="hover:text-green-500">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-green-500">Contact Us</a></li>
              <li><a href="/" className="hover:text-green-500">FAQ</a></li>
              <li><a href="/" className="hover:text-green-500">Shipping Info</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Policies</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-green-500">Privacy Policy</a></li>
              <li><a href="/" className="hover:text-green-500">Terms of Service</a></li>
              <li><a href="/" className="hover:text-green-500">Returns</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Newsletter</h4>
            <p className="text-sm mb-3">Subscribe for exclusive offers</p>
            <input 
              type="email" 
              placeholder="Your email" 
              className="w-full px-3 py-2 bg-gray-800 text-white rounded text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2025 SWOO Telemart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
