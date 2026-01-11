import { Outlet } from "react-router-dom"
import Navbar from "@/components/site/navbar"

export default function RootLayout() {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  )
}
