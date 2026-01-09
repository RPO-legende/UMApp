import { Link, Outlet } from "react-router-dom"

export default function RootLayout() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>{" "}
        <Link to="/about">About</Link>
        <Link to="/timetable">Timetable</Link>
      </nav>
      <Outlet />
    </div>
  )
}
