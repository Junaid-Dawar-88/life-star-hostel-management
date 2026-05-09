"use client";

import NiceModal from "@ebay/nice-modal-react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RoomCard } from "./room-card";
import { type RoomData, RoomModal } from "./room-modal";

export function Rooms() {
	const [rooms, setRooms] = useState<RoomData[]>([]);

	const openCreate = () => {
		NiceModal.show(RoomModal, {
			onSuccess: (data) => {
				setRooms((prev) => [...prev, data]);
			},
		});
	};

	const openEdit = (room: RoomData) => {
		NiceModal.show(RoomModal, {
			room,
			onSuccess: (updated) => {
				setRooms((prev) =>
					prev.map((r) => (r.id === updated.id ? updated : r)),
				);
			},
		});
	};

	const handleDelete = (id: string) => {
		setRooms((prev) => prev.filter((r) => r.id !== id));
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-lg font-semibold">Rooms</h2>
					<p className="text-sm text-muted-foreground">
						{rooms.length} {rooms.length === 1 ? "room" : "rooms"} total
					</p>
				</div>
				<Button onClick={openCreate}>
					<Plus className="mr-2 h-4 w-4" />
					Add Room
				</Button>
			</div>

			{rooms.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
					<p className="text-sm font-medium text-muted-foreground">
						No rooms yet
					</p>
					<p className="mt-1 text-xs text-muted-foreground">
						Click "Add Room" to create your first room.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{rooms.map((room) => (
						<RoomCard
							key={room.id}
							{...room}
							onEdit={() => openEdit(room)}
							onDelete={handleDelete}
						/>
					))}
				</div>
			)}
		</div>
	);
}
