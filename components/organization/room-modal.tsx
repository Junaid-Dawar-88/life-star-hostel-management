"use client";

import NiceModal, { type NiceModalHocProps } from "@ebay/nice-modal-react";
import { toast } from "sonner";
import { z } from "zod";
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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

const roomSchema = z.object({
	name: z.string().min(1, "Room name is required"),
	seatType: z.enum(["1_seater", "2_seater", "3_seater", "4_seater"], {
		required_error: "Seat type is required",
	}),
	floor: z.enum(["1", "2", "3", "4", "5", "6", "7", "8"], {
		required_error: "Floor is required",
	}),
});

type RoomFormValues = z.infer<typeof roomSchema>;

const seatOptions = [
	{ value: "1_seater", label: "1 Seater" },
	{ value: "2_seater", label: "2 Seater" },
	{ value: "3_seater", label: "3 Seater" },
	{ value: "4_seater", label: "4 Seater" },
] as const;

const floorOptions = [
	{ value: "1", label: "Floor 1" },
	{ value: "2", label: "Floor 2" },
	{ value: "3", label: "Floor 3" },
	{ value: "4", label: "Floor 4" },
	{ value: "5", label: "Floor 5" },
	{ value: "6", label: "Floor 6" },
	{ value: "7", label: "Floor 7" },
	{ value: "8", label: "Floor 8" },
] as const;

export type RoomData = {
	id: string;
	name: string;
	seatType: RoomFormValues["seatType"];
	floor: RoomFormValues["floor"];
};

export type RoomModalProps = NiceModalHocProps & {
	room?: RoomData;
	onSuccess?: (data: RoomData) => void;
};

export const RoomModal = NiceModal.create<RoomModalProps>(
	({ room, onSuccess }) => {
		const modal = useEnhancedModal();
		const isEditing = !!room;

		const form = useZodForm({
			schema: roomSchema,
			defaultValues: isEditing
				? {
						name: room.name,
						seatType: room.seatType,
						floor: room.floor,
					}
				: {
						name: "",
						seatType: undefined,
						floor: undefined,
					},
		});

		const onSubmit = form.handleSubmit((data: RoomFormValues) => {
			const result: RoomData = {
				id: room?.id ?? crypto.randomUUID(),
				...data,
			};
			onSuccess?.(result);
			toast.success(
				isEditing ? "Room updated successfully" : "Room created successfully",
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
						<SheetTitle>{isEditing ? "Edit Room" : "Create Room"}</SheetTitle>
						<SheetDescription className="sr-only">
							{isEditing
								? "Update the room information below."
								: "Fill in the details to create a new room."}
						</SheetDescription>
					</SheetHeader>

					<Form {...form}>
						<form
							onSubmit={onSubmit}
							className="flex flex-1 flex-col overflow-hidden"
						>
							<ScrollArea className="flex-1">
								<div className="space-y-4 px-6 py-4">
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem asChild>
												<Field>
													<FormLabel>Room Name</FormLabel>
													<FormControl>
														<Input
															placeholder="e.g. Room 101"
															autoComplete="off"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</Field>
											</FormItem>
										)}
									/>

									<div className="grid grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="seatType"
											render={({ field }) => (
												<FormItem asChild>
													<Field>
														<FormLabel>Seat Type</FormLabel>
														<Select
															onValueChange={field.onChange}
															defaultValue={field.value}
														>
															<FormControl>
																<SelectTrigger className="w-full">
																	<SelectValue placeholder="Select seats" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{seatOptions.map((opt) => (
																	<SelectItem key={opt.value} value={opt.value}>
																		{opt.label}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
														<FormMessage />
													</Field>
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="floor"
											render={({ field }) => (
												<FormItem asChild>
													<Field>
														<FormLabel>Floor</FormLabel>
														<Select
															onValueChange={field.onChange}
															defaultValue={field.value}
														>
															<FormControl>
																<SelectTrigger className="w-full">
																	<SelectValue placeholder="Select floor" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{floorOptions.map((opt) => (
																	<SelectItem key={opt.value} value={opt.value}>
																		{opt.label}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
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
									{isEditing ? "Update Room" : "Create Room"}
								</Button>
							</SheetFooter>
						</form>
					</Form>
				</SheetContent>
			</Sheet>
		);
	},
);
