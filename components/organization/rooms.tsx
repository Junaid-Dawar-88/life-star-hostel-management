"use client";

import NiceModal from "@ebay/nice-modal-react";
import { BedDouble, Plus, Search, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";
import { RoomCard } from "./room-card";
import { type RoomData, RoomModal } from "./room-modal";
import { StudentRoomModal } from "./student-room";

type SeatType = "1_seater" | "2_seater" | "3_seater" | "4_seater";
type Floor = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";

function toRoomData(room: {
	id: string;
	name: string;
	seatType: string;
	floor: number;
}): RoomData {
	return {
		id: room.id,
		name: room.name,
		seatType: room.seatType as SeatType,
		floor: String(room.floor) as Floor,
	};
}

export function Rooms() {
	const utils = trpc.useUtils();
	const [search, setSearch] = useState("");

	const { data: rooms = [], isLoading } = trpc.organization.room.list.useQuery(
		{},
	);

	const deleteRoom = trpc.organization.room.delete.useMutation({
		onSuccess: () => {
			utils.organization.room.list.invalidate();
			toast.success("Room deleted");
		},
		onError: (err) => toast.error(err.message),
	});

	const filteredRooms = rooms.filter((room) => {
		const q = search.toLowerCase();
		return (
			room.name.toLowerCase().includes(q) ||
			String(room.floor).includes(q) ||
			room.seatType.replace(/_/g, " ").includes(q)
		);
	});

	const openCreate = () => {
		NiceModal.show(RoomModal, {});
	};

	const openEdit = (room: (typeof rooms)[0]) => {
		NiceModal.show(RoomModal, { room: toRoomData(room) });
	};

	const openView = (room: (typeof rooms)[0]) => {
		NiceModal.show(StudentRoomModal, { room: toRoomData(room) });
	};

	const handleDelete = (id: string) => {
		deleteRoom.mutate({ id });
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

			<div className="relative">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Search by room name, floor, or seat type…"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-9 pr-9"
				/>
				{search && (
					<button
						type="button"
						onClick={() => setSearch("")}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
					>
						<X className="h-4 w-4" />
						<span className="sr-only">Clear search</span>
					</button>
				)}
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 3 }).map((_, i) => (
						<Skeleton key={i} className="h-48 rounded-2xl" />
					))}
				</div>
			) : rooms.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
					<BedDouble className="mb-3 h-8 w-8 text-muted-foreground/40" />
					<p className="text-sm font-medium text-muted-foreground">
						No rooms yet
					</p>
					<p className="mt-1 text-xs text-muted-foreground">
						Click "Add Room" to create your first room.
					</p>
				</div>
			) : filteredRooms.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
					<Search className="mb-3 h-8 w-8 text-muted-foreground/40" />
					<p className="text-sm font-medium text-muted-foreground">
						No rooms match "{search}"
					</p>
					<p className="mt-1 text-xs text-muted-foreground">
						Try a different room name, floor number, or seat type.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{filteredRooms.map((room) => (
						<RoomCard
							key={room.id}
							{...toRoomData(room)}
							onView={() => openView(room)}
							onEdit={() => openEdit(room)}
							onDelete={handleDelete}
						/>
					))}
				</div>
			)}
		</div>
	);
}
