import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/app-layout";
import NotMatch from "./pages/NotMatch";
import Dashboard from "./pages/Dashboard";
import ProductsPage from "./pages/products/Page";
import TasksPage from "./pages/tasks/Page";

export default function Router() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="" element={<Dashboard />} />
        <Route path="pages">
          <Route path="products" element={<ProductsPage />} />
          <Route path="tasks" element={<TasksPage />} />
        </Route>
        <Route path="*" element={<NotMatch />} />
      </Route>
    </Routes>
  );
}
