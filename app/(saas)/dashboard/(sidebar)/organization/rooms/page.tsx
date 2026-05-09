import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type * as React from "react";
import { Rooms } from "@/components/organization/rooms";
import {
	Page,
	PageBody,
	PageBreadcrumb,
	PageContent,
	PageHeader,
	PagePrimaryBar,
} from "@/components/ui/custom/page";
import { getOrganizationById, getSession } from "@/lib/auth/server";

export const metadata: Metadata = {
	title: "Rooms",
};

export default async function RoomPage(): Promise<React.JSX.Element> {
	const session = await getSession();
	if (!session?.session.activeOrganizationId) {
		redirect("/dashboard");
	}

	const organization = await getOrganizationById(
		session.session.activeOrganizationId,
	);
	if (!organization) {
		redirect("/dashboard");
	}

	return (
		<Page>
			<PageHeader>
				<PagePrimaryBar>
					<PageBreadcrumb
						segments={[
							{ label: "dashboard", href: "/dashboard" },
							{ label: organization.name, href: "/dashboard/organization" },
							{ label: "Rooms" },
						]}
					/>
				</PagePrimaryBar>
			</PageHeader>
			<PageBody>
				<PageContent title="Rooms">
					<Rooms />
				</PageContent>
			</PageBody>
		</Page>
	);
}
