import { Outlet } from "react-router-dom"
import Navbar from "@/components/site/navbar"

export default function RootLayout() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>{" "}
        <Link to="/about">About</Link>
      </nav>
      <Outlet />
    </div>
  )
}
