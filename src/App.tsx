import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Catalogue from "./pages/Catalogue";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AuthCallback from "./pages/AuthCallback";
import Checkout from "./pages/Checkout";
import VendorDashboard from "./pages/VendorDashboard";
import VendorInscription from "./pages/VendorInscription";
import Payment from "./pages/Payment";
import OrderConfirmation from "./pages/OrderConfirmation";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import LegalNotice from "./pages/LegalNotice";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminClients from "./pages/admin/Clients";
import AdminVendors from "./pages/admin/Vendors";
import AdminShops from "./pages/admin/Shops";
import AdminOrders from "./pages/admin/Orders";
import AdminProducts from "./pages/admin/Products";
import AdminFinance from "./pages/admin/Finance";
import AdminLogistics from "./pages/admin/Logistics";
import AdminSupport from "./pages/admin/Support";
import AdminSettings from "./pages/admin/Settings";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Profile from "./pages/Profile";
import ClientOnboarding from "./pages/onboarding/ClientOnboarding";
import VendorOnboarding from "./pages/onboarding/VendorOnboarding";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ShopDetail from "./pages/ShopDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />

            {/* Protected Client Routes */}
            <Route path="/shop" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/catalogue" element={<ProtectedRoute><Catalogue /></ProtectedRoute>} />
            <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
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
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
