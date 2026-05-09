"use client";

import NiceModal, { type NiceModalHocProps } from "@ebay/nice-modal-react";
import { BedDouble, Building2, Plus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useEnhancedModal } from "@/hooks/use-enhanced-modal";
import { useHostel } from "@/lib/hostel-context";
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

export const StudentRoomModal = NiceModal.create<StudentRoomProps>(
	({ room }) => {
		const modal = useEnhancedModal();
		const { rooms, addStudent, updateStudent, deleteStudent } = useHostel();
		const totalSeats = seatCount[room.seatType];

		const roomData = rooms.find((r) => r.id === room.id);
		const students: StudentData[] = roomData?.students ?? [];

		const openAddStudent = () => {
			NiceModal.show(StudentModal, {
				roomId: room.id,
				onSuccess: (data) => {
					addStudent(room.id, data);
				},
			});
		};

		const openEditStudent = (student: StudentData) => {
			NiceModal.show(StudentModal, {
				student,
				onSuccess: (updated) => {
					updateStudent(room.id, updated);
				},
			});
		};

		const handleDeleteStudent = (id: string) => {
			deleteStudent(room.id, id);
		};

		const isFull = students.length >= totalSeats;

		return (
			<Sheet
				open={modal.visible}
				onOpenChange={(open) => !open && modal.handleClose()}
			>
				<SheetContent
					className="flex flex-col sm:max-w-lg"
					onAnimationEndCapture={modal.handleAnimationEndCapture}
				>
					<SheetHeader>
						<SheetTitle>{room.name}</SheetTitle>
						<SheetDescription className="sr-only">
							Room details and students
						</SheetDescription>
					</SheetHeader>

					{/* Room summary */}
					<div className="mx-6 mt-2 flex items-center gap-3 rounded-xl border border-border/60 bg-muted/40 p-4">
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
						</div>
					</div>

					{/* Students section */}
					<div className="flex flex-1 flex-col gap-3 overflow-hidden px-6 py-4">
						<div className="flex items-center justify-between">
							<p className="text-sm font-semibold">
								Students
								{students.length > 0 && (
									<span className="ml-1.5 text-muted-foreground font-normal">
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

						{students.length === 0 ? (
							<div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed text-center">
								<Users className="mb-3 h-8 w-8 text-muted-foreground/40" />
								<p className="text-sm font-medium text-muted-foreground">
									No students assigned
								</p>
								<p className="mt-1 text-xs text-muted-foreground">
									Click "Add Student" to assign one to this room.
								</p>
							</div>
						) : (
							<ScrollArea className="flex-1 -mx-1 px-1">
								<div className="grid grid-cols-1 gap-3 pb-4">
									{students.map((student) => (
										<StudentCard
											key={student.id}
											{...student}
											onEdit={() => openEditStudent(student)}
											onDelete={handleDeleteStudent}
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
