// client/src/app/RouterApp.jsx

import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

// Layout base
import AppHeader from "../shared/components/AppHeader.jsx";
import AppFooter from "../shared/components/AppFooter.jsx";
import BreadcrumbsBar from "../shared/components/BreadcrumbsBar.jsx";
import BackToMenu from "../shared/components/BackToMenu.jsx";

// Páginas públicas / experimentos
import HomeMenu from "../pages/HomeMenu.jsx";
import BernoulliPage from "../experiments/bernoulli/pages/BernoulliPage.jsx";
import SpringStaticWrapper from "../experiments/spring-static/pages/SpringStaticWrapper.jsx";
import SpringMasWrapper from "../experiments/spring-static/pages/SpringMasWrapper.jsx";
import LoginPage from "../pages/loginPage.jsx";

// Panel Admin institucional
import AdminLayout from "../pages/admin/AdminLayout.jsx";
import InstitutionsPage from "../pages/admin/InstitutionsPage.jsx";
import UsersPage from "../pages/admin/UsersPage.jsx";
import CoursesPage from "../pages/admin/CoursesPage.jsx";

// Panel Teacher
import TeacherLayout from "../pages/teacher/TeacherLayout.jsx";
import GuidesPage from "../pages/teacher/GuidesPage.jsx";
import StudentsPage from "../pages/teacher/StudentsPage.jsx";

// Panel Superadmin global
import SuperAdminLayout from "../pages/superadmin/SuperAdminLayout.jsx";
import SAInstitutionsPage from "../pages/superadmin/SAInstitutionsPage.jsx";
import SAUsersPage from "../pages/superadmin/SAUsersPage.jsx";

// Panel Student
import StudentLayout from "../pages/student/StudentLayout.jsx";
import StudentCoursesPage from "../pages/student/CoursesPage.jsx";

// Panel Register
import RegisterPage from "../pages/RegisterPage.jsx";

// Guards
import { RequireRole } from "../lib/auth/RequireAuth.jsx";

// ── Layouts ────────────────────────────────────────────────────────────────

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

function BernoulliWrapper() { return (<><BackToMenu /><BernoulliPage /></>); }
function SpringWrapper() { return (<><BackToMenu /><SpringStaticWrapper /></>); }
function SpringMASRoute() { return (<><BackToMenu /><SpringMasWrapper /></>); }

// ── Router ─────────────────────────────────────────────────────────────────

export default function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Rutas públicas ── */}
        <Route element={<BaseLayout />}>
          <Route path="/" element={<HomeMenu />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/experiments/bernoulli" element={<BernoulliWrapper />} />
          <Route path="/experiments/spring" element={<SpringWrapper />} />
          <Route path="/experiments/spring/mas" element={<SpringMASRoute />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* ── Panel Admin institucional ── */}
        <Route
          path="/admin"
          element={
            <RequireRole roles={["ADMIN"]} redirectTo="/login">
              <AdminLayout />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="/admin/institutions" replace />} />
          <Route path="institutions" element={<InstitutionsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="courses" element={<CoursesPage />} />
        </Route>

        {/* ── Panel Teacher ── */}
        <Route
          path="/teacher"
          element={
            <RequireRole roles={["TEACHER"]} redirectTo="/login">
              <TeacherLayout />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="/teacher/guides" replace />} />
          <Route path="guides" element={<GuidesPage />} />
          <Route path="students" element={<StudentsPage />} />
        </Route>

        {/* ── Panel Student ── */}
        <Route
          path="/student"
          element={
            <RequireRole roles={["STUDENT"]} redirectTo="/login">
              <StudentLayout />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="/student/courses" replace />} />
          <Route path="courses" element={<StudentCoursesPage />} />
        </Route>

        {/* ── Panel Superadmin global ── */}
        <Route
          path="/superadmin"
          element={
            <RequireRole roles={["SUPERADMIN"]} redirectTo="/login">
              <SuperAdminLayout />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="/superadmin/institutions" replace />} />
          <Route path="institutions" element={<SAInstitutionsPage />} />
          <Route path="users" element={<SAUsersPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}