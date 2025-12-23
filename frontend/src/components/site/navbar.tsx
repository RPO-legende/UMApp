import { Link, NavLink } from "react-router-dom"
import { Button } from "@/components/ui/button"

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `text-sm ${isActive ? "font-semibold" : "text-muted-foreground"}`
      }
    >
      {label}
    </NavLink>
  )
}

export default function Navbar() {
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between p-6">
      <Link to="/" className="text-lg font-semibold">
        UMApp
      </Link>

      <nav className="flex items-center gap-6">
        <NavItem to="/" label="Home" />
        <NavItem to="/about" label="About" />
        <Button asChild size="sm">
          <Link to="/about">Get started</Link>
        </Button>
        <NavItem to ="/notes" label = "notes"/>
          <Button asChild size="sm">
             <Link to="/notes">Zapiski</Link>
          </Button>
        

      </nav>
    </header>
  )
}
