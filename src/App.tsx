// Add these new imports
import CountriesPage from "./pages/CountriesPage"
import ViolationsPage from "./pages/ViolationsPage"
import UNDeclarationsPage from "./pages/UNDeclarationsPage"

// Update the routes section
<Routes>
  {/* ... other routes ... */}
  <Route
    path="/countries"
    element={
      <Layout>
        <CountriesPage />
      </Layout>
    }
  />
  <Route
    path="/violations"
    element={
      <Layout>
        <ViolationsPage />
      </Layout>
    }
  />
  <Route
    path="/un-declarations"
    element={
      <Layout>
        <UNDeclarationsPage />
      </Layout>
    }
  />
</Routes>