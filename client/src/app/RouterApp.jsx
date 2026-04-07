// client/src/app/RouterApp.jsx

import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

// Layout base
import AppHeader from "../shared/components/AppHeader.jsx";
import AppFooter from "../shared/components/AppFooter.jsx";
import BreadcrumbsBar from "../shared/components/BreadcrumbsBar.jsx";

// Páginas públicas / experimentos
import HomeMenu from "../pages/HomeMenu.jsx";
import BernoulliPage from "../experiments/bernoulli/pages/BernoulliPage.jsx";
import SpringStaticWrapper from "../experiments/spring-static/pages/SpringStaticWrapper.jsx";
import SpringMasWrapper from "../experiments/spring-static/pages/SpringMasWrapper.jsx";
import LoginPage from "../pages/loginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";

// Panel Admin
import AdminLayout from "../pages/admin/AdminLayout.jsx";
import InstitutionsPage from "../pages/admin/InstitutionsPage.jsx";
import UsersPage from "../pages/admin/UsersPage.jsx";
import CoursesPage from "../pages/admin/CoursesPage.jsx";
import PendingUsersPage from "../pages/admin/PendingUsersPage.jsx";

// Panel Teacher
import TeacherLayout from "../pages/teacher/TeacherLayout.jsx";
import TeacherCoursesPage from "../pages/teacher/CoursesPage.jsx";
import StudentsPage from "../pages/teacher/StudentsPage.jsx";

// Panel Student
import StudentLayout from "../pages/student/StudentLayout.jsx";
import StudentCoursesPage from "../pages/student/CoursesPage.jsx";

// Guards
import { RequireRole } from "../lib/auth/RequireAuth.jsx";

// ── Layouts ──────────────────────────────────────────────────────────────────

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

function BernoulliWrapper() { return (<BernoulliPage />); }
function SpringWrapper()    { return (<SpringStaticWrapper />); }
function SpringMASRoute()   { return (<SpringMasWrapper />); }

// ── Router ────────────────────────────────────────────────────────────────────

export default function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Rutas públicas ── */}
        <Route element={<BaseLayout />}>
          <Route path="/"                           element={<HomeMenu />} />
          <Route path="/login"                      element={<LoginPage />} />
          <Route path="/register"                   element={<RegisterPage />} />
          <Route path="/experiments/bernoulli"      element={<BernoulliWrapper />} />
          <Route path="/experiments/spring"         element={<SpringWrapper />} />
          <Route path="/experiments/spring/mas"     element={<SpringMASRoute />} />
          <Route path="*"                           element={<Navigate to="/" replace />} />
        </Route>

        {/* ── Panel Admin ── */}
        <Route
          path="/admin"
          element={
            <RequireRole roles={["ADMIN"]} redirectTo="/login">
              <AdminLayout />
            </RequireRole>
          }
        >
          <Route index                              element={<Navigate to="/admin/pending" replace />} />
          <Route path="pending"                     element={<PendingUsersPage />} />
          <Route path="institutions"                element={<InstitutionsPage />} />
          <Route path="users"                       element={<UsersPage />} />
          <Route path="courses"                     element={<CoursesPage />} />
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
          <Route index                              element={<Navigate to="/teacher/courses" replace />} />
          <Route path="courses"                     element={<TeacherCoursesPage />} />
          <Route path="students"                    element={<StudentsPage />} />
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
          <Route index                              element={<Navigate to="/student/courses" replace />} />
          <Route path="courses"                     element={<StudentCoursesPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
