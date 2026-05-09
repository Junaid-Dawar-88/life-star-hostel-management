"use client";

import {
	BadgeDollarSign,
	BedDouble,
	DoorOpen,
	TrendingDown,
	UserPlus,
	Users,
} from "lucide-react";
import type * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";

const seatCount: Record<string, number> = {
	"1_seater": 1,
	"2_seater": 2,
	"3_seater": 3,
	"4_seater": 4,
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

function StatCardSkeleton() {
	return (
		<div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
			<div className="absolute inset-x-0 top-0 h-0.5 bg-muted" />
			<div className="flex items-start justify-between gap-3">
				<div className="space-y-2">
					<Skeleton className="h-3 w-24" />
					<Skeleton className="h-8 w-16" />
					<Skeleton className="h-3 w-32" />
				</div>
				<Skeleton className="h-10 w-10 rounded-xl" />
			</div>
		</div>
	);
}

type ActivityEvent =
	| { kind: "room"; roomName: string; floor: number; at: Date }
	| {
			kind: "student";
			studentName: string;
			roomName: string;
			remainingFee: number;
			at: Date;
	  };

function timeAgo(date: Date): string {
	const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
	if (seconds < 60) return "just now";
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 30) return `${days}d ago`;
	return date.toLocaleDateString();
}

function ActivityRow({ event }: { event: ActivityEvent }) {
	if (event.kind === "room") {
		return (
			<div className="flex items-start gap-3">
				<div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40">
					<BedDouble className="h-3.5 w-3.5 text-blue-500" />
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-sm text-foreground">
						Room <span className="font-semibold">{event.roomName}</span> added
						on floor {event.floor}
					</p>
					<p className="text-xs text-muted-foreground">{timeAgo(event.at)}</p>
				</div>
			</div>
		);
	}
	return (
		<div className="flex items-start gap-3">
			<div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950/40">
				<UserPlus className="h-3.5 w-3.5 text-violet-500" />
			</div>
			<div className="flex-1 min-w-0">
				<p className="text-sm text-foreground">
					<span className="font-semibold">{event.studentName}</span> added to{" "}
					<span className="font-semibold">{event.roomName}</span>
				</p>
				{event.remainingFee > 0 && (
					<p className="text-xs text-rose-500">
						Rs {event.remainingFee.toLocaleString()} pending
					</p>
				)}
				<p className="text-xs text-muted-foreground">{timeAgo(event.at)}</p>
			</div>
		</div>
	);
}

function ActivityFeedSkeleton() {
	return (
		<div className="space-y-4">
			{Array.from({ length: 4 }).map((_, i) => (
				<div key={i} className="flex items-start gap-3">
					<Skeleton className="mt-0.5 h-7 w-7 shrink-0 rounded-lg" />
					<div className="flex-1 space-y-1.5">
						<Skeleton className="h-3.5 w-3/4" />
						<Skeleton className="h-3 w-1/4" />
					</div>
				</div>
			))}
		</div>
	);
}

export function HostelDashboard() {
	const { data: rooms = [], isLoading } = trpc.organization.room.list.useQuery(
		{},
	);

	const allStudents = rooms.flatMap((r) => r.students);
	const totalRooms = rooms.length;
	const totalStudents = allStudents.length;
	const totalSeats = rooms.reduce(
		(sum, r) => sum + (seatCount[r.seatType] ?? 0),
		0,
	);
	const vacantSeats = totalSeats - totalStudents;
	const totalFee = allStudents.reduce((sum, s) => sum + s.fee, 0);
	const remainingFee = allStudents.reduce((sum, s) => sum + s.remainingFee, 0);

	const activityFeed: ActivityEvent[] = [
		...rooms.map(
			(r): ActivityEvent => ({
				kind: "room",
				roomName: r.name,
				floor: r.floor,
				at: new Date(r.createdAt),
			}),
		),
		...rooms.flatMap((r) =>
			r.students.map(
				(s): ActivityEvent => ({
					kind: "student",
					studentName: s.name,
					roomName: r.name,
					remainingFee: s.remainingFee,
					at: new Date(s.createdAt),
				}),
			),
		),
	]
		.sort((a, b) => b.at.getTime() - a.at.getTime())
		.slice(0, 10);

	return (
		<div className="space-y-8">
			{/* Stats grid */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
				{isLoading ? (
					Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
				) : (
					<>
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
							sub={`${totalStudents} occupied`}
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
							sub={
								remainingFee === 0 ? "all fees collected" : "pending collection"
							}
							accent="bg-linear-to-r from-rose-400 to-pink-400"
						/>
					</>
				)}
			</div>

			{/* Recent activity */}
			<div className="rounded-2xl border border-border/60 bg-card shadow-sm">
				<div className="border-b border-border/60 px-6 py-4">
					<h2 className="text-sm font-semibold">Recent Activity</h2>
					<p className="text-xs text-muted-foreground">
						Latest room and student additions
					</p>
				</div>
				<div className="px-6 py-5">
					{isLoading ? (
						<ActivityFeedSkeleton />
					) : activityFeed.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-10 text-center">
							<p className="text-sm text-muted-foreground">No activity yet</p>
							<p className="mt-1 text-xs text-muted-foreground">
								Add rooms and students to see activity here.
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{activityFeed.map((event, i) => (
								<ActivityRow key={i} event={event} />
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
