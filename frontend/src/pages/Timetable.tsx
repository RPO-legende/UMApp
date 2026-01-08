import { Button } from "@/components/ui/button"

export default function TimetablePage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Urnik</h1>

      <p className="text-muted-foreground">
        To je dummy stran za urnik. Tukaj bo kasneje prava vsebina.
      </p>

      <div className="rounded-xl border p-4">
        <p className="text-sm text-muted-foreground">
          Trenutno ni podatkov o urniku.
        </p>
      </div>

      <Button onClick={() => alert("Nič. Absolutno nič.")}>
        Osveži urnik
      </Button>
    </div>
  )
}
