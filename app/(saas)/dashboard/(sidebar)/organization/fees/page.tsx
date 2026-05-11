import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type * as React from "react";
import { FeePayments } from "@/components/organization/fee-payments";
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
	title: "Fee Payments",
};

export default async function FeesPage(): Promise<React.JSX.Element> {
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
							{ label: "life-star-hostel", href: "/dashboard" },
							{ label: organization.name, href: "/dashboard/organization" },
							{ label: "Fee Payments" },
						]}
					/>
				</PagePrimaryBar>
			</PageHeader>
			<PageBody>
				<PageContent title="Fee Payments">
					<FeePayments />
				</PageContent>
			</PageBody>
		</Page>
	);
}
