"use client";

import {
	AlertCircle,
	BadgeDollarSign,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	FileText,
	MapPin,
	MoreVertical,
	Pencil,
	Phone,
	Shield,
	Trash2,
	User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
	DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/trpc/client";
import { useSelectedMonth } from "./selected-month-context";
import type { StudentData } from "./student-modal";

export type StudentCardProps = StudentData & {
	onEdit?: () => void;
	onDelete?: (id: string) => void;
};

const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

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

function PayFeeDialog({
	studentId,
	studentName,
	defaultFee,
	open,
	onOpenChange,
	onSuccess,
}: {
	studentId: string;
	studentName: string;
	defaultFee: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}) {
	const { month: selectedMonth, year: selectedYear } = useSelectedMonth();
	const [month, setMonth] = useState(selectedMonth);
	const [year, setYear] = useState(selectedYear);
	const [amount, setAmount] = useState(
		defaultFee > 0 ? String(defaultFee) : "",
	);
	const [notes, setNotes] = useState("");

	// Reset to currently selected month whenever dialog opens
	useEffect(() => {
		if (open) {
			setMonth(selectedMonth);
			setYear(selectedYear);
			setAmount(defaultFee > 0 ? String(defaultFee) : "");
			setNotes("");
		}
	}, [open, defaultFee, selectedMonth, selectedYear]);

	const prevMonth = () => {
		if (month === 1) {
			setMonth(12);
			setYear(year - 1);
		} else setMonth(month - 1);
	};

	const nextMonth = () => {
		if (month === 12) {
			setMonth(1);
			setYear(year + 1);
		} else setMonth(month + 1);
	};

	const utils = trpc.useUtils();

	const recordPayment = trpc.organization.feePayment.recordPayment.useMutation({
		onSuccess: () => {
			toast.success(`Payment recorded for ${MONTHS[month - 1]} ${year}`);
			utils.organization.feePayment.listByStudent.invalidate({ studentId });
			onOpenChange(false);
			onSuccess?.();
		},
		onError: (err) => toast.error(err.message),
	});

	const handleSubmit = () => {
		const amt = Number(amount);
		if (Number.isNaN(amt) || amt < 1) {
			toast.error("Enter a valid amount greater than 0");
			return;
		}
		recordPayment.mutate({
			studentId,
			amount: Math.floor(amt),
			month,
			year,
			notes: notes.trim() || undefined,
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>Record Fee Payment</DialogTitle>
					<DialogDescription>
						Recording payment for{" "}
						<span className="font-medium text-foreground">{studentName}</span>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Month selector */}
					<div>
						<p className="mb-1.5 text-sm font-medium">Month</p>
						<div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
							<button
								type="button"
								onClick={prevMonth}
								className="rounded p-0.5 hover:bg-muted transition-colors"
							>
								<ChevronLeft className="h-4 w-4 text-muted-foreground" />
							</button>
							<span className="flex-1 text-center text-sm font-semibold text-foreground">
								{MONTHS[month - 1]} {year}
							</span>
							<button
								type="button"
								onClick={nextMonth}
								className="rounded p-0.5 hover:bg-muted transition-colors"
							>
								<ChevronRight className="h-4 w-4 text-muted-foreground" />
							</button>
						</div>
					</div>

					{/* Amount */}
					<div>
						<p className="mb-1.5 text-sm font-medium">Amount Paid (Rs)</p>
						<div className="relative">
							<BadgeDollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
							<Input
								type="number"
								min={1}
								placeholder={defaultFee > 0 ? String(defaultFee) : "e.g. 5000"}
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								onKeyDown={(e) => e.key === "Escape" && onOpenChange(false)}
								autoFocus
								className="pl-9"
							/>
						</div>
						{defaultFee > 0 && (
							<p className="mt-1 text-xs text-muted-foreground">
								Monthly fee: Rs {defaultFee.toLocaleString()}
							</p>
						)}
					</div>

					{/* Notes */}
					<div>
						<p className="mb-1.5 text-sm font-medium">
							Notes{" "}
							<span className="font-normal text-muted-foreground">
								(optional)
							</span>
						</p>
						<div className="relative">
							<FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
							<Textarea
								placeholder="Receipt number, payment method…"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								className="min-h-20 pl-9 resize-none"
							/>
						</div>
					</div>
				</div>

				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={recordPayment.isPending}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={recordPayment.isPending}
						className="bg-emerald-600 hover:bg-emerald-700 text-white"
					>
						<CheckCircle2 className="mr-2 h-4 w-4" />
						{recordPayment.isPending ? "Recording…" : "Record Payment"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function PaymentDetailDialog({
	open,
	onOpenChange,
	studentName,
	fee,
	paidAmount,
	remaining,
	currentMonth,
	currentYear,
	onRecordPayment,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	studentName: string;
	fee: number;
	paidAmount: number;
	remaining: number;
	currentMonth: number;
	currentYear: number;
	onRecordPayment: () => void;
}) {
	const isPaid = remaining === 0;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{isPaid ? (
							<CheckCircle2 className="h-5 w-5 text-emerald-500" />
						) : (
							<AlertCircle className="h-5 w-5 text-rose-500" />
						)}
						Payment Details
					</DialogTitle>
					<DialogDescription>
						{MONTHS[currentMonth - 1]} {currentYear}
					</DialogDescription>
				</DialogHeader>

				<div className="rounded-xl border border-border/60 overflow-hidden divide-y divide-border/60">
					<div className="flex items-center justify-between px-4 py-3">
						<span className="text-sm text-muted-foreground">Student</span>
						<span className="text-sm font-semibold text-foreground">
							{studentName}
						</span>
					</div>
					<div className="flex items-center justify-between px-4 py-3">
						<span className="text-sm text-muted-foreground">Monthly Fee</span>
						<span className="text-sm font-semibold text-foreground">
							Rs {fee.toLocaleString()}
						</span>
					</div>
					<div className="flex items-center justify-between px-4 py-3">
						<span className="text-sm text-muted-foreground">Amount Paid</span>
						<span
							className={`text-sm font-semibold ${paidAmount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}
						>
							{paidAmount > 0 ? `Rs ${paidAmount.toLocaleString()}` : "—"}
						</span>
					</div>
					<div className="flex items-center justify-between px-4 py-3 bg-muted/30">
						<span className="text-sm font-medium">Remaining</span>
						<span
							className={`text-sm font-bold ${remaining > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}
						>
							{remaining > 0
								? `Rs ${remaining.toLocaleString()}`
								: "Fully Paid"}
						</span>
					</div>
				</div>

				{!isPaid && (
					<DialogFooter>
						<Button
							className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
							onClick={() => {
								onOpenChange(false);
								onRecordPayment();
							}}
						>
							<BadgeDollarSign className="mr-2 h-4 w-4" />
							Record Payment
						</Button>
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
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
	picture,
	onEdit,
	onDelete,
}: StudentCardProps) {
	const { month: currentMonth, year: currentYear } = useSelectedMonth();

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [detailOpen, setDetailOpen] = useState(false);
	const [payOpen, setPayOpen] = useState(false);
	const [paymentDetailOpen, setPaymentDetailOpen] = useState(false);

	const { data: payments = [] } =
		trpc.organization.feePayment.listByStudent.useQuery(
			{ studentId: id },
			{ staleTime: 0, refetchOnWindowFocus: true },
		);

	const currentPayment = payments.find(
		(p) => p.month === currentMonth && p.year === currentYear,
	);
	const paidAmount = currentPayment?.amount ?? 0;
	const remaining = fee > 0 ? Math.max(0, fee - paidAmount) : 0;
	const isPending = fee > 0 && remaining > 0;
	const isPaid = fee > 0 && remaining === 0;

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

			{/* Pay fee dialog */}
			<PayFeeDialog
				studentId={id}
				studentName={name}
				defaultFee={fee}
				open={payOpen}
				onOpenChange={setPayOpen}
			/>

			{/* Payment detail dialog */}
			<PaymentDetailDialog
				open={paymentDetailOpen}
				onOpenChange={setPaymentDetailOpen}
				studentName={name}
				fee={fee}
				paidAmount={paidAmount}
				remaining={remaining}
				currentMonth={currentMonth}
				currentYear={currentYear}
				onRecordPayment={() => setPayOpen(true)}
			/>

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
						<div className="flex items-center gap-2">
							<Badge className="bg-indigo-100 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/40">
								Rs {fee.toLocaleString()} / month
							</Badge>
							{isPending && (
								<Badge className="bg-rose-100 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40">
									Rs {remaining.toLocaleString()} due
								</Badge>
							)}
							{isPaid && (
								<Badge className="bg-emerald-100 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40">
									Paid
								</Badge>
							)}
						</div>
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
					<div className="space-y-2">
						<DetailRow
							icon={
								<BadgeDollarSign className="h-3.5 w-3.5 text-emerald-500" />
							}
							label="Monthly Fee"
							value={`Rs ${fee.toLocaleString()}`}
							valueClass="text-emerald-600 dark:text-emerald-400"
						/>
						{fee > 0 && (
							<DetailRow
								icon={
									remaining > 0 ? (
										<AlertCircle className="h-3.5 w-3.5 text-rose-500" />
									) : (
										<CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
									)
								}
								label={`Remaining (${MONTHS[currentMonth - 1]})`}
								value={
									remaining > 0
										? `Rs ${remaining.toLocaleString()}`
										: "Fully Paid"
								}
								valueClass={
									remaining > 0
										? "text-rose-600 dark:text-rose-400"
										: "text-emerald-600 dark:text-emerald-400"
								}
							/>
						)}
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
							className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
							onClick={() => {
								setDetailOpen(false);
								setPayOpen(true);
							}}
							disabled={fee === 0}
							title={fee === 0 ? "Set a monthly fee first" : undefined}
						>
							<BadgeDollarSign className="mr-2 h-3.5 w-3.5" />
							Pay Fee
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
							<DropdownMenuContent align="end" className="w-40">
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										onEdit?.();
									}}
								>
									<Pencil className="mr-2 h-3.5 w-3.5" />
									Edit
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										setPayOpen(true);
									}}
									disabled={fee === 0}
								>
									<BadgeDollarSign className="mr-2 h-3.5 w-3.5 text-emerald-500" />
									Pay Fee
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
							<span className="text-muted-foreground">Monthly Fee</span>
							<span className="ml-auto font-semibold text-emerald-600 dark:text-emerald-400">
								{fee > 0 ? `Rs ${fee.toLocaleString()}` : "Not set"}
							</span>
						</div>

						{fee > 0 && (
							<div className="flex items-center gap-2 text-[0.68rem]">
								{remaining > 0 ? (
									<AlertCircle className="h-3 w-3 shrink-0 text-rose-500" />
								) : (
									<CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
								)}
								<span className="text-muted-foreground">
									{MONTHS[currentMonth - 1]}
								</span>
								<span
									className={`ml-auto font-semibold ${remaining > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}
								>
									{remaining > 0
										? `Rs ${remaining.toLocaleString()} due`
										: "Paid"}
								</span>
							</div>
						)}
					</div>

					{/* Status bar */}
					{fee > 0 &&
						(isPending ? (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									setPaymentDetailOpen(true);
								}}
								className="mt-0.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-rose-200/70 bg-rose-50/70 py-1.5 text-[0.72rem] font-semibold text-rose-700 transition-colors hover:bg-rose-100/90 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/50"
							>
								<AlertCircle className="h-3.5 w-3.5" />
								Pending — Rs {remaining.toLocaleString()} remaining
							</button>
						) : (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									setPaymentDetailOpen(true);
								}}
								className="mt-0.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-200/60 bg-emerald-50/60 py-1.5 text-[0.72rem] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100/80 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
							>
								<CheckCircle2 className="h-3.5 w-3.5" />
								Paid — Rs {paidAmount.toLocaleString()}
							</button>
						))}
				</div>
			</div>
		</>
	);
}
