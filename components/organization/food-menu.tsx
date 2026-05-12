"use client";

import { Clock, Pencil, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod/v4";
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
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useZodForm } from "@/hooks/use-zod-form";
import type { MealType } from "@/schemas/organization-food-menu-schemas";
import { trpc } from "@/trpc/client";

const DAYS = [
	{ label: "Mon", fullLabel: "Monday", value: 0 },
	{ label: "Tue", fullLabel: "Tuesday", value: 1 },
	{ label: "Wed", fullLabel: "Wednesday", value: 2 },
	{ label: "Thu", fullLabel: "Thursday", value: 3 },
	{ label: "Fri", fullLabel: "Friday", value: 4 },
	{ label: "Sat", fullLabel: "Saturday", value: 5 },
	{ label: "Sun", fullLabel: "Sunday", value: 6 },
] as const;

const MEAL_CONFIG: Record<
	MealType,
	{ label: string; emoji: string; defaultStart: string; defaultEnd: string }
> = {
	breakfast: {
		label: "Breakfast",
		emoji: "🌅",
		defaultStart: "07:00",
		defaultEnd: "09:00",
	},
	lunch: {
		label: "Lunch",
		emoji: "☀️",
		defaultStart: "12:00",
		defaultEnd: "14:00",
	},
	dinner: {
		label: "Dinner",
		emoji: "🌙",
		defaultStart: "19:00",
		defaultEnd: "21:00",
	},
};

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];

const editMenuSchema = z.object({
	items: z.string().trim().min(1, "Menu items are required").max(2000),
	startTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format"),
	endTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format"),
});

type EditMenuValues = z.infer<typeof editMenuSchema>;

type FoodMenuRecord = {
	id: string;
	dayOfWeek: number;
	mealType: string;
	items: string;
	startTime: string;
	endTime: string;
};

