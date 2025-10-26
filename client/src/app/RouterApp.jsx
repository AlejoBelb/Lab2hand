// client/src/app/RouterApp.jsx

import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

// Layout
import AppHeader from "../shared/components/AppHeader.jsx";
import AppFooter from "../shared/components/AppFooter.jsx";
import BreadcrumbsBar from "../shared/components/BreadcrumbsBar.jsx";
import BackToMenu from "../shared/components/BackToMenu.jsx";

// Páginas
import HomeMenu from "../pages/HomeMenu.jsx";
import BernoulliPage from "../experiments/bernoulli/pages/BernoulliPage.jsx";

// Spring wrappers
import SpringStaticWrapper from "../experiments/spring-static/pages/SpringStaticWrapper.jsx";
import SpringMasWrapper from "../experiments/spring-static/pages/SpringMasWrapper.jsx";

// Login
import LoginPage from "../pages/loginPage.jsx";

// Rutas de diagnóstico y protección
import DemoAuthUsers from "../pages/DemoAuthUsers.jsx";
import { RequireRole } from "../lib/auth/RequireAuth.jsx";

function BaseLayout() {
  return (
    <>
      <AppHeader />
      <main className="container-max" style={{ padding: "8px 10px" }}>
        <BreadcrumbsBar />
        <Outlet />
      </main>
      <AppFooter />
    </>
  );
}

function BernoulliWrapper() {
  return (
    <>
      <BackToMenu />
      <BernoulliPage />
    </>
  );
}

function SpringWrapper() {
  return (
    <>
      <BackToMenu />
      <SpringStaticWrapper />
    </>
  );
}

function SpringMASRoute() {
  return (
    <>
      <BackToMenu />
      <SpringMasWrapper />
    </>
  );
}

export default function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<BaseLayout />}>
          <Route path="/" element={<HomeMenu />} />

          {/* Experimentos */}
          <Route path="/experiments/bernoulli" element={<BernoulliWrapper />} />
          <Route path="/experiments/spring" element={<SpringWrapper />} />
          <Route path="/experiments/spring/mas" element={<SpringMASRoute />} />

          {/* Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Demo/ADMIN (solo dev) */}
          {import.meta.env.DEV && <Route path="/demo-auth" element={<DemoAuthUsers />} />}
          {import.meta.env.DEV && (
            <Route
              path="/admin/users"
              element={
                <RequireRole roles={["ADMIN"]} redirectTo="/login">
                  <DemoAuthUsers />
                </RequireRole>
              }
            />
          )}

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
