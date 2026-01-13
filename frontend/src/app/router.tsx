import { createBrowserRouter } from "react-router-dom"
import WelcomePage from "@/pages/WelcomePage"
import AppLayout from "@/app/layout"
import HomePage from "@/pages/Home"
import AboutPage from "@/pages/About"
import TimetablePage from "@/pages/Timetable"
import LoginPage from "@/pages/Login"
import RegisterPage from "@/pages/Register"
import Chat from "@/pages/Chat"
import DiscordPage from "@/pages/Discord"
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
   { path: "/", element: <HomePage /> },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: <AppLayout />,
    children: [
     {path:"/welcome", element: <WelcomePage/>},
      { path: "/about", element: <AboutPage /> },
      { path: "/timetable", element: <TimetablePage /> },
      { path: "/chat", element: <Chat /> },
      { path: "/discord", element: <DiscordPage /> },
      { path: "*", element: <NotFound /> },
       { path: "/notes", element: <NotesProgramsPage /> },
  { path: "/notes/program/:programId/year/:yearId", element: <NotesCoursesPage /> },
  { path: "/notes/program/:programId/year/:yearId/course/:courseId", element: <NotesCoursePage /> },
  { path: "/notes/moderation/program/:programId/year/:yearId/course/:courseId", element: <NotesCourseModerationPage /> }
,    ],
  },
])
