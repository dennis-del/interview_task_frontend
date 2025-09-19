// src/components/admin/EventFormModal.tsx
import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEventApi, updateEventApi, type EventResponse, type EventPayload } from "../../api/admin/eventApi";



interface EventFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: EventResponse; // includes id, participants, waitlist
  }
  

const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<EventPayload>({
    title: "",
    description: "",
    image: "",
    date: "",
    time: "",
    venue: "",
    organiser: "",
    participantLimit: 0,
    status: "Confirmed",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const createMutation = useMutation({
    mutationFn: createEventApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; event: EventPayload }) =>
      updateEventApi(data.id, data.event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "participantLimit" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData?.id) {
      updateMutation.mutate({ id: initialData.id, event: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-xs z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Edit Event" : "Create Event"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Event Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={formData.image}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <input
            type="text"
            name="venue"
            placeholder="Venue"
            value={formData.venue}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="organiser"
            placeholder="Organiser"
            value={formData.organiser}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="number"
            name="participantLimit"
            placeholder="Participant Limit"
            value={formData.participantLimit}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="Confirmed">Confirmed</option>
            <option value="Waitlist">Waitlist</option>
          </select>
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {initialData ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormModal;
