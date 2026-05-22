import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { OrderProvider } from './context/OrderContext'
import { Layout } from './components/layout/Layout'
import { AdminLayout } from './pages/admin/AdminLayout'

import { HomePage } from './pages/HomePage'
import { CatalogPage } from './pages/CatalogPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CartPage } from './pages/CartPage'
import { OrderFormPage } from './pages/OrderFormPage'
import { OrderConfirmationPage } from './pages/OrderConfirmationPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { MyOrdersPage } from './pages/account/MyOrdersPage'
import { ProfilePage } from './pages/account/ProfilePage'
import { ContactPage } from './pages/ContactPage'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminInventory } from './pages/admin/AdminInventory'
import { AdminOrders } from './pages/admin/AdminOrders'
import { AdminProducts } from './pages/admin/AdminProducts'
import { AdminProductNew } from './pages/admin/AdminProductNew'
import { AdminProductEdit } from './pages/admin/AdminProductEdit'
import { AdminContact } from './pages/admin/AdminContact'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <OrderProvider>
            <Routes>
              {/* Rutas públicas — con Navbar y Footer */}
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/productos" element={<CatalogPage />} />
                <Route path="/productos/:id" element={<ProductDetailPage />} />
                <Route path="/carrito" element={<CartPage />} />
                <Route path="/pedido" element={<OrderFormPage />} />
                <Route path="/pedido/confirmacion" element={<OrderConfirmationPage />} />
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/registro" element={<RegisterPage />} />
                <Route path="/cuenta/pedidos" element={<MyOrdersPage />} />
                <Route path="/cuenta/perfil" element={<ProfilePage />} />
                <Route path="/contacto" element={<ContactPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>

              {/* Rutas admin — layout propio, sin Navbar ni Footer */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="productos" element={<AdminProducts />} />
                <Route path="productos/nuevo" element={<AdminProductNew />} />
                <Route path="productos/:id" element={<AdminProductEdit />} />
                <Route path="inventario" element={<AdminInventory />} />
                <Route path="solicitudes" element={<AdminOrders />} />
                <Route path="contacto" element={<AdminContact />} />
              </Route>
            </Routes>
          </OrderProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
