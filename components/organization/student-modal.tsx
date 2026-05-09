"use client";

import NiceModal, { type NiceModalHocProps } from "@ebay/nice-modal-react";
import { Camera, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod/v4";
import { Button } from "@/components/ui/button";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useEnhancedModal } from "@/hooks/use-enhanced-modal";
import { useZodForm } from "@/hooks/use-zod-form";

const studentSchema = z.object({
	name: z.string().min(1, "Student name is required"),
	fatherName: z.string().min(1, "Father name is required"),
	nic: z
		.string()
		.min(13, "NIC must be 13 digits")
		.max(15, "NIC must be 13 digits")
		.regex(/^\d{13}$|^\d{5}-\d{7}-\d{1}$/, "Invalid NIC format"),
	phone: z
		.string()
		.min(10, "Phone number is required")
		.regex(/^[0-9+\-\s()]+$/, "Invalid phone number"),
	guardianPhone: z
		.string()
		.min(10, "Guardian phone is required")
		.regex(/^[0-9+\-\s()]+$/, "Invalid phone number"),
	address: z.string().min(1, "Address is required"),
	fee: z.number().min(0, "Fee must be 0 or more"),
	remainingFee: z.number().min(0, "Remaining fee must be 0 or more"),
	picture: z.string().optional(),
});

export type StudentFormValues = z.infer<typeof studentSchema>;

export type StudentData = StudentFormValues & { id: string };

export type StudentModalProps = NiceModalHocProps & {
	roomId?: string;
	student?: StudentData;
	onSuccess?: (data: StudentData) => void;
};

