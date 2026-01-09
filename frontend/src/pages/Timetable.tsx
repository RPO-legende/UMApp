import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Pencil, ArrowDownToLine, ArrowLeftIcon, ArrowRightIcon } from "lucide-react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useState } from "react"

{ /* Dumy Data */}
const subjects = [
  {
    name: "Operacijski sistemi",
    groups: ["OS1", "OS2", "OS3", "OS4", "OS5", "OS6", "OS7"]
  },
  {
    name: "Razvoj programske opreme",
    groups: ["RPO1", "RPO2", "RPO3", "RPO4", "RPO5", "RPO6"]
  },
  {
    name: "Računalniške arhitekture",
    groups: ["RA1", "RA2", "RA3", "RA4", "RA5", "RA6", "RA7", "RA8"]
  },
  {
    name: "Podatkovne baze",
    groups: ["DB1", "DB2", "DB3", "DB4", "DB5", "DB6"]
  },
  {
    name: "Mreže in komunikacije",
    groups: ["MK1", "MK2", "MK3", "MK4", "MK5", "MK6", "MK7"]
  },
  {
    name: "Algoritmi in podatkovne strukture",
    groups: ["APS1", "APS2", "APS3", "APS4", "APS5", "APS6", "APS7", "APS8"]
  },
  {
    name: "Programiranje 1",
    groups: ["P1A", "P1B", "P1C", "P1D", "P1E", "P1F"]
  },
  {
    name: "Programiranje 2",
    groups: ["P2A", "P2B", "P2C", "P2D", "P2E", "P2F", "P2G"]
  },
  {
    name: "Računalniška grafika",
    groups: ["RG1", "RG2", "RG3", "RG4", "RG5", "RG6"]
  },
  {
    name: "Umetna inteligenca",
    groups: ["UI1", "UI2", "UI3", "UI4", "UI5", "UI6", "UI7", "UI8", "UI9"]
  }
]

export function GroupsWrapper() {
  const [visible, setVisible] = useState(false)

  return (
    <div className="space-y-4">
      <Button
      variant="outline"
      className="bg-transparent hover:bg-transparent border hover:border-2 shadow"
      onClick={() => setVisible(v => !v)}>
        <Pencil className="mr-1 h-4 w-4" />
        {visible ? "Skrij skupine" : "Uredi skupine"}
      </Button>
      {visible && (
        <div className="rounded-xl border p-4">
          <SubjectGroupsGrid />
        </div>
      )}
    </div>
  )
}

{ /* Komponenta za prikaz predmetov in njihovih skupin v mreži */ }
export function SubjectGroupsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {subjects.map((subject) => (
        <Card key={subject.name} className="w-full">
          <CardHeader>
            <CardTitle>{subject.name}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            {subject.groups.map((g) => (
              <div key={g} className="flex items-center space-x-2">
                <Checkbox id={`${subject.name}-${g}`} />
                <Label htmlFor={`${subject.name}-${g}`}>{g}</Label>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


export default function TimetablePage() {
  return (
    <div className="min-h-screen min-w-[560px] bg-[#F1F9FB] flex flex-col items-center justify-start p-[5vw] gap-6">

      {/* Zgornji frame */}
      <div className="w-full bg-transparent flex justify-between items-center">
        <h2 className="text-xl font-semibold">RIT-UN, 2. letnik</h2>
        <div className="flex gap-2">

          {/* Gumb "Uredi" z dialogom */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-transparent hover:bg-transparent border hover:border-2 shadow">
                <Pencil className="mr-1 h-4 w-4" />Uredi
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[80vh] overflow-y-auto w-[70vw] sm:max-w-[800px]">

              <DialogHeader>
                <DialogTitle>Nastavitve urnika</DialogTitle>
              </DialogHeader>

              {/* dropdown – program */}
              <div className="space-y-2">
                <p className="text-sm">Ime programa</p>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Izberi program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rit">Računalništvo in informacijske tehnologije</SelectItem>
                    <SelectItem value="strojnistvo">Strojništvo</SelectItem>
                    <SelectItem value="elektrotehnika">Elektrotehnika</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* dropdown – letnik */}
              <div className="space-y-2">
                <p className="text-sm">Letnik izobraževanja</p>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Izberi letnik" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* morda bi bilo bolj smiselno, če tukaj ne hardcodam - pridobim seznam letnikov */}
                    <SelectItem value="1">1. letnik</SelectItem>
                    <SelectItem value="2">2. letnik</SelectItem>
                    <SelectItem value="3">3. letnik</SelectItem>
                    <SelectItem value="4">4. letnik</SelectItem>
                    <SelectItem value="5">5. letnik</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* seznam skupin */}
              <div className="space-y-2">
                <p className="text-sm">Moje skupine</p>
                <GroupsWrapper />
              </div>
              <DialogFooter className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Prekliči</Button>
                </DialogClose>

                <DialogClose asChild>
                  <Button variant="default">Shrani</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-transparent hover:bg-transparent border hover:border-2 shadow">
                <ArrowDownToLine className="mr-1 h-4 w-4" />Prenesi
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[90vw] sm:w-[400px]">
              <DialogHeader>
                <DialogTitle className="text-center">Prenesi urnik</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-center">
                <p>Datoteka urnik.csi je pripravljena. Ali jo želite prenesti na svojo napravo?</p>
              </div>
              <DialogFooter className="w-full flex justify-center sm:justify-center gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Prekliči</Button>
                </DialogClose>

                <DialogClose asChild>
                  <Button variant="default">Prenesi</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>


        </div>
      </div>

      {/* Spodaj shadcn Card */}
      <Card className="w-full h-[726px]">
        <CardHeader>
          <div className="w-full bg-transparent flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="default"><ArrowLeftIcon className="h-4 w-4" /></Button>
              <Button variant="default"><ArrowRightIcon className="h-4 w-4" /></Button>
              <Button variant="default">Danes</Button>
            </div>
            <div className="flex gap-2">
              <Button variant="default">Mesec</Button>
              <Button variant="default">Teden</Button>
              <Button variant="default">Dan</Button>
              <Button variant="default">Leto</Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          Tukaj dodamo urnik.
        </CardContent>
      </Card>

    </div>
  )
}
