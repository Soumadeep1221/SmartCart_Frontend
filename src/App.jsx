import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AppProvider } from "./Context/Context";
import { AuthProvider, useAuth } from "./Context/AuthContext";
import UpdateProduct from "./components/UpdateProduct";
import Order from "./components/Order";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Cart from "./components/Cart";
import AddProduct from "./components/AddProduct";
import Product from "./components/Product";
import Login from "./components/Login";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { toast, ToastContainer } from "react-toastify";

const RequireAuth = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-vh-100 d-flex align-items-center justify-content-center">Loading...</div>;
  }
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
};

const RequireAdmin = () => {
  const { user } = useAuth();
  return user?.admin
    ? <Outlet />
    : <Navigate to="/" replace />;
};

const AuthenticatedLayout = () => {
  useAuth();

  return (
    <>
      <Navbar />
      <div className="min-vh-100" style={{ backgroundColor: "var(--gray-50)" }}>
        <Outlet />
      </div>
    </>
  );
};

const ForbiddenNotice = () => {
  useEffect(() => {
    const handleForbidden = (event) => toast.warning(event.detail);
    window.addEventListener("api-forbidden", handleForbidden);
    return () => window.removeEventListener("api-forbidden", handleForbidden);
  }, []);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
        <ToastContainer autoClose={2000} hideProgressBar={true} />
        <ForbiddenNotice />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<RequireAuth />}>
              <Route element={<AuthenticatedLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/add_product" element={<AddProduct />} />
                <Route path="/product" element={<Product />} />
                <Route path="/product/:id" element={<Product />} />
                <Route path="/cart" element={<Cart />} />
                <Route element={<RequireAdmin />}>
                  <Route path="/product/update/:id" element={<UpdateProduct />} />
                  <Route path="/orders" element={<Order />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;