export const StudentModal = NiceModal.create<StudentModalProps>(
	({ student, onSuccess }) => {
		const modal = useEnhancedModal();
		const isEditing = !!student;
		const fileInputRef = useRef<HTMLInputElement>(null);
		const [preview, setPreview] = useState<string | undefined>(
			student?.picture,
		);

		const form = useZodForm({
			schema: studentSchema,
			defaultValues: isEditing
				? {
						name: student.name,
						fatherName: student.fatherName,
						nic: student.nic,
						phone: student.phone,
						guardianPhone: student.guardianPhone,
						address: student.address,
						fee: student.fee,
						remainingFee: student.remainingFee,
						picture: student.picture,
					}
				: {
						name: "",
						fatherName: "",
						nic: "",
						phone: "",
						guardianPhone: "",
						address: "",
						fee: 0,
						remainingFee: 0,
						picture: undefined,
					},
		});

		const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64 = reader.result as string;
				setPreview(base64);
				form.setValue("picture", base64);
			};
			reader.readAsDataURL(file);
		};

		const onSubmit = form.handleSubmit((data: StudentFormValues) => {
			const result: StudentData = {
				id: student?.id ?? crypto.randomUUID(),
				...data,
				picture: preview,
			};
			onSuccess?.(result);
			toast.success(
				isEditing
					? "Student updated successfully"
					: "Student added successfully",
			);
			modal.handleClose();
		});

		return (
			<Sheet
				open={modal.visible}
				onOpenChange={(open) => !open && modal.handleClose()}
			>
				<SheetContent
					className="sm:max-w-lg"
					onAnimationEndCapture={modal.handleAnimationEndCapture}
				>
					<SheetHeader>
						<SheetTitle>
							{isEditing ? "Edit Student" : "Add Student"}
						</SheetTitle>
						<SheetDescription className="sr-only">
							{isEditing
								? "Update student information."
								: "Fill in the student details to assign to this room."}
						</SheetDescription>
					</SheetHeader>

					<Form {...form}>
						<form
							onSubmit={onSubmit}
							className="flex flex-1 flex-col overflow-hidden"
						>
							<ScrollArea className="flex-1">
								<div className="space-y-4 px-6 py-4">
									{/* Picture upload */}
									<div className="flex flex-col items-center gap-2">
										<input
											ref={fileInputRef}
											type="file"
											accept="image/*"
											className="hidden"
											onChange={handleImageChange}
										/>
										<button
											type="button"
											onClick={() => fileInputRef.current?.click()}
											className="group relative h-24 w-24 overflow-hidden rounded-full border-2 border-dashed border-border bg-muted transition-colors hover:border-primary hover:bg-muted/80"
										>
											{preview ? (
												<img
													src={preview}
													alt="Student"
													className="h-full w-full object-cover"
												/>
											) : (
												<div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
													<Camera className="h-6 w-6" />
													<span className="text-[0.65rem] font-medium">
														Upload
													</span>
												</div>
											)}
											<div className="absolute inset-0 hidden items-center justify-center bg-black/40 group-hover:flex">
												<Camera className="h-5 w-5 text-white" />
											</div>
										</button>
										{preview && (
											<button
												type="button"
												onClick={() => {
													setPreview(undefined);
													form.setValue("picture", undefined);
												}}
												className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
											>
												<X className="h-3 w-3" />
												Remove photo
											</button>
										)}
										<p className="text-xs text-muted-foreground">
											Student photo (optional)
										</p>
									</div>

									{/* Name + Father Name */}
									<div className="grid grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="name"
											render={({ field }) => (
												<FormItem asChild>
													<Field>
														<FormLabel>Student Name</FormLabel>
														<FormControl>
															<Input
																placeholder="Ali Hassan"
																autoComplete="off"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</Field>
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="fatherName"
											render={({ field }) => (
												<FormItem asChild>
													<Field>
														<FormLabel>Father Name</FormLabel>
														<FormControl>
															<Input
																placeholder="Muhammad Hassan"
																autoComplete="off"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</Field>
												</FormItem>
											)}
										/>
									</div>

									{/* NIC */}
									<FormField
										control={form.control}
										name="nic"
										render={({ field }) => (
											<FormItem asChild>
												<Field>
													<FormLabel>NIC Number</FormLabel>
													<FormControl>
														<Input
															placeholder="3520112345671"
															autoComplete="off"
															maxLength={15}
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</Field>
											</FormItem>
										)}
									/>

									{/* Phone + Guardian Phone */}
									<div className="grid grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="phone"
											render={({ field }) => (
												<FormItem asChild>
													<Field>
														<FormLabel>Phone Number</FormLabel>
														<FormControl>
															<Input
																placeholder="0300 1234567"
																autoComplete="off"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</Field>
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="guardianPhone"
											render={({ field }) => (
												<FormItem asChild>
													<Field>
														<FormLabel>Guardian Phone</FormLabel>
														<FormControl>
															<Input
																placeholder="0301 7654321"
																autoComplete="off"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</Field>
												</FormItem>
											)}
										/>
									</div>

									{/* Address */}
									<FormField
										control={form.control}
										name="address"
										render={({ field }) => (
											<FormItem asChild>
												<Field>
													<FormLabel>Address</FormLabel>
													<FormControl>
														<Input
															placeholder="House 12, Street 4, Lahore"
															autoComplete="off"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</Field>
											</FormItem>
										)}
									/>

									{/* Fee + Remaining Fee */}
									<div className="grid grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="fee"
											render={({ field }) => (
												<FormItem asChild>
													<Field>
														<FormLabel>Total Fee</FormLabel>
														<FormControl>
															<Input
																type="number"
																min={0}
																placeholder="5000"
																autoComplete="off"
																value={field.value as number}
																onChange={(e) =>
																	field.onChange(e.target.valueAsNumber)
																}
																onBlur={field.onBlur}
																name={field.name}
																ref={field.ref}
															/>
														</FormControl>
														<FormMessage />
													</Field>
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="remainingFee"
											render={({ field }) => (
												<FormItem asChild>
													<Field>
														<FormLabel>Remaining Fee</FormLabel>
														<FormControl>
															<Input
																type="number"
																min={0}
																placeholder="0"
																autoComplete="off"
																value={field.value as number}
																onChange={(e) =>
																	field.onChange(e.target.valueAsNumber)
																}
																onBlur={field.onBlur}
																name={field.name}
																ref={field.ref}
															/>
														</FormControl>
														<FormMessage />
													</Field>
												</FormItem>
											)}
										/>
									</div>
								</div>
							</ScrollArea>

							<SheetFooter className="flex-row justify-end gap-2 border-t">
								<Button
									type="button"
									variant="outline"
									onClick={modal.handleClose}
								>
									Cancel
								</Button>
								<Button type="submit">
									{isEditing ? "Update Student" : "Add Student"}
								</Button>
							</SheetFooter>
						</form>
					</Form>
				</SheetContent>
			</Sheet>
		);
	},
);
