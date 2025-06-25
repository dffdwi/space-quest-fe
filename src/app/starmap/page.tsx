"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useGameData, PlayerTask } from "@/hooks/useGameData";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { EventClickArg, EventInput } from "@fullcalendar/core";
import { FaMapMarkedAlt, FaRocket } from "react-icons/fa";
import AddTaskModal from "@/components/AddTaskModal";

export default function StarMapPage() {
const {
  user,
  isLoading: authLoading,
  playerData,
  isGameDataLoading: isLoadingData,
} = useAuth();
  const { addTask, editTask } = useGameData();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PlayerTask | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const calendarEvents = useMemo((): EventInput[] => {
    if (!playerData?.tasks) return [];

    return playerData.tasks.map((task) => ({
      id: task.taskId,
      title: task.title,
      date: task.dueDate,
      allDay: true,
      className: task.completed ? "fc-event-completed" : "fc-event-incomplete",
      extendedProps: {
        category: task.category,
        xp: task.xp,
        description: task.description,
      },
    }));
  }, [playerData?.tasks]);

  const handleEventClick = (clickInfo: EventClickArg) => {
    const { title, startStr } = clickInfo.event;
    const { xp, description } = clickInfo.event.extendedProps;
    window.showGlobalNotification?.({
      type: "info",
      title: `Objective: ${title}`,
      message: `${
        description ||
        `Due on ${new Date(startStr).toLocaleDateString("en-GB")}`
      }. Reward: ${xp} XP`,
    });
  };

  const handleDateClick = (arg: DateClickArg) => {
    setSelectedDate(arg.dateStr);
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleTaskSave = (
    taskData: Omit<PlayerTask, "taskId" | "completed" | "completedAt">,
    id?: string
  ) => {
    if (id) {
      editTask(id, taskData);
    } else {
      const { status, ...rest } = taskData;
      addTask({ ...rest, projectId: null, dueDate: selectedDate || undefined });
    }
    setIsModalOpen(false);
  };

  if (authLoading || isLoadingData || !playerData) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <FaRocket className="text-5xl text-indigo-400 animate-pulse" />
        <p className="ml-3 text-xl text-gray-300">Scanning Star Map Data...</p>
      </div>
    );
  }

  return (
    <>
      <div className="card p-5 md:p-6 bg-gray-800 border-gray-700">
        <div className="flex items-center mb-6">
          <FaMapMarkedAlt className="text-3xl text-sky-400 mr-3" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
            Star Map
          </h1>
        </div>
        <p className="text-sm text-gray-400 mb-6">
          A celestial map of your scheduled objectives. Click an objective for
          details or a date to add a new one.
        </p>

        <div className="fc-theme-dark">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={calendarEvents}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek",
            }}
            height="auto"
            editable={false}
            selectable={true}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            dayHeaderClassNames={"fc-header-cell"}
            dayCellClassNames={"fc-day-cell"}
            viewClassNames={"fc-view-container"}
            eventClassNames={"fc-event-custom"}
            buttonText={{
              today: "This Sector",
              month: "Month",
              week: "Week",
            }}
          />
        </div>
      </div>

      {isModalOpen && (
        <AddTaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleTaskSave}
          existingTask={editingTask}
          projectId={null}
          defaultDate={selectedDate || undefined}
        />
      )}
    </>
  );
}
