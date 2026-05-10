"use client";

import NiceModal, { type NiceModalHocProps } from "@ebay/nice-modal-react";
import { BedDouble, Building2, Plus, Search, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useEnhancedModal } from "@/hooks/use-enhanced-modal";
import { trpc } from "@/trpc/client";
import { StudentCard } from "./student-card";
import { type StudentData, StudentModal } from "./student-modal";

type SeatType = "1_seater" | "2_seater" | "3_seater" | "4_seater";
type Floor = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";

export type StudentRoomProps = NiceModalHocProps & {
	room: {
		id: string;
		name: string;
		seatType: SeatType;
		floor: Floor;
	};
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

function _initials(name: string) {
	return name
		.split(" ")
		.map((n) => n[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

function toStudentData(s: {
	id: string;
	name: string;
	fatherName: string;
	nic: string;
	phone: string;
	guardianPhone: string;
	address: string;
	fee: number;
	picture: string | null;
}): StudentData {
	return {
		id: s.id,
		name: s.name,
		fatherName: s.fatherName,
		nic: s.nic,
		phone: s.phone,
		guardianPhone: s.guardianPhone,
		address: s.address,
		fee: s.fee,
		picture: s.picture ?? undefined,
	};
}

export const StudentRoomModal = NiceModal.create<StudentRoomProps>(
	({ room }) => {
		const modal = useEnhancedModal();
		const utils = trpc.useUtils();
		const [search, setSearch] = useState("");
		const [container, setContainer] = useState<Element | null>(null);
		const totalSeats = seatCount[room.seatType];

		useEffect(() => {
			setContainer(document.getElementById("skip"));
		}, []);

		const { data: rooms = [] } = trpc.organization.room.list.useQuery({});
		const roomData = rooms.find((r) => r.id === room.id);
		const rawStudents = roomData?.students ?? [];
		const students: StudentData[] = rawStudents.map(toStudentData);

		const deleteStudent = trpc.organization.student.delete.useMutation({
			onSuccess: () => {
				utils.organization.room.list.invalidate();
			},
			onError: (err) => toast.error(err.message),
		});

		const filteredStudents = students.filter((s) => {
			const q = search.toLowerCase();
			return (
				s.name.toLowerCase().includes(q) ||
				s.nic.toLowerCase().includes(q) ||
				s.phone.toLowerCase().includes(q)
			);
		});

		const totalFee = students.reduce((sum, s) => sum + s.fee, 0);

		const openAddStudent = () => {
			NiceModal.show(StudentModal, { roomId: room.id });
		};

		const openEditStudent = (student: StudentData) => {
			NiceModal.show(StudentModal, { student });
		};

		const isFull = students.length >= totalSeats;

		return (
			<Sheet
				open={modal.visible}
				onOpenChange={(open) => !open && modal.handleClose()}
			>
				<SheetContent
					container={container}
					className="flex flex-col w-full! max-w-none! inset-0! border-0! rounded-none p-0 gap-0"
					onAnimationEndCapture={modal.handleAnimationEndCapture}
				>
					<SheetHeader className="px-6 pt-6 pb-4 border-b border-border/60">
						<SheetTitle className="text-lg">{room.name}</SheetTitle>
						<SheetDescription className="sr-only">
							Room details and students
						</SheetDescription>
					</SheetHeader>

					{/* Room summary */}
					<div className="mx-6 mt-4 flex items-center gap-3 rounded-xl border border-border/60 bg-muted/40 p-4">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
							<BedDouble className="h-5 w-5" />
						</div>
						<div className="flex flex-1 flex-wrap gap-3">
							<div className="flex items-center gap-1.5 text-sm">
								<Building2 className="h-3.5 w-3.5 text-muted-foreground" />
								<span className="text-muted-foreground">Floor</span>
								<span className="font-semibold">{room.floor}</span>
							</div>
							<div className="flex items-center gap-1.5 text-sm">
								<Users className="h-3.5 w-3.5 text-muted-foreground" />
								<span className="text-muted-foreground">
									{students.length}/{totalSeats} occupied
								</span>
							</div>
							<Badge
								variant="secondary"
								className="rounded-full border-amber-200/60 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-400"
							>
								{seatLabel[room.seatType]}
							</Badge>
							{students.length > 0 && (
								<span className="ml-auto text-xs font-medium text-muted-foreground">
									Monthly total:{" "}
									<span className="font-bold text-foreground">
										Rs {totalFee.toLocaleString()}
									</span>
								</span>
							)}
						</div>
					</div>

					{/* Students section */}
					<div className="flex flex-1 flex-col gap-3 overflow-hidden px-6 py-4">
						{/* Header */}
						<div className="flex items-center justify-between gap-2">
							<p className="text-sm font-semibold">
								Students
								{students.length > 0 && (
									<span className="ml-1.5 font-normal text-muted-foreground">
										({students.length})
									</span>
								)}
							</p>
							<Button
								size="sm"
								onClick={openAddStudent}
								disabled={isFull}
								title={isFull ? "Room is full" : undefined}
							>
								<Plus className="mr-1.5 h-3.5 w-3.5" />
								Add Student
							</Button>
						</div>

						{/* Search bar */}
						{students.length > 0 && (
							<div className="relative">
								<Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
								<Input
									placeholder="Search by name, NIC, or phone…"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="pl-9 pr-8 h-9 text-sm"
								/>
								{search && (
									<button
										type="button"
										onClick={() => setSearch("")}
										className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
									>
										<X className="h-3.5 w-3.5" />
										<span className="sr-only">Clear search</span>
									</button>
								)}
							</div>
						)}

						{/* Student list */}
						{students.length === 0 ? (
							<div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed text-center py-12">
								<Users className="mb-3 h-8 w-8 text-muted-foreground/40" />
								<p className="text-sm font-medium text-muted-foreground">
									No students assigned
								</p>
								<p className="mt-1 text-xs text-muted-foreground">
									Click "Add Student" to assign one to this room.
								</p>
							</div>
						) : filteredStudents.length === 0 ? (
							<div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed text-center py-12">
								<Search className="mb-3 h-8 w-8 text-muted-foreground/40" />
								<p className="text-sm font-medium text-muted-foreground">
									No students match "{search}"
								</p>
								<p className="mt-1 text-xs text-muted-foreground">
									Try a different name, NIC, or phone number.
								</p>
							</div>
						) : (
							<ScrollArea className="flex-1 -mx-1 px-1">
								<div className="flex flex-wrap gap-3 pb-4">
									{filteredStudents.map((student) => (
										<StudentCard
											key={student.id}
											{...student}
											onEdit={() => openEditStudent(student)}
											onDelete={(id) => deleteStudent.mutate({ id })}
										/>
									))}
								</div>
							</ScrollArea>
						)}
					</div>
				</SheetContent>
			</Sheet>
		);
	},
);
