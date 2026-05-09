import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type * as React from "react";
import { OrganizationMenuItems } from "@/components/organization/organization-menu-items";
import { SidebarLayout } from "@/components/sidebar-layout";
import { getOrganizationById, getSession } from "@/lib/auth/server";
import { OrganizationProviders } from "./providers";

export type OrganizationLayoutProps = React.PropsWithChildren;

export default async function OrganizationLayout({
	children,
}: OrganizationLayoutProps): Promise<React.JSX.Element> {
	const session = await getSession();

	if (!session) {
		redirect("/auth/sign-in");
	}

	const activeOrganizationId = session.session.activeOrganizationId;
	if (!activeOrganizationId) {
		redirect("/dashboard");
	}

	const organization = await getOrganizationById(activeOrganizationId);
	if (!organization) {
		redirect("/dashboard");
	}

	const cookieStore = await cookies();

	return (
		<OrganizationProviders organization={organization}>
			<SidebarLayout
				defaultOpen={cookieStore.get("sidebar_state")?.value !== "false"}
				defaultWidth={cookieStore.get("sidebar_width")?.value}
				menuItems={<OrganizationMenuItems />}
			>
				{children}
			</SidebarLayout>
		</OrganizationProviders>
	);
}