function EditMenuDialog({
	dayOfWeek,
	dayLabel,
	mealType,
	existing,
	open,
	onOpenChange,
	onSuccess,
}: {
	dayOfWeek: number;
	dayLabel: string;
	mealType: MealType;
	existing: FoodMenuRecord | null | undefined;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}) {
	const config = MEAL_CONFIG[mealType];
	const form = useZodForm({
		schema: editMenuSchema,
		values: {
			items: existing?.items ?? "",
			startTime: existing?.startTime ?? config.defaultStart,
			endTime: existing?.endTime ?? config.defaultEnd,
		},
	});

	const upsert = trpc.organization.foodMenu.upsert.useMutation({
		onSuccess: () => {
			toast.success(`${dayLabel} ${config.label} menu updated`);
			onSuccess();
			onOpenChange(false);
		},
		onError: (err) => {
			toast.error(err.message);
		},
	});

	function onSubmit(values: EditMenuValues) {
		upsert.mutate({ dayOfWeek, mealType, ...values });
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{config.emoji} {dayLabel} — {config.label}
					</DialogTitle>
					<DialogDescription>
						Set food items and serving time for {config.label.toLowerCase()} on{" "}
						{dayLabel}.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="startTime"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Start Time</FormLabel>
										<FormControl>
											<Input type="time" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="endTime"
								render={({ field }) => (
									<FormItem>
										<FormLabel>End Time</FormLabel>
										<FormControl>
											<Input type="time" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<FormField
							control={form.control}
							name="items"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Menu Items</FormLabel>
									<FormControl>
										<Textarea
											placeholder={"e.g.\nParatha\nEgg\nTea\nYogurt"}
											rows={6}
											{...field}
										/>
									</FormControl>
									<FormMessage />
									<p className="text-muted-foreground text-xs">
										Enter each item on a new line.
									</p>
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={upsert.isPending}>
								{upsert.isPending ? "Saving…" : "Save Menu"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

function MealCard({
	mealType,
	menu,
	onEdit,
}: {
	mealType: MealType;
	menu: FoodMenuRecord | null | undefined;
	onEdit: () => void;
}) {
	const config = MEAL_CONFIG[mealType];
	const items = menu?.items
		? menu.items.split("\n").filter((l) => l.trim().length > 0)
		: [];

	return (
		<div className="rounded-xl border bg-card p-5 flex flex-col gap-4">
			<div className="flex items-start justify-between gap-2">
				<div className="flex items-center gap-2">
					<span className="text-2xl">{config.emoji}</span>
					<div>
						<h3 className="font-semibold text-base leading-tight">
							{config.label}
						</h3>
						{menu ? (
							<div className="flex items-center gap-1 mt-0.5 text-muted-foreground text-xs">
								<Clock className="size-3" />
								<span>
									{menu.startTime} – {menu.endTime}
								</span>
							</div>
						) : (
							<span className="text-muted-foreground text-xs">
								No timing set
							</span>
						)}
					</div>
				</div>
				<Button
					size="sm"
					variant="outline"
					onClick={onEdit}
					className="shrink-0"
				>
					<Pencil className="size-3.5 mr-1" />
					Edit
				</Button>
			</div>

			{items.length > 0 ? (
				<div className="flex flex-wrap gap-1.5">
					{items.map((item) => (
						<Badge
							key={item}
							variant="secondary"
							className="text-xs font-normal"
						>
							{item.trim()}
						</Badge>
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center gap-2 py-6 text-muted-foreground">
					<UtensilsCrossed className="size-8 opacity-30" />
					<p className="text-sm">No menu set yet</p>
				</div>
			)}
		</div>
	);
}

type EditingState = { dayOfWeek: number; mealType: MealType } | null;

function DayPanel({
	dayOfWeek,
	dayLabel,
	menus,
	onEdit,
}: {
	dayOfWeek: number;
	dayLabel: string;
	menus: FoodMenuRecord[];
	onEdit: (state: EditingState) => void;
}) {
	const menuByMeal = (mealType: MealType) =>
		menus.find((m) => m.dayOfWeek === dayOfWeek && m.mealType === mealType) ??
		null;

	return (
		<div className="grid gap-4 sm:grid-cols-3">
			{MEAL_TYPES.map((mealType) => (
				<MealCard
					key={mealType}
					mealType={mealType}
					menu={menuByMeal(mealType)}
					onEdit={() => onEdit({ dayOfWeek, mealType })}
				/>
			))}
		</div>
	);
}

export function FoodMenu() {
	const [editing, setEditing] = useState<EditingState>(null);
	const today = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
	// Convert JS day (0=Sun) to our day (0=Mon): (day + 6) % 7
	const todayIndex = (today + 6) % 7;

	const {
		data: menus,
		isLoading,
		refetch,
	} = trpc.organization.foodMenu.listAll.useQuery();

	const allMenus = (menus as FoodMenuRecord[] | undefined) ?? [];

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-10 w-full rounded-lg" />
				<div className="grid gap-4 sm:grid-cols-3">
					{MEAL_TYPES.map((t) => (
						<Skeleton key={t} className="h-44 rounded-xl" />
					))}
				</div>
			</div>
		);
	}

	const editingMenu = editing
		? (allMenus.find(
				(m) =>
					m.dayOfWeek === editing.dayOfWeek && m.mealType === editing.mealType,
			) ?? null)
		: null;

	const editingDay = editing
		? DAYS.find((d) => d.value === editing.dayOfWeek)
		: null;

	return (
		<>
			<Tabs defaultValue={String(todayIndex)}>
				<TabsList className="grid grid-cols-7 w-full">
					{DAYS.map((day) => (
						<TabsTrigger key={day.value} value={String(day.value)}>
							{day.label}
						</TabsTrigger>
					))}
				</TabsList>

				{DAYS.map((day) => (
					<TabsContent
						key={day.value}
						value={String(day.value)}
						className="mt-4"
					>
						<DayPanel
							dayOfWeek={day.value}
							dayLabel={day.fullLabel}
							menus={allMenus}
							onEdit={setEditing}
						/>
					</TabsContent>
				))}
			</Tabs>

			{editing && editingDay && (
				<EditMenuDialog
					dayOfWeek={editing.dayOfWeek}
					dayLabel={editingDay.fullLabel}
					mealType={editing.mealType}
					existing={editingMenu}
					open={!!editing}
					onOpenChange={(open) => {
						if (!open) setEditing(null);
					}}
					onSuccess={() => refetch()}
				/>
			)}
		</>
	);
}
