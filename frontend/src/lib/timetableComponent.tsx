import { useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import slLocale from '@fullcalendar/core/locales/sl';
import { timetableSubjects } from "@/lib/timetableData";


// Pridobimo ustrezen način urnika ob zagonu, glede na velikost naprave
const getInitialView = () => {
  if (typeof window === 'undefined') return 'timeGridWeek';
  return window.innerWidth < 768 ? 'listWeek' : 'timeGridWeek';
};


// Glavna funkcija za koledar
export function TimetableCalendar({ onEventClick }: { onEventClick: (event: any) => void }) {
  const calendarRef = useRef<FullCalendar>(null);

  // Funkcija zkrajšanje imena predmeta (vzeto od: https://github.com/AnzeBlaBla/feri-timetable-plus-plus/blob/main/src/components/TimetableCalendar.tsx)
  const getShorthandName = (courseName: string) => {
    const ignoreWords = ['in', 'iz', 'na', 'za', 'v', 'z', 'a', 'an', 'the', 'of', 'to', 'for', 'with', 'and', 'or'];
    return courseName
      .split(' ')
      .filter(w => w.length > 0 && !ignoreWords.includes(w.toLowerCase()))
      .map(w => w[0].toUpperCase())
      .join('');
  };

  // Nalaganje dogodkov ob zagonu
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;

    calendarApi.removeAllEvents();

    timetableSubjects.forEach(subject => {
      subject.events.forEach(e => {
        calendarApi.addEvent({
          title: subject.name,
          start: `${e.day}T${e.startTime}`,
          end: `${e.day}T${e.endTime}`,
          backgroundColor: subject.color,
          borderColor: subject.color,
          extendedProps: {
            type: e.type,
            group: e.group,
            lecturer: e.lecturer,
            location: e.location,
            shortenedTitle: getShorthandName(subject.name),
          }
        });
      });
    });
  }, []);

  // Ob kliku na dogodek
  const handleEventClick = (info: any) => {
    const e = info.event;
    const props = e.extendedProps;

    onEventClick({
      title: e.title,
      type: props.type,
      group: props.group,
      lecturer: props.lecturer,
      location: props.location,
      start: e.start ? e.start.toLocaleString() : 'neznano',
      end: e.end ? e.end.toLocaleString() : 'neznano'
    });
  };

  // Funkcija za oblikovanje vsebine posameznega dogodka
  const renderEventContent = (arg: any) => {
    const e = arg.event;
    const p = e.extendedProps;
    return {
      html: `
        <div class="flex flex-col text-xs leading-tight">
          <div class="text-[10px] opacity-70">${arg.timeText}</div>

          <!-- Polno ime za široki zaslon -->
          <div class="font-bold text-sm full-name">
            ${e.title.toUpperCase()} (${p.type ?? ""})
          </div>

          <!-- Skrajšano ime za ozki zaslon -->
          <div class="font-bold text-sm short-name">
            ${p.shortenedTitle ?? e.title} (${p.type ?? ""})
          </div>

          <div class="text-[10px] opacity-70">${p.location ?? ""}</div>
        </div>
      `
    };
  };

  // Vrnemo urnik s spodnjimi nastavitvami
  return (
    <FullCalendar
      ref={calendarRef}
      height="800px"
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
      initialView={getInitialView()}
      locale={slLocale}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
      }}
      allDaySlot={false}
      slotMinTime="07:00:00"
      slotMaxTime="21:00:00"
      weekends={false}
      eventClick={handleEventClick}
      eventContent={renderEventContent}
    />
  );
}

// Wrapper z responsive CSS - oblikovanje in obravnava za različne velikosti zaslonov
export function TimetableCalendarWrapper({ onEventClick }: { onEventClick: (event: any) => void }) {
  return (
    <>
      <TimetableCalendar onEventClick={onEventClick} />
      <style>
        {`
          .short-name { display: none; }
          .full-name { display: block; }
          @media screen and (max-width: 850px) {
            .short-name { display: block; }
            .full-name { display: none; }
            .fc-toolbar.fc-header-toolbar {
              flex-direction: column;
            }
            .fc-toolbar-chunk {
              display: table-row;
              text-align: center;
              padding: 5px 0;
            }
          }
          .fc-event {
            transition: transform 0.2s, box-shadow 0.2s, z-index 0.2s;
            position: relative;
          }
          .fc-event:hover {
            transform: scale(1.01);
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            cursor: pointer;
            z-index: 100;
          }
          .fc-timegrid-event, .fc-daygrid-event {
            overflow: visible;
          }
        `}
      </style>
    </>
  );
}
