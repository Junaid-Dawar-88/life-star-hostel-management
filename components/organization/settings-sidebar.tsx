"use client";

import { LockIcon, MonitorIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";
import { cn } from "@/lib/utils";

type SettingsNavItem = {
	label: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	description: string;
};

const settingsNavItems: SettingsNavItem[] = [
	{
		label: "Profile",
		href: "/dashboard/organization/settings/profile",
		icon: UserIcon,
		description: "Manage your personal info",
	},
	{
		label: "Security",
		href: "/dashboard/organization/settings/security",
		icon: LockIcon,
		description: "Password & two-factor auth",
	},
	{
		label: "Sessions",
		href: "/dashboard/organization/settings/sessions",
		icon: MonitorIcon,
		description: "Active login sessions",
	},
];

export function SettingsSidebar(): React.JSX.Element {
	const pathname = usePathname();

	return (
		<div className="flex h-full w-56 shrink-0 flex-col border-r bg-sidebar">
			<div className="border-b px-4 py-3">
				<p className="font-semibold text-sm text-sidebar-foreground">
					Settings
				</p>
			</div>
			<nav className="flex flex-col gap-0.5 p-2">
				{settingsNavItems.map((item) => {
					const isActive =
						pathname === item.href || pathname.startsWith(item.href + "/");
					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
								isActive
									? "bg-sidebar-accent text-sidebar-accent-foreground"
									: "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
							)}
						>
							<item.icon
								className={cn(
									"size-4 shrink-0",
									isActive
										? "text-sidebar-accent-foreground"
										: "text-muted-foreground",
								)}
							/>
							<div className="flex flex-col">
								<span className="text-sm leading-tight">{item.label}</span>
								<span className="text-muted-foreground text-xs leading-tight">
									{item.description}
								</span>
							</div>
						</Link>
					);
				})}
			</nav>
		</div>
	);
}
