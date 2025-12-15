import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Home</h1>
      <p className="text-muted-foreground">Vite + React Router + shadcn</p>
      <Button>Click me</Button>
    </div>
  )
}
