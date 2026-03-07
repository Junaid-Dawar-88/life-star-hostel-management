"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/trpc/client";

interface UpdateTaskModalProps {
  open: boolean;
  onClose: () => void;
  task: {
    id: string;
    title: string;
    description?: string | null;
    status: "todo" | "inProgress" | "done";
    priority: "low" | "medium" | "high";
    dueDate?: string | null;
  };
}

const UpdateTaskModal: React.FC<UpdateTaskModalProps> = ({
  open,
  onClose,
  task,
}) => {
  const utils = trpc.useUtils();

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState<"todo" | "inProgress" | "done">(task.status);
  const [priority, setPriority] = useState<"low" | "medium" | "high">(task.priority);
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
  );

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? "");
    setStatus(task.status);
    setPriority(task.priority);
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
  }, [task]);

  const updateTask = trpc.organization.task.update.useMutation({
    onSuccess: () => {
      utils.organization.task.list.invalidate();
      onClose();
    },
  });

  const handleSubmit = () => {
    updateTask.mutate({
      id: task.id,
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
      <div className="bg-[#0e0e12] border border-[#1e1e2a] rounded-xl w-full max-w-[520px] max-h-[90vh] overflow-auto text-white shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a24]">
          <h3 className="text-sm font-semibold">Update Task</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-[#1e1e2a] hover:bg-[#1a1a24]"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-3 rounded-md bg-[#14141c] border border-[#1e1e2a]"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[80px] px-3 py-2 rounded-md bg-[#14141c] border border-[#1e1e2a]"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Status</label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "todo" | "inProgress" | "done")
              }
              className="w-full h-10 px-3 rounded-md bg-[#14141c] border border-[#1e1e2a]"
            >
              <option value="todo">To Do</option>
              <option value="inProgress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as "low" | "medium" | "high")
              }
              className="w-full h-10 px-3 rounded-md bg-[#14141c] border border-[#1e1e2a]"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full h-10 px-3 rounded-md bg-[#14141c] border border-[#1e1e2a]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#1a1a24]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-[#1e1e2a]"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-md bg-yellow-600 text-white"
          >
            Update Task
          </button>
        </div>

      </div>
    </div>
  );
};

export default UpdateTaskModal;