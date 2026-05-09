"use client";

import {
	BadgeDollarSign,
	MapPin,
	MoreVertical,
	Pencil,
	Phone,
	Shield,
	Trash2,
	User,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StudentData } from "./student-modal";

export type StudentCardProps = StudentData & {
	onEdit?: () => void;
	onDelete?: (id: string) => void;
};

function initials(name: string) {
	return name
		.split(" ")
		.map((n) => n[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

export function StudentCard({
	id,
	name,
	fatherName,
	nic,
	phone,
	guardianPhone,
	address,
	fee,
	remainingFee,
	picture,
	onEdit,
	onDelete,
}: StudentCardProps) {
	const [confirmOpen, setConfirmOpen] = useState(false);

	return (
		<>
			<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove {name}?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently remove{" "}
							<span className="font-medium text-foreground">{name}</span> from
							this room. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-white hover:bg-destructive/90"
							onClick={() => onDelete?.(id)}
						>
							Remove
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
				{/* Top accent */}
				<div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-blue-400 via-indigo-400 to-violet-400" />

				<div className="flex flex-col gap-4 p-5 pt-6">
					{/* Header: avatar + name + menu */}
					<div className="flex items-start gap-3">
						<Avatar className="h-12 w-12 shrink-0 rounded-xl border border-border/60">
							<AvatarImage src={picture} alt={name} className="object-cover" />
							<AvatarFallback className="rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
								{initials(name)}
							</AvatarFallback>
						</Avatar>

						<div className="min-w-0 flex-1">
							<h3 className="truncate text-sm font-bold text-foreground">
								{name}
							</h3>
							<p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
								<User className="h-3 w-3 shrink-0" />
								S/O {fatherName}
							</p>
						</div>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
								>
									<MoreVertical className="h-3.5 w-3.5" />
									<span className="sr-only">Student options</span>
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
									Remove
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					{/* Divider */}
					<div className="h-px bg-border/50" />

					{/* Info rows */}
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-xs">
							<Shield className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
							<span className="text-muted-foreground">NIC</span>
							<span className="ml-auto font-mono font-medium text-foreground">
								{nic}
							</span>
						</div>

						<div className="flex items-center gap-2 text-xs">
							<Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
							<span className="text-muted-foreground">Student</span>
							<span className="ml-auto font-medium text-foreground">
								{phone}
							</span>
						</div>

						<div className="flex items-center gap-2 text-xs">
							<Phone className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
							<span className="text-muted-foreground">Guardian</span>
							<span className="ml-auto font-medium text-foreground">
								{guardianPhone}
							</span>
						</div>

						<div className="flex items-start gap-2 text-xs">
							<MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
							<span className="text-muted-foreground">Address</span>
							<span className="ml-auto max-w-[55%] text-right font-medium text-foreground leading-snug">
								{address}
							</span>
						</div>

						<div className="h-px bg-border/50" />

						<div className="flex items-center gap-2 text-xs">
							<BadgeDollarSign className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
							<span className="text-muted-foreground">Total Fee</span>
							<span className="ml-auto font-semibold text-foreground">
								Rs {fee.toLocaleString()}
							</span>
						</div>

						<div className="flex items-center gap-2 text-xs">
							<BadgeDollarSign className="h-3.5 w-3.5 shrink-0 text-rose-400" />
							<span className="text-muted-foreground">Remaining</span>
							<span
								className={`ml-auto font-semibold ${remainingFee > 0 ? "text-rose-500" : "text-emerald-500"}`}
							>
								Rs {remainingFee.toLocaleString()}
							</span>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
