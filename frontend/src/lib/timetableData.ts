// Dummy podatki
export const subjects = [
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

export const timetableSubjects = [
  {
    name: "Operacijski sistemi",
    color: "#3b82f6",
    events: [
      {
        day: "2026-01-12",
        startTime: "08:00",
        endTime: "09:30",
        type: "LV",
        group: "RIT 2 UN 1. sk.",
        lecturer: "Gordana Radić",
        location: "G2-P02, pritličje"
      },
      {
        day: "2026-01-14",
        startTime: "10:00",
        endTime: "11:30",
        type: "P",
        group: "RIT 2 UN 2. sk.",
        lecturer: "Marko Novak",
        location: "G2-P03, pritličje"
      }
    ]
  },

  {
    name: "Podatkovne baze",
    color: "#f59e0b",
    events: [
      {
        day: "2026-01-12",
        startTime: "09:30",
        endTime: "11:00",
        type: "LV",
        group: "RIT 2 VS",
        lecturer: "Petra Kovač",
        location: "G1-P01, pritličje"
      }
    ]
  }
];