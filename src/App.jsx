import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { AdminAuthProvider } from './contexts/AdminAuthContext'
import { CartProvider } from './contexts/CartContext'
import { SiteSettingsProvider } from './contexts/SiteSettingsContext'
import { WebsiteProvider } from './contexts/WebsiteContext'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import AnnouncementBar from './components/AnnouncementBar'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import FAQ from './pages/FAQ'
import Policy from './pages/Policy'
import Shop from './pages/Shop'
import About from './pages/About'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderSuccess from './pages/OrderSuccess'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminCategories from './pages/admin/AdminCategories'
import AdminOrders from './pages/admin/AdminOrders'
import AdminUsers from './pages/admin/AdminUsers'
import AdminInquiries from './pages/admin/AdminInquiries'
import AdminPayments from './pages/admin/AdminPayments'
import AdminBrandSettings from './pages/admin/AdminBrandSettings'
import AdminFAQs from './pages/admin/AdminFAQs'
import AdminPolicies from './pages/admin/AdminPolicies'
import AllCategories from './pages/AllCategories'

function App() {
  return (
    <Router>
      <ScrollToTop />
      <WebsiteProvider>
        <SiteSettingsProvider>
          <AuthProvider>
            <AdminAuthProvider>
              <CartProvider>
              <Routes>
              <Route path="/admin/login" element={<AdminLogin />} />

              <Route path="/admin/dashboard" element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              } />

              <Route path="/admin/products" element={
                <AdminProtectedRoute>
                  <AdminProducts />
                </AdminProtectedRoute>
              } />

              <Route path="/admin/categories" element={
                <AdminProtectedRoute>
                  <AdminCategories />
                </AdminProtectedRoute>
              } />

              <Route path="/admin/orders" element={
                <AdminProtectedRoute>
                  <AdminOrders />
                </AdminProtectedRoute>
              } />

              <Route path="/admin/users" element={
                <AdminProtectedRoute>
                  <AdminUsers />
                </AdminProtectedRoute>
              } />

              <Route path="/admin/inquiries" element={
                <AdminProtectedRoute>
                  <AdminInquiries />
                </AdminProtectedRoute>
              } />

              <Route path="/admin/payments" element={
                <AdminProtectedRoute>
                  <AdminPayments />
                </AdminProtectedRoute>
              } />

              <Route path="/admin/brand" element={
                <AdminProtectedRoute>
                  <AdminBrandSettings />
                </AdminProtectedRoute>
              } />

              <Route path="/admin/faqs" element={
                <AdminProtectedRoute>
                  <AdminFAQs />
                </AdminProtectedRoute>
              } />

              <Route path="/admin/policies" element={
                <AdminProtectedRoute>
                  <AdminPolicies />
                </AdminProtectedRoute>
              } />

              <Route path="*" element={
                <div className="flex flex-col min-h-screen">
                  <AnnouncementBar />
                  <Header />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/shop/category/:categorySlug" element={<Shop />} />
                      <Route path="/categories" element={<AllCategories />} />
                      <Route path="/shop/:id" element={<ProductDetail />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/policy/:slug" element={<Policy />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/order-success" element={<OrderSuccess />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/profile" element={<Profile />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              } />
              </Routes>
              </CartProvider>
            </AdminAuthProvider>
          </AuthProvider>
        </SiteSettingsProvider>
      </WebsiteProvider>
    </Router>
  )
}

export default App
