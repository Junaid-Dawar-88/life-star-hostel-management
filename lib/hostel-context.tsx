"use client";

import * as React from "react";
import type { RoomData } from "@/components/organization/room-modal";
import type { StudentData } from "@/components/organization/student-modal";

export type RoomWithStudents = RoomData & { students: StudentData[] };

export type ActivityType =
	| "room_added"
	| "room_updated"
	| "room_deleted"
	| "student_added"
	| "student_updated"
	| "student_deleted";

export type ActivityEntry = {
	id: string;
	timestamp: Date;
	message: string;
	type: ActivityType;
};

type HostelContextValue = {
	rooms: RoomWithStudents[];
	activity: ActivityEntry[];
	addRoom: (room: RoomData) => void;
	updateRoom: (room: RoomData) => void;
	deleteRoom: (id: string) => void;
	addStudent: (roomId: string, student: StudentData) => void;
	updateStudent: (roomId: string, student: StudentData) => void;
	deleteStudent: (roomId: string, studentId: string) => void;
};

const HostelContext = React.createContext<HostelContextValue | null>(null);

export function HostelProvider({ children }: { children: React.ReactNode }) {
	const [rooms, setRooms] = React.useState<RoomWithStudents[]>([]);
	const [activity, setActivity] = React.useState<ActivityEntry[]>([]);

	const log = React.useCallback((message: string, type: ActivityType) => {
		setActivity((prev) =>
			[
				{
					id: crypto.randomUUID(),
					timestamp: new Date(),
					message,
					type,
				},
				...prev,
			].slice(0, 50),
		);
	}, []);

	const addRoom = React.useCallback(
		(room: RoomData) => {
			setRooms((prev) => [...prev, { ...room, students: [] }]);
			log(`Room "${room.name}" was added`, "room_added");
		},
		[log],
	);

	const updateRoom = React.useCallback(
		(room: RoomData) => {
			setRooms((prev) =>
				prev.map((r) => (r.id === room.id ? { ...r, ...room } : r)),
			);
			log(`Room "${room.name}" was updated`, "room_updated");
		},
		[log],
	);

	const deleteRoom = React.useCallback(
		(id: string) => {
			setRooms((prev) => {
				const room = prev.find((r) => r.id === id);
				if (room) log(`Room "${room.name}" was removed`, "room_deleted");
				return prev.filter((r) => r.id !== id);
			});
		},
		[log],
	);

	const addStudent = React.useCallback(
		(roomId: string, student: StudentData) => {
			let roomName = "a room";
			setRooms((prev) => {
				roomName = prev.find((r) => r.id === roomId)?.name ?? "a room";
				return prev.map((r) =>
					r.id === roomId ? { ...r, students: [...r.students, student] } : r,
				);
			});
			log(`${student.name} was added to ${roomName}`, "student_added");
		},
		[log],
	);

	const updateStudent = React.useCallback(
		(roomId: string, student: StudentData) => {
			setRooms((prev) =>
				prev.map((r) =>
					r.id === roomId
						? {
								...r,
								students: r.students.map((s) =>
									s.id === student.id ? student : s,
								),
							}
						: r,
				),
			);
			log(`${student.name}'s info was updated`, "student_updated");
		},
		[log],
	);

	const deleteStudent = React.useCallback(
		(roomId: string, studentId: string) => {
			setRooms((prev) => {
				const room = prev.find((r) => r.id === roomId);
				const student = room?.students.find((s) => s.id === studentId);
				if (student && room) {
					log(
						`${student.name} was removed from ${room.name}`,
						"student_deleted",
					);
				}
				return prev.map((r) =>
					r.id === roomId
						? { ...r, students: r.students.filter((s) => s.id !== studentId) }
						: r,
				);
			});
		},
		[log],
	);

	return (
		<HostelContext.Provider
			value={{
				rooms,
				activity,
				addRoom,
				updateRoom,
				deleteRoom,
				addStudent,
				updateStudent,
				deleteStudent,
			}}
		>
			{children}
		</HostelContext.Provider>
	);
}

export function useHostel(): HostelContextValue {
	const ctx = React.useContext(HostelContext);
	if (!ctx) throw new Error("useHostel must be used within HostelProvider");
	return ctx;
}
