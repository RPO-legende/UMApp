import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import {
  Mail,
  Clock,
  Compass,
  Trophy,
  CalendarDays,
  Bell,
  Globe,
  GraduationCap,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center px-6 py-14">
        {/* Center card */}
        <div className="mt-10 w-full max-w-xl rounded-md bg-white px-10 py-12 text-center shadow-sm">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
            UMApp
          </h1>

          {/* Logo */}
          <div className="mt-8 flex flex-col items-center">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-500">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-sky-500 bg-white">
                <GraduationCap className="h-8 w-8 text-slate-800" />
              </div>
            </div>
            <div className="mt-2 text-sm font-semibold text-sky-600">
              UMApp
            </div>
          </div>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-slate-600">
            Vse, kar potrebuješ kot študent UM – na enem mestu.
            <br />
            Urnik, obvestila, dogodki in skupnost, združeni v eni aplikaciji.

            
          </p>

          {/* Buttons */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button asChild className="h-10 gap-2 rounded-md px-6">
              <Link to="/register">
                <Mail className="h-4 w-4" />
                Registracija
              </Link>
            </Button>

            <Button
              asChild
              variant="secondary"
              className="h-10 gap-2 rounded-md px-6"
            >
              <Link to="/login">
                <Mail className="h-4 w-4" />
                Prijava
              </Link>
            </Button>
          </div>
        </div>

        {/* Bottom features */}
        <div className="mt-20 w-full">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
            <Feature icon={Clock} label="Prihrani čas" />
            <Feature icon={Compass} label="Vse na enem mestu" />
            <Feature icon={Trophy} label="Usvajaj in osvajaj" />
            <Feature icon={CalendarDays} label="Izuri svoj urnik" />
            <Feature icon={Bell} label="Spremljaj dogodanje" />
            <Feature icon={Globe} label="Razvijaj skupnost" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Feature({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <Icon className="h-7 w-7 text-slate-800" />
      <div className="mt-3 text-xs text-slate-700">{label}</div>
    </div>
  )
}
