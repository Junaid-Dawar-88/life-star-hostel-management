"use client";

import {
	BedDouble,
	Building2,
	MoreVertical,
	Pencil,
	Trash2,
	Users,
} from "lucide-react";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SeatType = "1_seater" | "2_seater" | "3_seater" | "4_seater";
type Floor = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";

export type RoomCardProps = {
	id: string;
	name: string;
	seatType: SeatType;
	floor: Floor;
	onEdit?: () => void;
	onDelete?: (id: string) => void;
};

const seatLabel: Record<SeatType, string> = {
	"1_seater": "1 Seater",
	"2_seater": "2 Seater",
	"3_seater": "3 Seater",
	"4_seater": "4 Seater",
};

const seatCount: Record<SeatType, number> = {
	"1_seater": 1,
	"2_seater": 2,
	"3_seater": 3,
	"4_seater": 4,
};

export function RoomCard({
	id,
	name,
	seatType,
	floor,
	onEdit,
	onDelete,
}: RoomCardProps) {
	const seats = seatCount[seatType];
	const [confirmOpen, setConfirmOpen] = useState(false);

	return (
		<>
			<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete {name}?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently remove{" "}
							<span className="font-medium text-foreground">{name}</span> on
							Floor {floor}. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-white hover:bg-destructive/90"
							onClick={() => onDelete?.(id)}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
				{/* Accent stripe */}
				<div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-amber-400 via-orange-400 to-amber-500" />

				{/* Room number watermark */}
				<span
					aria-hidden
					className="pointer-events-none absolute right-4 top-4 select-none font-black text-[4rem] leading-none text-foreground/4 transition-all duration-300 group-hover:text-foreground/[0.07]"
				>
					{name.replace(/\D/g, "") || ""}
				</span>

				<div className="flex flex-col gap-4 p-5 pt-6">
					{/* Header */}
					<div className="flex items-start justify-between gap-2">
						{/* Room icon + name */}
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
								<BedDouble className="h-5 w-5" />
							</div>
							<div>
								<p className="text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground">
									Room
								</p>
								<h3 className="text-base font-bold leading-tight text-foreground">
									{name}
								</h3>
							</div>
						</div>

						{/* Actions dropdown */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
								>
									<MoreVertical className="h-4 w-4" />
									<span className="sr-only">Room options</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-36">
								<DropdownMenuItem onClick={onEdit}>
									<Pencil className="mr-2 h-3.5 w-3.5" />
									Edit
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									variant="destructive"
									onClick={() => setConfirmOpen(true)}
								>
									<Trash2 className="mr-2 h-3.5 w-3.5" />
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					{/* Divider */}
					<div className="h-px bg-border/50" />

					{/* Stats row */}
					<div className="flex items-center gap-3">
						{/* Floor */}
						<div className="flex flex-1 items-center gap-2 rounded-xl bg-muted/50 px-3 py-2.5">
							<Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
							<div>
								<p className="text-[0.6rem] font-medium uppercase tracking-wider text-muted-foreground">
									Floor
								</p>
								<p className="text-sm font-semibold leading-tight text-foreground">
									{floor}
								</p>
							</div>
						</div>

						{/* Seats */}
						<div className="flex flex-1 items-center gap-2 rounded-xl bg-muted/50 px-3 py-2.5">
							<Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
							<div>
								<p className="text-[0.6rem] font-medium uppercase tracking-wider text-muted-foreground">
									Seats
								</p>
								<p className="text-sm font-semibold leading-tight text-foreground">
									{seats}
								</p>
							</div>
						</div>
					</div>

					{/* Seat type badge */}
					<div className="flex items-center justify-between">
						<Badge
							variant="secondary"
							className="rounded-full border-amber-200/60 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-400"
						>
							{seatLabel[seatType]}
						</Badge>

						{/* Seat dots indicator */}
						<div className="flex items-center gap-1">
							{Array.from({ length: 4 }).map((_, i) => (
								<span
									key={i}
									className={`h-2 w-2 rounded-full transition-colors ${
										i < seats ? "bg-amber-400 dark:bg-amber-500" : "bg-border"
									}`}
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
