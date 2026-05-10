import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type * as React from "react";
import { FoodMenu } from "@/components/organization/food-menu";
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
	title: "Food Menu",
};

export default async function FoodMenuPage(): Promise<React.JSX.Element> {
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
							{ label: "Food Menu" },
						]}
					/>
				</PagePrimaryBar>
			</PageHeader>
			<PageBody>
				<PageContent title="Food Menu">
					<FoodMenu />
				</PageContent>
			</PageBody>
		</Page>
	);
}
