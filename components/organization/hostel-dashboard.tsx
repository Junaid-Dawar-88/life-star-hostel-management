"use client";

import {
	BadgeDollarSign,
	BedDouble,
	BedSingle,
	Clock,
	DoorOpen,
	TrendingDown,
	Users,
} from "lucide-react";
import type * as React from "react";
import { type ActivityEntry, useHostel } from "@/lib/hostel-context";

const seatCount: Record<string, number> = {
	"1_seater": 1,
	"2_seater": 2,
	"3_seater": 3,
	"4_seater": 4,
};

function formatTime(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMin = Math.floor(diffMs / 60000);
	if (diffMin < 1) return "just now";
	if (diffMin < 60) return `${diffMin}m ago`;
	const diffHr = Math.floor(diffMin / 60);
	if (diffHr < 24) return `${diffHr}h ago`;
	return date.toLocaleDateString();
}

const activityColors: Record<ActivityEntry["type"], string> = {
	room_added: "bg-blue-500",
	room_updated: "bg-amber-500",
	room_deleted: "bg-red-500",
	student_added: "bg-emerald-500",
	student_updated: "bg-violet-500",
	student_deleted: "bg-rose-500",
};

type StatCardProps = {
	title: string;
	value: string | number;
	icon: React.ReactNode;
	sub?: string;
	accent: string;
};

function StatCard({ title, value, icon, sub, accent }: StatCardProps) {
	return (
		<div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
			<div className={`absolute inset-x-0 top-0 h-0.5 ${accent}`} />
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="text-xs font-medium text-muted-foreground">{title}</p>
					<p className="mt-1.5 text-3xl font-bold tracking-tight text-foreground">
						{value}
					</p>
					{sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
				</div>
				<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/60">
					{icon}
				</div>
			</div>
		</div>
	);
}

export function HostelDashboard() {
	const { rooms, activity } = useHostel();

	const totalRooms = rooms.length;
	const allStudents = rooms.flatMap((r) => r.students);
	const totalStudents = allStudents.length;

	const totalSeats = rooms.reduce(
		(sum, r) => sum + (seatCount[r.seatType] ?? 0),
		0,
	);
	const occupiedSeats = totalStudents;
	const vacantSeats = totalSeats - occupiedSeats;

	const totalFee = allStudents.reduce((sum, s) => sum + s.fee, 0);
	const remainingFee = allStudents.reduce((sum, s) => sum + s.remainingFee, 0);

	return (
		<div className="space-y-8">
			{/* Stats grid */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
				<StatCard
					title="Total Rooms"
					value={totalRooms}
					icon={<BedDouble className="h-5 w-5 text-blue-500" />}
					sub={`${totalSeats} total seats`}
					accent="bg-linear-to-r from-blue-400 to-indigo-400"
				/>
				<StatCard
					title="Total Students"
					value={totalStudents}
					icon={<Users className="h-5 w-5 text-violet-500" />}
					sub={`across ${totalRooms} rooms`}
					accent="bg-linear-to-r from-violet-400 to-purple-400"
				/>
				<StatCard
					title="Vacant Seats"
					value={vacantSeats}
					icon={<DoorOpen className="h-5 w-5 text-amber-500" />}
					sub={`${occupiedSeats} occupied`}
					accent="bg-linear-to-r from-amber-400 to-orange-400"
				/>
				<StatCard
					title="Total Fee"
					value={`Rs ${totalFee.toLocaleString()}`}
					icon={<BadgeDollarSign className="h-5 w-5 text-emerald-500" />}
					sub="cumulative student fees"
					accent="bg-linear-to-r from-emerald-400 to-teal-400"
				/>
				<StatCard
					title="Remaining Fee"
					value={`Rs ${remainingFee.toLocaleString()}`}
					icon={<TrendingDown className="h-5 w-5 text-rose-500" />}
					sub={remainingFee === 0 ? "all fees collected" : "pending collection"}
					accent="bg-linear-to-r from-rose-400 to-pink-400"
				/>
			</div>

			{/* Recent activity */}
			<div className="rounded-2xl border border-border/60 bg-card shadow-sm">
				<div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">
					<Clock className="h-4 w-4 text-muted-foreground" />
					<h2 className="text-sm font-semibold">Recent Activity</h2>
					{activity.length > 0 && (
						<span className="ml-auto text-xs text-muted-foreground">
							{activity.length} event{activity.length !== 1 ? "s" : ""}
						</span>
					)}
				</div>

				{activity.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16 text-center">
						<BedSingle className="mb-3 h-8 w-8 text-muted-foreground/30" />
						<p className="text-sm font-medium text-muted-foreground">
							No activity yet
						</p>
						<p className="mt-1 text-xs text-muted-foreground">
							Add rooms or students to see recent updates here.
						</p>
					</div>
				) : (
					<ul className="divide-y divide-border/40">
						{activity.map((entry, i) => (
							<li key={entry.id} className="flex items-start gap-3 px-5 py-3.5">
								<div className="relative flex flex-col items-center">
									<span
										className={`mt-1 h-2 w-2 shrink-0 rounded-full ${activityColors[entry.type]}`}
									/>
									{i < activity.length - 1 && (
										<span className="absolute top-3 h-full w-px bg-border/40" />
									)}
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm text-foreground leading-snug">
										{entry.message}
									</p>
								</div>
								<span className="shrink-0 text-xs text-muted-foreground tabular-nums">
									{formatTime(entry.timestamp)}
								</span>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}
