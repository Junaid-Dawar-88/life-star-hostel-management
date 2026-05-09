import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type * as React from "react";
import {
	Page,
	PageBody,
	PageBreadcrumb,
	PageHeader,
	PagePrimaryBar,
	PageTitle,
} from "@/components/ui/custom/page";
import { AccountSettingsTabs } from "@/components/user/account-settings-tabs";
import { getOrganizationById, getSession } from "@/lib/auth/server";

export const metadata: Metadata = {
	title: "Profile Settings",
};

export default async function ProfileSettingsPage(): Promise<React.JSX.Element> {
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
							{ label: "Settings", href: "/dashboard/organization/settings" },
							{ label: "Profile" },
						]}
					/>
				</PagePrimaryBar>
			</PageHeader>
			<PageBody>
				<div className="p-4 pb-24 sm:px-6 sm:pt-6">
					<div className="max-w-2xl">
						<div className="mb-2">
							<PageTitle>Profile Settings</PageTitle>
						</div>
						<AccountSettingsTabs />
					</div>
				</div>
			</PageBody>
		</Page>
	);
}
