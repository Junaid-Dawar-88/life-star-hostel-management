"use client"

import React, { useState } from "react"
import { trpc } from "@/trpc/client"

const TaskModal = () => {
  const utils = trpc.useUtils()

  const [open, setOpen] = useState(false)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<"todo" | "inProgress" | "done">("todo")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [dueDate, setDueDate] = useState("")

  const createTask = trpc.organization.task.create.useMutation({
    onSuccess: () => {
      utils.organization.task.list.invalidate()
      setOpen(false)
      setTitle("")
      setDescription("")
      setStatus("todo")
      setPriority("medium")
      setDueDate("")
    },
  })

  const handleSubmit = () => {
  createTask.mutate({
    title,
    description,
    status: status || 'todo',
    priority: priority || 'medium',
    dueDate: dueDate ? new Date(dueDate) : undefined,
  })
}

  return (
    <div>

      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-md bg-gray-900 hover:bg-gray-700 text-white"
      >
        Create Task
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">

          <div className="bg-[#0e0e12] border border-[#1e1e2a] rounded-xl w-full max-w-[520px] text-white shadow-2xl">

            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a24]">
              <h3 className="text-sm font-semibold">Create Task</h3>

              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-[#1e1e2a] hover:bg-[#1a1a24]"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">

              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Title *
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  type="text"
                  className="w-full h-10 px-3 rounded-md bg-[#14141c] border border-[#1e1e2a]"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[80px] px-3 py-2 rounded-md bg-[#14141c] border border-[#1e1e2a]"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Status
                </label>
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
                <label className="text-xs text-gray-400 block mb-1">
                  Priority
                </label>
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
                <label className="text-xs text-gray-400 block mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-[#14141c] border border-[#1e1e2a]"
                />
              </div>

            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#1a1a24]">

              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-md border border-[#1e1e2a]"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white"
              >
                Create Task
              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  )
}

export default TaskModal