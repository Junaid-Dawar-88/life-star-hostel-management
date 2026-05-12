import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type * as React from "react";
import {
	Page,
	PageBody,
	PageHeader,
	PagePrimaryBar,
	PageTitle,
} from "@/components/ui/custom/page";
import { AccountSettingsTabs } from "@/components/user/account-settings-tabs";
import { getSession } from "@/lib/auth/server";

export const metadata: Metadata = {
	title: "Settings",
};

export default async function SettingsPage(): Promise<React.JSX.Element> {
	const session = await getSession();
	if (!session) {
		redirect("/auth/sign-in");
	}

	return (
		<Page>
			<PageHeader>
				<PagePrimaryBar>
					<PageTitle>Settings</PageTitle>
				</PagePrimaryBar>
			</PageHeader>
			<PageBody>
				<div className="p-4 pb-24 sm:px-6 sm:pt-6">
					<div className="max-w-2xl">
						<div className="mb-2">
							<PageTitle>Account Settings</PageTitle>
						</div>
						<AccountSettingsTabs />
					</div>
				</div>
			</PageBody>
		</Page>
	);
}
