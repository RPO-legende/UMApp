import { useAuth } from "../contexts/AuthContext"
import { Card } from "../components/ui/card"

export default function WelcomePage() {
  const { user } = useAuth() as any

  const name =
    user?.displayName ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "uporabnik"

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="p-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Pozdravljen, {name}! 👋
        </h1>

        <p className="mt-4 text-gray-600">
          Veseli nas, da si se uspešno prijavil v aplikacijo.
        </p>
      </Card>
    </div>
  )
}
