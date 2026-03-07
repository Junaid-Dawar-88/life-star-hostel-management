"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/trpc/client";
import { MoreHorizontal } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import TaskModal from "./task-modal";
import UpdateTaskModal from "./update-task-modal";
import TaskSearch from "./task-search";

const statusColors: Record<string, string> = {
  TODO: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-700",
  MEDIUM: "bg-purple-100 text-purple-800",
  HIGH: "bg-red-100 text-red-800",
};

export default function TaskList() {
  const utils = trpc.useContext();

  const { data, isLoading } = trpc.organization.task.list.useQuery({
    limit: 50,
    offset: 0,
  });

  const deleteTask = trpc.organization.task.delete.useMutation({
    onSuccess: () => {
      utils.organization.task.list.invalidate();
    },
  });

  const [editingTask, setEditingTask] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Pagination
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);

  const filteredTasks = useMemo(() => {
    if (!data?.tasks) return [];

    return data.tasks.filter((task) => {
      const matchesSearch = task.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus = statusFilter ? task.status === statusFilter : true;

      const matchesPriority = priorityFilter
        ? task.priority === priorityFilter
        : true;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [data?.tasks, search, statusFilter, priorityFilter]);

  const paginatedTasks = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredTasks.slice(start, start + pageSize);
  }, [filteredTasks, pageIndex, pageSize]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading tasks...
      </div>
    );

  const totalPages = Math.ceil(filteredTasks.length / pageSize);

  return (
    <div className="p-6 space-y-6">

      {/* Top Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <TaskSearch
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
        />

        <TaskModal />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedTasks.map((task) => (
              <TableRow key={task.id} className="hover:bg-muted/50">

                <TableCell className="font-medium">
                  {task.title}
                </TableCell>

                <TableCell className="text-muted-foreground max-w-[200px] truncate">
                  {task.description || "-"}
                </TableCell>

                {/* Status Badge */}
                <TableCell>
                  <Badge
                    className={`border-none ${
                      statusColors[task.status] 
                    }`}
                  >
                    {task.status}
                  </Badge>
                </TableCell>

                {/* Priority Badge */}
                <TableCell>
                  <Badge
                    className={`border-none ${
                      priorityColors[task.priority]
                    }`}
                  >
                    {task.priority}
                  </Badge>
                </TableCell>

                <TableCell>
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "-"}
                </TableCell>

                {/* Actions Dropdown (Like Lead Table) */}
                <TableCell className="text-right">

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">

                      <DropdownMenuItem
                        onClick={() => {
                          setEditingTask(task);
                          setIsEditModalOpen(true);
                        }}
                      >
                        Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this task?"
                            )
                          ) {
                            deleteTask.mutate({ id: task.id });
                          }
                        }}
                      >
                        Delete
                      </DropdownMenuItem>

                    </DropdownMenuContent>
                  </DropdownMenu>

                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingTask && (
        <UpdateTaskModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          task={editingTask}
        />
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center pt-4">
        <div>
          Page {pageIndex + 1} of {totalPages}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={pageIndex === 0}
            onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
          >
            Prev
          </Button>

          <Button
            size="sm"
            disabled={pageIndex + 1 >= totalPages}
            onClick={() =>
              setPageIndex((prev) => Math.min(prev + 1, totalPages - 1))
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}