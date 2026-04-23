import React from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

const layout = ({children}) => {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  )
}

export default layout
