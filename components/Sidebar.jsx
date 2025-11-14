'use client'

export default function Sidebar() {
  const categories = [
    'All Categories',
    'Cell Phones & Tablets',
    'iPhone',
    'Samsung',
    'Motorola',
    'iPad',
    'Gaming',
    'Wireless Chargers',
    '50 Support Smartphones'
  ]

  return (
    <aside className="hidden lg:block w-56 bg-gray-50 rounded-lg p-6 h-fit">
      <h3 className="text-lg font-bold mb-4">Categories</h3>
      <ul className="space-y-3">
        {categories.map((category) => (
          <li key={category}>
            <button className="text-gray-700 hover:text-blue-600 text-sm font-medium transition-colors">
              {category}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
