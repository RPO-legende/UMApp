import { Link, Outlet } from "react-router-dom"

export default function RootLayout() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>{" "}
        <Link to="/about">About</Link>{" "}
        <Link to="/notes">Zapiski</Link>
        <Link to="/timetable">Urnik</Link>
      </nav>
      <Outlet />
    </div>
  )
}