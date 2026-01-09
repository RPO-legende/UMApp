import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Pencil, ArrowDownToLine } from "lucide-react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { TimetableCalendarWrapper } from "@/lib/timetableComponent"
import { subjects } from "@/lib/timetableData";

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

// Komponenta za prikaz predmetov in njihovih skupin v mreži
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

// Osnovna zgradba strani
export default function TimetablePage() {
  // Za prikaz predmeta
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  return (
    <div className="min-h-screen w-full bg-[#F1F9FB] flex flex-col items-center pt-[2vw] px-[5vw] pb-[5vw] gap-6">

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
      <Card className="w-full h-full ">
        <CardContent>
          <TimetableCalendarWrapper
            onEventClick={(event) => {
              setSelectedEvent(event);
              setOpen(true);
          }}
/>
        </CardContent>
      </Card>
      {/* Podroben prikaz učne enote s podatki */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-1 text-sm">
              <div><strong>Tip:</strong> {selectedEvent.type}</div>
              <div><strong>Skupina:</strong> {selectedEvent.group}</div>
              <div><strong>Predavatelj:</strong> {selectedEvent.lecturer}</div>
              <div><strong>Prostor:</strong> {selectedEvent.location}</div>
              <div><strong>Začetek:</strong> {selectedEvent.start?.toLocaleString()}</div>
              <div><strong>Konec:</strong> {selectedEvent.end?.toLocaleString()}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
  )
}
