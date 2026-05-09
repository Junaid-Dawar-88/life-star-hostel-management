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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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

function DetailRow({
	icon,
	label,
	value,
	valueClass,
}: {
	icon: React.ReactNode;
	label: string;
	value: React.ReactNode;
	valueClass?: string;
}) {
	return (
		<div className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2.5">
			<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-background">
				{icon}
			</div>
			<span className="text-xs text-muted-foreground">{label}</span>
			<span
				className={`ml-auto text-xs font-semibold ${valueClass ?? "text-foreground"}`}
			>
				{value}
			</span>
		</div>
	);
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
	const [detailOpen, setDetailOpen] = useState(false);

	const paid = fee - remainingFee;
	const paidPct = fee > 0 ? Math.round((paid / fee) * 100) : 0;

	return (
		<>
			{/* Delete confirm */}
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

			{/* Detail popup */}
			<Dialog open={detailOpen} onOpenChange={setDetailOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader className="sr-only">
						<DialogTitle>{name}</DialogTitle>
						<DialogDescription>Student details</DialogDescription>
					</DialogHeader>

					{/* Profile header */}
					<div className="flex flex-col items-center gap-3 pt-2 pb-4 border-b border-border/60">
						<Avatar className="h-20 w-20 rounded-2xl border-2 border-border/60">
							<AvatarImage src={picture} alt={name} className="object-cover" />
							<AvatarFallback className="rounded-2xl bg-indigo-50 text-2xl font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
								{initials(name)}
							</AvatarFallback>
						</Avatar>
						<div className="text-center">
							<h2 className="text-base font-bold text-foreground">{name}</h2>
							<p className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
								<User className="h-3.5 w-3.5" />
								S/O {fatherName}
							</p>
						</div>
						{remainingFee > 0 ? (
							<Badge className="bg-rose-100 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40">
								Rs {remainingFee.toLocaleString()} pending
							</Badge>
						) : (
							<Badge className="bg-emerald-100 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40">
								Fully paid
							</Badge>
						)}
					</div>

					{/* Details */}
					<div className="space-y-2">
						<DetailRow
							icon={<Shield className="h-3.5 w-3.5 text-muted-foreground" />}
							label="NIC"
							value={<span className="font-mono">{nic}</span>}
						/>
						<DetailRow
							icon={<Phone className="h-3.5 w-3.5 text-muted-foreground" />}
							label="Phone"
							value={phone}
						/>
						<DetailRow
							icon={<Phone className="h-3.5 w-3.5 text-indigo-400" />}
							label="Guardian"
							value={guardianPhone}
						/>
						<DetailRow
							icon={<MapPin className="h-3.5 w-3.5 text-muted-foreground" />}
							label="Address"
							value={address}
						/>
					</div>

					{/* Fee section */}
					<div className="rounded-xl border border-border/60 p-4 space-y-3">
						<div className="flex items-center justify-between text-xs">
							<span className="font-medium text-muted-foreground">
								Fee Progress
							</span>
							<span className="font-semibold text-foreground">
								{paidPct}% paid
							</span>
						</div>
						<div className="h-2 overflow-hidden rounded-full bg-muted">
							<div
								className="h-full rounded-full bg-emerald-500 transition-all"
								style={{ width: `${paidPct}%` }}
							/>
						</div>
						<div className="grid grid-cols-3 gap-2 pt-1">
							<div className="text-center">
								<p className="text-[0.6rem] font-medium uppercase tracking-wider text-muted-foreground">
									Total
								</p>
								<p className="text-sm font-bold text-foreground">
									Rs {fee.toLocaleString()}
								</p>
							</div>
							<div className="text-center">
								<p className="text-[0.6rem] font-medium uppercase tracking-wider text-muted-foreground">
									Paid
								</p>
								<p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
									Rs {paid.toLocaleString()}
								</p>
							</div>
							<div className="text-center">
								<p className="text-[0.6rem] font-medium uppercase tracking-wider text-muted-foreground">
									Remaining
								</p>
								<p
									className={`text-sm font-bold ${remainingFee > 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"}`}
								>
									Rs {remainingFee.toLocaleString()}
								</p>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="flex gap-2 pt-1">
						<Button
							variant="outline"
							className="flex-1"
							onClick={() => {
								setDetailOpen(false);
								onEdit?.();
							}}
						>
							<Pencil className="mr-2 h-3.5 w-3.5" />
							Edit
						</Button>
						<Button
							variant="outline"
							className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/40 dark:text-rose-400"
							onClick={() => {
								setDetailOpen(false);
								setConfirmOpen(true);
							}}
						>
							<Trash2 className="mr-2 h-3.5 w-3.5" />
							Remove
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Card */}
			<div
				role="button"
				tabIndex={0}
				onClick={() => setDetailOpen(true)}
				onKeyDown={(e) => e.key === "Enter" && setDetailOpen(true)}
				className="group relative w-80 shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
			>
				{/* Top accent */}
				<div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-blue-400 via-indigo-400 to-violet-400" />

				<div className="flex flex-col gap-3 p-4 pt-5">
					{/* Header: avatar + name + menu */}
					<div className="flex items-start gap-2.5">
						<Avatar className="h-9 w-9 shrink-0 rounded-lg border border-border/60">
							<AvatarImage src={picture} alt={name} className="object-cover" />
							<AvatarFallback className="rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
								{initials(name)}
							</AvatarFallback>
						</Avatar>

						<div className="min-w-0 flex-1">
							<h3 className="truncate text-sm font-bold text-foreground">
								{name}
							</h3>
							<p className="flex items-center gap-1 truncate text-[0.68rem] text-muted-foreground">
								<User className="h-2.5 w-2.5 shrink-0" />
								S/O {fatherName}
							</p>
						</div>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-6 w-6 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
									onClick={(e) => e.stopPropagation()}
								>
									<MoreVertical className="h-3 w-3" />
									<span className="sr-only">Student options</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-36">
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										onEdit?.();
									}}
								>
									<Pencil className="mr-2 h-3.5 w-3.5" />
									Edit
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									variant="destructive"
									onClick={(e) => {
										e.stopPropagation();
										setConfirmOpen(true);
									}}
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
					<div className="space-y-1.5">
						<div className="flex items-center gap-2 text-[0.68rem]">
							<Shield className="h-3 w-3 shrink-0 text-muted-foreground" />
							<span className="text-muted-foreground">NIC</span>
							<span className="ml-auto font-mono font-medium text-foreground">
								{nic}
							</span>
						</div>

						<div className="flex items-center gap-2 text-[0.68rem]">
							<Phone className="h-3 w-3 shrink-0 text-muted-foreground" />
							<span className="text-muted-foreground">Student</span>
							<span className="ml-auto font-medium text-foreground">
								{phone}
							</span>
						</div>

						<div className="flex items-center gap-2 text-[0.68rem]">
							<Phone className="h-3 w-3 shrink-0 text-indigo-400" />
							<span className="text-muted-foreground">Guardian</span>
							<span className="ml-auto font-medium text-foreground">
								{guardianPhone}
							</span>
						</div>

						<div className="flex items-start gap-2 text-[0.68rem]">
							<MapPin className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
							<span className="text-muted-foreground">Address</span>
							<span className="ml-auto max-w-[55%] text-right font-medium text-foreground leading-snug">
								{address}
							</span>
						</div>

						<div className="h-px bg-border/50" />

						<div className="flex items-center gap-2 text-[0.68rem]">
							<BadgeDollarSign className="h-3 w-3 shrink-0 text-emerald-500" />
							<span className="text-muted-foreground">Total Fee</span>
							<span className="ml-auto font-semibold text-foreground">
								Rs {fee.toLocaleString()}
							</span>
						</div>

						<div className="flex items-center gap-2 text-[0.68rem]">
							<BadgeDollarSign className="h-3 w-3 shrink-0 text-rose-400" />
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
