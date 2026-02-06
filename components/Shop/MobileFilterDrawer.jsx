"use client"
import FilterSidebar from "../FilterSidebar"

export default function MobileFilterDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={onClose}>
      <div 
        className="absolute left-0 top-0 h-full w-80 bg-white shadow-lg overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <FilterSidebar onMobileClose={onClose} />
      </div>
    </div>
  )
}
