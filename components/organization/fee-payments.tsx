"use client";

import {
	BadgeDollarSign,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	FileText,
	Pencil,
	Plus,
	Search,
	Settings2,
	Undo2,
	User,
	Users,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod/v4";
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
import { Field } from "@/components/ui/field";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useZodForm } from "@/hooks/use-zod-form";
import { trpc } from "@/trpc/client";
import { useSelectedMonth } from "./selected-month-context";

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

const paymentFormSchema = z.object({
	studentId: z.string().uuid("Select a student"),
	amount: z
		.string()
		.min(1, "Amount is required")
		.refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 1, {
			message: "Amount must be greater than 0",
		}),
	notes: z.string().trim().max(500).optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

type StudentRow = {
	id: string;
	name: string;
	fatherName: string;
	picture: string | null;
	room: { id: string; name: string };
	fee: number;
	payment: { id: string; amount: number; createdAt: Date | string } | null;
};

function initials(name: string) {
	return name
		.split(" ")
		.map((n) => n[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

function RecordPaymentDialog({
	students,
	preselectedId,
	month,
	year,
	open,
	onOpenChange,
	onSuccess,
}: {
	students: StudentRow[];
	preselectedId: string | null;
	month: number;
	year: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}) {
	const unpaidStudents = students.filter((s) => s.payment === null);

	const form = useZodForm({
		schema: paymentFormSchema,
		defaultValues: { studentId: "", amount: "", notes: "" },
	});

	const watchedStudentId = form.watch("studentId");
	const selectedStudent =
		students.find((s) => s.id === watchedStudentId) ?? null;

	useEffect(() => {
		if (open) {
			const defaultId = preselectedId ?? "";
			const student = students.find((s) => s.id === defaultId);
			form.reset({
				studentId: defaultId,
				amount: student && student.fee > 0 ? String(student.fee) : "",
				notes: "",
			});
		}
	}, [open, preselectedId]);

	// Auto-fill amount when student changes
	useEffect(() => {
		if (watchedStudentId) {
			const student = students.find((s) => s.id === watchedStudentId);
			if (student && student.fee > 0) {
				form.setValue("amount", String(student.fee));
			} else {
				form.setValue("amount", "");
			}
		}
	}, [watchedStudentId]);

	const utils = trpc.useUtils();

	const recordPayment = trpc.organization.feePayment.recordPayment.useMutation({
		onSuccess: (_, variables) => {
			toast.success("Payment recorded successfully");
			utils.organization.feePayment.listByStudent.invalidate({
				studentId: variables.studentId,
			});
			onOpenChange(false);
			onSuccess();
		},
		onError: (err) => toast.error(err.message),
	});

	const onSubmit = form.handleSubmit((data: PaymentFormValues) => {
		recordPayment.mutate({
			studentId: data.studentId,
			amount: Math.floor(Number(data.amount)),
			month,
			year,
			notes: data.notes || undefined,
		});
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Record Fee Payment</DialogTitle>
					<DialogDescription>
						Record payment for {MONTHS[month - 1]} {year}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={onSubmit} className="space-y-4">
						{/* Student selector */}
						<FormField
							control={form.control}
							name="studentId"
							render={({ field }) => (
								<FormItem asChild>
									<Field>
										<FormLabel>Student</FormLabel>
										<FormControl>
											<Select
												value={field.value}
												onValueChange={field.onChange}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select a student…" />
												</SelectTrigger>
												<SelectContent>
													{unpaidStudents.length === 0 ? (
														<div className="py-6 text-center text-sm text-muted-foreground">
															All students have paid for this month
														</div>
													) : (
														unpaidStudents.map((s) => (
															<SelectItem key={s.id} value={s.id}>
																<div className="flex items-center gap-2">
																	<span className="font-medium">{s.name}</span>
																	<span className="text-muted-foreground text-xs">
																		— {s.room.name}
																	</span>
																</div>
															</SelectItem>
														))
													)}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</Field>
								</FormItem>
							)}
						/>

						{/* Student info card */}
						{selectedStudent && (
							<div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/40 p-3">
								<Avatar className="h-9 w-9 shrink-0 rounded-xl border border-border/60">
									<AvatarImage
										src={selectedStudent.picture ?? undefined}
										alt={selectedStudent.name}
										className="object-cover"
									/>
									<AvatarFallback className="rounded-xl bg-indigo-50 text-xs font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
										{initials(selectedStudent.name)}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-semibold text-foreground">
										{selectedStudent.name}
									</p>
									<p className="truncate text-xs text-muted-foreground">
										S/O {selectedStudent.fatherName} &mdash; Room{" "}
										{selectedStudent.room.name}
									</p>
								</div>
								{selectedStudent.fee > 0 && (
									<Badge className="shrink-0 bg-emerald-100 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40 text-xs">
										Rs {selectedStudent.fee.toLocaleString()}
									</Badge>
								)}
							</div>
						)}

						{/* Amount */}
						<FormField
							control={form.control}
							name="amount"
							render={({ field }) => (
								<FormItem asChild>
									<Field>
										<FormLabel>Amount Paid (Rs)</FormLabel>
										<FormControl>
											<div className="relative">
												<BadgeDollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
												<Input
													type="number"
													min={1}
													placeholder="e.g. 5000"
													className="pl-9"
													autoComplete="off"
													{...field}
												/>
											</div>
										</FormControl>
										<FormMessage />
									</Field>
								</FormItem>
							)}
						/>

						{/* Notes */}
						<FormField
							control={form.control}
							name="notes"
							render={({ field }) => (
								<FormItem asChild>
									<Field>
										<FormLabel>
											Notes{" "}
											<span className="font-normal text-muted-foreground">
												(optional)
											</span>
										</FormLabel>
										<FormControl>
											<div className="relative">
												<FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
												<Textarea
													placeholder="e.g. Paid via bank transfer, receipt #1234…"
													className="min-h-20 pl-9 resize-none"
													{...field}
												/>
											</div>
										</FormControl>
										<FormMessage />
									</Field>
								</FormItem>
							)}
						/>

						<DialogFooter className="gap-2 sm:gap-0">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={recordPayment.isPending}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={
									recordPayment.isPending || unpaidStudents.length === 0
								}
								className="bg-emerald-600 hover:bg-emerald-700 text-white"
							>
								<CheckCircle2 className="mr-2 h-4 w-4" />
								{recordPayment.isPending ? "Recording…" : "Record Payment"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

function SetFeeDialog({
	studentId,
	studentName,
	currentFee,
	open,
	onOpenChange,
	onSaved,
}: {
	studentId: string;
	studentName: string;
	currentFee: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}) {
	const [value, setValue] = useState(currentFee > 0 ? String(currentFee) : "");

	useEffect(() => {
		if (open) setValue(currentFee > 0 ? String(currentFee) : "");
	}, [open, currentFee]);

	const updateStudent = trpc.organization.student.update.useMutation({
		onSuccess: () => {
			toast.success("Monthly fee updated");
			onOpenChange(false);
			onSaved();
		},
		onError: (err) => toast.error(err.message),
	});

	const handleSave = () => {
		const amount = Number(value);
		if (Number.isNaN(amount) || amount < 0) {
			toast.error("Enter a valid fee amount");
			return;
		}
		updateStudent.mutate({ id: studentId, fee: amount });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-xs">
				<DialogHeader>
					<DialogTitle>Set Monthly Fee</DialogTitle>
					<DialogDescription>
						Update the monthly fee for{" "}
						<span className="font-medium text-foreground">{studentName}</span>
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-1">
					<div className="relative">
						<BadgeDollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
						<Input
							type="number"
							min={0}
							placeholder="e.g. 5000"
							value={value}
							onChange={(e) => setValue(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleSave();
								if (e.key === "Escape") onOpenChange(false);
							}}
							autoFocus
							className="pl-9"
						/>
					</div>
				</div>
				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={updateStudent.isPending}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						disabled={updateStudent.isPending}
						className="bg-emerald-600 hover:bg-emerald-700 text-white"
					>
						{updateStudent.isPending ? "Saving…" : "Save Fee"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function SetFeeForAllDialog({
	open,
	onOpenChange,
	onSaved,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}) {
	const [value, setValue] = useState("");

	useEffect(() => {
		if (open) setValue("");
	}, [open]);

	const setFeeForAll = trpc.organization.student.setFeeForAll.useMutation({
		onSuccess: (res) => {
			toast.success(
				`Fee updated for ${res.updatedCount} student${res.updatedCount !== 1 ? "s" : ""}`,
			);
			onOpenChange(false);
			onSaved();
		},
		onError: (err) => toast.error(err.message),
	});

	const handleSave = () => {
		const amount = Number(value);
		if (Number.isNaN(amount) || amount < 0) {
			toast.error("Enter a valid fee amount");
			return;
		}
		setFeeForAll.mutate({ fee: amount });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-xs">
				<DialogHeader>
					<DialogTitle>Set Fee for All Students</DialogTitle>
					<DialogDescription>
						This will set the same monthly fee for every student in your hostel.
					</DialogDescription>
				</DialogHeader>
				<div className="py-1">
					<div className="relative">
						<BadgeDollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
						<Input
							type="number"
							min={0}
							placeholder="e.g. 5000"
							value={value}
							onChange={(e) => setValue(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleSave();
								if (e.key === "Escape") onOpenChange(false);
							}}
							autoFocus
							className="pl-9"
						/>
					</div>
					<p className="mt-2 text-xs text-muted-foreground">
						Individual fees can still be changed per student using the pencil
						icon.
					</p>
				</div>
				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={setFeeForAll.isPending}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						disabled={setFeeForAll.isPending}
						className="bg-emerald-600 hover:bg-emerald-700 text-white"
					>
						<Users className="mr-2 h-4 w-4" />
						{setFeeForAll.isPending ? "Applying…" : "Apply to All"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function EditPaymentDialog({
	payment,
	open,
	onOpenChange,
	onSaved,
}: {
	payment: {
		id: string;
		amount: number;
		notes?: string | null;
		studentName: string;
		paidAt: Date | string;
	} | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}) {
	const [amount, setAmount] = useState("");
	const [notes, setNotes] = useState("");
	const [paidAt, setPaidAt] = useState<Date | string | null>(null);

	useEffect(() => {
		if (open && payment) {
			setAmount(String(payment.amount));
			setNotes(payment.notes ?? "");
			setPaidAt(payment.paidAt);
		}
	}, [open, payment]);

	const updatePayment = trpc.organization.feePayment.updatePayment.useMutation({
		onSuccess: () => {
			toast.success("Payment updated");
			onOpenChange(false);
			onSaved();
		},
		onError: (err) => toast.error(err.message),
	});

	const handleSave = () => {
		if (!payment) return;
		const amt = Number(amount);
		if (Number.isNaN(amt) || amt < 1) {
			toast.error("Enter a valid amount");
			return;
		}
		updatePayment.mutate({ id: payment.id, amount: amt, notes: notes || null });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>Edit Payment</DialogTitle>
					<DialogDescription>
						Update payment details for{" "}
						<span className="font-medium text-foreground">
							{payment?.studentName}
						</span>
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-1">
					{paidAt && (
						<div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
							<CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
							Payment recorded on{" "}
							<span className="font-medium text-foreground">
								{new Date(paidAt).toLocaleDateString("en-PK", {
									day: "2-digit",
									month: "long",
									year: "numeric",
								})}
							</span>
						</div>
					)}
					<div>
						<label
							htmlFor="fee-amount"
							className="mb-1.5 block text-sm font-medium"
						>
							Amount Paid (Rs)
						</label>
						<div className="relative">
							<BadgeDollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
							<Input
								id="fee-amount"
								type="number"
								min={1}
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								onKeyDown={(e) => e.key === "Escape" && onOpenChange(false)}
								autoFocus
								className="pl-9"
							/>
						</div>
					</div>
					<div>
						<label
							htmlFor="fee-notes"
							className="mb-1.5 block text-sm font-medium"
						>
							Notes{" "}
							<span className="font-normal text-muted-foreground">
								(optional)
							</span>
						</label>
						<div className="relative">
							<FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
							<Textarea
								id="fee-notes"
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
						disabled={updatePayment.isPending}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						disabled={updatePayment.isPending}
						className="bg-emerald-600 hover:bg-emerald-700 text-white"
					>
						{updatePayment.isPending ? "Saving…" : "Save Changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function FeePayments() {
	const { month, year, setMonth, setYear } = useSelectedMonth();
	const [search, setSearch] = useState("");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [preselectedId, setPreselectedId] = useState<string | null>(null);
	const [feeTarget, setFeeTarget] = useState<{
		id: string;
		name: string;
		fee: number;
	} | null>(null);
	const [feeDialogOpen, setFeeDialogOpen] = useState(false);
	const [feeForAllOpen, setFeeForAllOpen] = useState(false);
	const [editPayment, setEditPayment] = useState<{
		id: string;
		amount: number;
		notes?: string | null;
		studentName: string;
		paidAt: Date | string;
	} | null>(null);
	const [editPaymentOpen, setEditPaymentOpen] = useState(false);

	const utils = trpc.useUtils();

	const { data: students = [], isLoading } =
		trpc.organization.feePayment.listByMonth.useQuery(
			{ month, year },
			{ staleTime: 0 },
		);

	const deletePayment = trpc.organization.feePayment.deletePayment.useMutation({
		onSuccess: () => {
			utils.organization.feePayment.listByMonth.invalidate({ month, year });
			toast.success("Payment removed");
		},
		onError: (err) => toast.error(err.message),
	});

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

	const filtered = students.filter((s) => {
		const q = search.toLowerCase();
		return (
			s.name.toLowerCase().includes(q) ||
			s.room.name.toLowerCase().includes(q) ||
			s.fatherName.toLowerCase().includes(q)
		);
	});

	const paidCount = students.filter((s) => s.payment !== null).length;
	const unpaidCount = students.length - paidCount;

	const openForStudent = (id: string) => {
		setPreselectedId(id);
		setDialogOpen(true);
	};

	const openBlank = () => {
		setPreselectedId(null);
		setDialogOpen(true);
	};

	const openSetFee = (student: { id: string; name: string; fee: number }) => {
		setFeeTarget(student);
		setFeeDialogOpen(true);
	};

	const openEditPayment = (student: {
		id: string;
		name: string;
		payment: { id: string; amount: number; createdAt: Date | string };
	}) => {
		setEditPayment({
			id: student.payment.id,
			amount: student.payment.amount,
			studentName: student.name,
			paidAt: student.payment.createdAt,
		});
		setEditPaymentOpen(true);
	};

	const invalidate = () =>
		utils.organization.feePayment.listByMonth.invalidate({ month, year });

	return (
		<div className="space-y-6">
			<SetFeeForAllDialog
				open={feeForAllOpen}
				onOpenChange={setFeeForAllOpen}
				onSaved={invalidate}
			/>
			<EditPaymentDialog
				payment={editPayment}
				open={editPaymentOpen}
				onOpenChange={setEditPaymentOpen}
				onSaved={invalidate}
			/>
			{feeTarget && (
				<SetFeeDialog
					studentId={feeTarget.id}
					studentName={feeTarget.name}
					currentFee={feeTarget.fee}
					open={feeDialogOpen}
					onOpenChange={setFeeDialogOpen}
					onSaved={invalidate}
				/>
			)}
			<RecordPaymentDialog
				students={students}
				preselectedId={preselectedId}
				month={month}
				year={year}
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				onSuccess={invalidate}
			/>

			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h2 className="text-lg font-semibold">Monthly Fee Tracker</h2>
					<p className="text-sm text-muted-foreground">
						{students.length} students &mdash;{" "}
						<span className="text-emerald-600 font-medium">
							{paidCount} paid
						</span>
						{", "}
						<span className="text-rose-500 font-medium">
							{unpaidCount} unpaid
						</span>
					</p>
				</div>

				<div className="flex items-center gap-3">
					{/* Month navigator */}
					<div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-2 py-1.5">
						<button
							type="button"
							onClick={prevMonth}
							className="rounded p-0.5 hover:bg-muted transition-colors"
						>
							<ChevronLeft className="h-4 w-4 text-muted-foreground" />
						</button>
						<span className="min-w-30 text-center text-sm font-semibold text-foreground">
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

					{/* Set fee for all */}
					<Button
						variant="outline"
						onClick={() => setFeeForAllOpen(true)}
						disabled={students.length === 0}
						className="gap-1.5"
					>
						<Settings2 className="h-4 w-4" />
						Set Fee for All
					</Button>

					{/* Record payment button */}
					<Button
						onClick={openBlank}
						disabled={students.filter((s) => s.payment === null).length === 0}
						className="gap-1.5"
					>
						<Plus className="h-4 w-4" />
						Record Payment
					</Button>
				</div>
			</div>

			{/* Search */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Search by student name, father name, or room…"
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
						<span className="sr-only">Clear</span>
					</button>
				)}
			</div>

			{/* Table */}
			{isLoading ? (
				<div className="space-y-2">
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton key={i} className="h-16 rounded-xl" />
					))}
				</div>
			) : students.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
					<User className="mb-3 h-8 w-8 text-muted-foreground/40" />
					<p className="text-sm font-medium text-muted-foreground">
						No students found
					</p>
					<p className="mt-1 text-xs text-muted-foreground">
						Add students first from the Rooms page.
					</p>
				</div>
			) : filtered.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
					<Search className="mb-3 h-8 w-8 text-muted-foreground/40" />
					<p className="text-sm font-medium text-muted-foreground">
						No students match "{search}"
					</p>
				</div>
			) : (
				<div className="overflow-hidden rounded-xl border border-border">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border bg-muted/40">
								<th className="px-4 py-3 text-left font-medium text-muted-foreground">
									Student
								</th>
								<th className="px-4 py-3 text-center font-medium text-muted-foreground">
									Room
								</th>
								<th className="px-4 py-3 text-right font-medium text-muted-foreground">
									Monthly Fee
								</th>
								<th className="px-4 py-3 text-right font-medium text-muted-foreground">
									Paid
								</th>
								<th className="px-4 py-3 text-center font-medium text-muted-foreground">
									Payment Date
								</th>
								<th className="px-4 py-3 text-right font-medium text-muted-foreground">
									Remaining
								</th>
								<th className="px-4 py-3 text-center font-medium text-muted-foreground">
									Status
								</th>
								<th className="px-4 py-3 text-right font-medium text-muted-foreground">
									Action
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{filtered.map((student) => {
								const isPaid = student.payment !== null;
								const paidAmount = student.payment?.amount ?? 0;
								const remaining = Math.max(0, student.fee - paidAmount);

								return (
									<tr
										key={student.id}
										className="bg-card transition-colors hover:bg-muted/20"
									>
										{/* Student */}
										<td className="px-4 py-3">
											<div className="flex items-center gap-3">
												<Avatar className="h-8 w-8 shrink-0 rounded-lg border border-border/60">
													<AvatarImage
														src={student.picture ?? undefined}
														alt={student.name}
														className="object-cover"
													/>
													<AvatarFallback className="rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
														{initials(student.name)}
													</AvatarFallback>
												</Avatar>
												<div className="min-w-0">
													<p className="truncate font-semibold text-foreground">
														{student.name}
													</p>
													<p className="truncate text-[0.7rem] text-muted-foreground">
														S/O {student.fatherName}
													</p>
												</div>
											</div>
										</td>

										{/* Room */}
										<td className="px-4 py-3 text-center">
											<Badge variant="secondary" className="font-mono text-xs">
												{student.room.name}
											</Badge>
										</td>

										{/* Monthly Fee */}
										<td className="px-4 py-3 text-right">
											<div className="flex items-center justify-end gap-1.5">
												{student.fee > 0 ? (
													<span className="font-semibold text-foreground">
														Rs {student.fee.toLocaleString()}
													</span>
												) : (
													<span className="text-xs text-muted-foreground">
														Not set
													</span>
												)}
												<button
													type="button"
													onClick={() =>
														openSetFee({
															id: student.id,
															name: student.name,
															fee: student.fee,
														})
													}
													className="rounded p-1 hover:bg-muted/60 transition-colors"
													title="Set monthly fee"
												>
													<Pencil className="h-3 w-3 text-muted-foreground" />
												</button>
											</div>
										</td>

										{/* Paid amount */}
										<td className="px-4 py-3 text-right">
											{isPaid ? (
												<span className="font-semibold text-emerald-600 dark:text-emerald-400">
													Rs {paidAmount.toLocaleString()}
												</span>
											) : (
												<span className="text-muted-foreground">—</span>
											)}
										</td>

										{/* Payment Date */}
										<td className="px-4 py-3 text-center">
											{isPaid && student.payment?.createdAt ? (
												<span className="text-xs text-muted-foreground">
													{new Date(
														student.payment.createdAt,
													).toLocaleDateString("en-PK", {
														day: "2-digit",
														month: "short",
														year: "numeric",
													})}
												</span>
											) : (
												<span className="text-muted-foreground">—</span>
											)}
										</td>

										{/* Remaining */}
										<td className="px-4 py-3 text-right">
											{student.fee === 0 ? (
												<span className="text-muted-foreground text-xs">
													No fee set
												</span>
											) : remaining === 0 && isPaid ? (
												<span className="font-medium text-emerald-600 dark:text-emerald-400">
													Rs 0
												</span>
											) : (
												<span className="font-semibold text-rose-600 dark:text-rose-400">
													Rs {remaining.toLocaleString()}
												</span>
											)}
										</td>

										{/* Status */}
										<td className="px-4 py-3 text-center">
											{isPaid ? (
												<Badge className="bg-emerald-100 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40">
													<CheckCircle2 className="mr-1 h-3 w-3" />
													Paid
												</Badge>
											) : (
												<Badge className="bg-rose-100 text-rose-600 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40">
													Unpaid
												</Badge>
											)}
										</td>

										{/* Action */}
										<td className="px-4 py-3 text-right">
											{isPaid ? (
												<div className="flex items-center justify-end gap-1">
													<Button
														variant="ghost"
														size="sm"
														onClick={() =>
															openEditPayment({
																id: student.id,
																name: student.name,
																payment: student.payment!,
															})
														}
														className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
													>
														<Pencil className="h-3 w-3" />
														Edit
													</Button>
													<Button
														variant="ghost"
														size="sm"
														disabled={deletePayment.isPending}
														onClick={() =>
															deletePayment.mutate({ id: student.payment!.id })
														}
														className="h-7 gap-1 text-xs text-muted-foreground hover:text-rose-600"
													>
														<Undo2 className="h-3 w-3" />
														Undo
													</Button>
												</div>
											) : (
												<Button
													size="sm"
													disabled={student.fee === 0}
													onClick={() => openForStudent(student.id)}
													className="h-7 gap-1 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
													title={
														student.fee === 0
															? "Set a monthly fee first"
															: undefined
													}
												>
													<CheckCircle2 className="h-3 w-3" />
													Mark Paid
												</Button>
											)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
