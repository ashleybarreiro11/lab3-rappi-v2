import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

// Consumer
import { StoresPage } from "./pages/consumer/StoresPage";
import { ProductsPage } from "./pages/consumer/ProductsPage";
import { CartPage } from "./pages/consumer/CartPage";
import { MyOrdersPage } from "./pages/consumer/MyOrdersPage";
import { ConsumerTrackingPage } from "./pages/consumer/ConsumerTrackingPage";

// Store
import { MyStorePage } from "./pages/store/MyStorePage";
import { CreateProductPage } from "./pages/store/CreateProductPage";
import { StoreOrdersPage } from "./pages/store/StoreOrdersPage";

// Delivery
import { AvailableOrdersPage } from "./pages/delivery/AvailableOrdersPage";
import { MyDeliveriesPage } from "./pages/delivery/MyDeliveriesPage";
import { DeliveryTrackingPage } from "./pages/delivery/DeliveryTrackingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect raíz al login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Consumer */}
        <Route path="/consumer/stores" element={<StoresPage />} />
        <Route
          path="/consumer/stores/:storeId/products"
          element={<ProductsPage />}
        />
        <Route path="/consumer/cart" element={<CartPage />} />
        <Route path="/consumer/my-orders" element={<MyOrdersPage />} />
        <Route
          path="/consumer/tracking/:orderId"
          element={<ConsumerTrackingPage />}
        />

        {/* Store */}
        <Route path="/store/my-store" element={<MyStorePage />} />
        <Route path="/store/create-product" element={<CreateProductPage />} />
        <Route path="/store/orders" element={<StoreOrdersPage />} />

        {/* Delivery */}
        <Route
          path="/delivery/available-orders"
          element={<AvailableOrdersPage />}
        />
        <Route path="/delivery/my-deliveries" element={<MyDeliveriesPage />} />
        <Route
          path="/delivery/tracking/:orderId"
          element={<DeliveryTrackingPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
