import { BrowserRouter, HashRouter } from "react-router";
import { ThemeProvider } from "./contexts/ThemeContext";
import Router from "./Router";
import { env } from "./env";

const AppRouter =
  import.meta.env.VITE_USE_HASH_ROUTE === "true" ? HashRouter : BrowserRouter;

export default function App() {
  console.log(env.VITE_APP_NAME);
  return (
    <ThemeProvider>
      <AppRouter>
        <Router />
      </AppRouter>
    </ThemeProvider>
  );
}
