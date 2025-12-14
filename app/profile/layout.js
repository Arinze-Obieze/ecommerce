import React from 'react'
import { ProtectedRoute } from '../../components/ProtectedRoute'

const layout = ({children}) => {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  )
}

export default layout
