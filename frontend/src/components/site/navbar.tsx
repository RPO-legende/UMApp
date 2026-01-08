import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

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
  );
}

export default function Navbar() {
  try {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
      logout();
      navigate("/login");
    };

    return (
      <header className="mx-auto flex max-w-5xl items-center justify-between p-6">
        <Link to="/" className="text-lg font-semibold">
          UMApp
        </Link>

        <nav className="flex items-center gap-6">
          <NavItem to="/" label="Home" />
          <NavItem to="/about" label="About" />
          <NavItem to="/notes" label="Notes" />

          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground">
                Hello, {user?.name}
              </span>
              <Button onClick={handleLogout} size="sm" variant="outline">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="outline">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </header>
    );
  } catch (error) {
    console.error("Navbar error:", error);
    return (
      <header className="mx-auto flex max-w-5xl items-center justify-between p-6">
        <Link to="/" className="text-lg font-semibold">
          UMApp
        </Link>
        <nav className="flex items-center gap-6">
          <NavItem to="/" label="Home" />
          <NavItem to="/about" label="About" />
          <NavItem to="/notes" label="Notes" />
          <Button asChild size="sm" variant="outline">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/register">Sign up</Link>
          </Button>
        </nav>
      </header>
    );
  }
}
