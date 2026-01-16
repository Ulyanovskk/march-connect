import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ScrollToTop from "@/components/layout/ScrollToTop";
import LoadingScreen from "@/components/layout/LoadingScreen";

// Lazy-loaded components for better performance
const Index = lazy(() => import("./pages/Index"));
const Landing = lazy(() => import("./pages/Landing"));
const Catalogue = lazy(() => import("./pages/Catalogue"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Checkout = lazy(() => import("./pages/Checkout"));
const VendorDashboard = lazy(() => import("./pages/VendorDashboard"));
const VendorInscription = lazy(() => import("./pages/VendorInscription"));
const Payment = lazy(() => import("./pages/Payment"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const LegalNotice = lazy(() => import("./pages/LegalNotice"));
const FAQ = lazy(() => import("./pages/FAQ"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminClients = lazy(() => import("./pages/admin/Clients"));
const AdminVendors = lazy(() => import("./pages/admin/Vendors"));
const AdminShops = lazy(() => import("./pages/admin/Shops"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AdminFinance = lazy(() => import("./pages/admin/Finance"));
const AdminLogistics = lazy(() => import("./pages/admin/Logistics"));
const AdminSupport = lazy(() => import("./pages/admin/Support"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const Profile = lazy(() => import("./pages/Profile"));
const ClientOnboarding = lazy(() => import("./pages/onboarding/ClientOnboarding"));
const VendorOnboarding = lazy(() => import("./pages/onboarding/VendorOnboarding"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ShopDetail = lazy(() => import("./pages/ShopDetail"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes - données considérées fraîches
      gcTime: 1000 * 60 * 60, // 1 heure en mémoire
      retry: 1, // Une seule tentative en cas d'erreur
      refetchOnWindowFocus: false, // Pas de refetch quand on revient sur l'onglet
      refetchOnMount: false, // ⭐ Pas de refetch quand le composant se remonte
      refetchOnReconnect: false, // Pas de refetch à la reconnexion
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<Landing />} />

              {/* Protected Client Routes */}
              <Route path="/shop" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/catalogue" element={<Catalogue />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/boutique/:id" element={<ShopDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
              <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />

              {/* Onboarding Routes */}
              <Route path="/onboarding/client" element={<ProtectedRoute requiredRole="client" allowDuringOnboarding={true}><ClientOnboarding /></ProtectedRoute>} />
              <Route path="/onboarding/vendor" element={<ProtectedRoute requiredRole="vendor" allowDuringOnboarding={true}><VendorOnboarding /></ProtectedRoute>} />

              {/* Profile Route */}
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Protected Vendor Routes */}
              <Route path="/vendeur/inscription" element={<VendorInscription />} />
              <Route path="/vendor/dashboard" element={<ProtectedRoute requiredRole="vendor"><VendorDashboard /></ProtectedRoute>} />

              {/* Static Pages */}
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/legal-notice" element={<LegalNotice />} />
              <Route path="/faq" element={<FAQ />} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/clients" element={<ProtectedRoute requiredRole="admin"><AdminClients /></ProtectedRoute>} />
              <Route path="/admin/vendors" element={<ProtectedRoute requiredRole="admin"><AdminVendors /></ProtectedRoute>} />
              <Route path="/admin/shops" element={<ProtectedRoute requiredRole="admin"><AdminShops /></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute requiredRole="admin"><AdminProducts /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute requiredRole="admin"><AdminOrders /></ProtectedRoute>} />
              <Route path="/admin/finance" element={<ProtectedRoute requiredRole="admin"><AdminFinance /></ProtectedRoute>} />
              <Route path="/admin/logistics" element={<ProtectedRoute requiredRole="admin"><AdminLogistics /></ProtectedRoute>} />
              <Route path="/admin/support" element={<ProtectedRoute requiredRole="admin"><AdminSupport /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
