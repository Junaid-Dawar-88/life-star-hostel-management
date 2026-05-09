"use client";

import { ShieldIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import * as React from "react";
import { OrganizationLogo } from "@/components/organization/organization-logo";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { PersonalAccountAvatar } from "@/components/user/personal-account-avatar";
import { useSession } from "@/hooks/use-session";
import { authClient } from "@/lib/auth/client";
import { trpc } from "@/trpc/client";

export function OrganizationSwitcher(): React.JSX.Element | null {
	const { user } = useSession();
	const pathname = usePathname();
	const { data: activeOrganization, isPending: isActiveOrgPending } =
		authClient.useActiveOrganization();
	const { data: allOrganizations, isLoading: isOrgsLoading } =
		trpc.organization.list.useQuery();
	const { state: sidebarState } = useSidebar();
	const isAdminArea = pathname?.startsWith("/dashboard/admin");
	const isOrganizationArea = pathname?.startsWith("/dashboard/organization");

	const hasLoadedOrgsRef = React.useRef(false);
	const hasLoadedActiveOrgRef = React.useRef(false);

	React.useEffect(() => {
		if (allOrganizations !== undefined) {
			hasLoadedOrgsRef.current = true;
		}
	}, [allOrganizations]);

	React.useEffect(() => {
		if (!isActiveOrgPending) {
			hasLoadedActiveOrgRef.current = true;
		}
	}, [isActiveOrgPending]);

	const isInitialLoading =
		(isOrgsLoading && !hasLoadedOrgsRef.current) ||
		(isActiveOrgPending && !hasLoadedActiveOrgRef.current);

	if (isInitialLoading || !user) {
		if (sidebarState === "collapsed") {
			return (
				<div className="flex h-[44px] w-9 items-center justify-center rounded-md p-2">
					<Skeleton className="size-5 rounded-md bg-muted" />
				</div>
			);
		}
		return (
			<div className="-mt-1 ml-0.5 flex h-12 w-full items-center gap-2 rounded-md p-2">
				<Skeleton className="size-8 rounded-md bg-muted" />
				<Skeleton className="h-4 flex-1 rounded bg-muted" />
				<Skeleton className="ml-auto h-4 w-4 rounded bg-muted" />
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton
					className="-mt-1 p-2 transition-none group-data-[collapsible=icon]:ml-1.5 group-data-[collapsible=icon]:h-12! group-data-[collapsible=icon]:bg-transparent! cursor-default pointer-events-none select-none"
					size="lg"
				>
					<div className="flex w-full items-center gap-2 overflow-hidden">
						{isAdminArea ? (
							<div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
								<ShieldIcon className="size-4" />
							</div>
						) : activeOrganization && isOrganizationArea ? (
							<OrganizationLogo
								className="size-9"
								name={activeOrganization.name}
								src={activeOrganization.logo}
							/>
						) : (
							<PersonalAccountAvatar className="size-6" />
						)}
						<div className="flex flex-1 flex-col items-start gap-0.5 overflow-hidden text-left">
							<span className="block w-full truncate font-semibold leading-none">
								{isAdminArea
									? "Admin Panel"
									: activeOrganization && isOrganizationArea
										? "Life Star Hostel"
										: "Personal"}
							</span>
						</div>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
