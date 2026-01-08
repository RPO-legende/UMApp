import { createBrowserRouter } from "react-router-dom"
import AppLayout from "@/app/layout"
import HomePage from "@/pages/Home"
import AboutPage from "@/pages/About"
import TimetablePage from "@/pages/Timetable"

function NotFound() {
  return <div className="p-6">404</div>
}

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/timetable", element: <TimetablePage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
])
