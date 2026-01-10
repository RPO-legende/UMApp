import { createBrowserRouter } from "react-router-dom"
import AppLayout from "@/app/layout"
import HomePage from "@/pages/Home"
import AboutPage from "@/pages/About"
import LoginPage from "@/pages/Login"
import RegisterPage from "@/pages/Register"
import {ProfilePage} from "@/pages/Profile"
import {
  NotesProgramsPage,
  NotesCoursesPage,
  NotesCoursePage,
  NotesCourseModerationPage,
} from "@/pages/notes"

function NotFound() {
  return <div className="p-6">404</div>
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/profile",
    element: <ProfilePage />
  },
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "*", element: <NotFound /> },
       { path: "/notes", element: <NotesProgramsPage /> },
  { path: "/notes/program/:programId/year/:yearId", element: <NotesCoursesPage /> },
  { path: "/notes/program/:programId/year/:yearId/course/:courseId", element: <NotesCoursePage /> },
  { path: "/notes/moderation/program/:programId/year/:yearId/course/:courseId", element: <NotesCourseModerationPage /> },
    ],
  },
])
