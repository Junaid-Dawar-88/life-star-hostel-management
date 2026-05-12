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
import { ChangePasswordCard } from "@/components/user/change-password-card";
import { ConnectedAccountsCard } from "@/components/user/connected-accounts-card";
import { SetPasswordCard } from "@/components/user/set-password-card";
import { TwoFactorCard } from "@/components/user/two-factor-card";
import { authConfig } from "@/config/auth.config";
import { getSession, getUserAccounts } from "@/lib/auth/server";

export const metadata: Metadata = {
	title: "Security Settings",
};

export default async function SecuritySettingsPage(): Promise<React.JSX.Element> {
	const session = await getSession();
	if (!session) {
		redirect("/auth/sign-in");
	}

	const accounts = await getUserAccounts();
	const userHasPassword =
		accounts?.some((account) => account.providerId === "credential") ?? false;

	return (
		<Page>
			<PageHeader>
				<PagePrimaryBar>
					<PageTitle>Security</PageTitle>
				</PagePrimaryBar>
			</PageHeader>
			<PageBody>
				<div className="p-4 pb-24 sm:px-6 sm:pt-6">
					<div className="max-w-2xl">
						<div className="mb-6">
							<PageTitle>Security Settings</PageTitle>
						</div>
						<div className="space-y-4">
							{userHasPassword ? <ChangePasswordCard /> : <SetPasswordCard />}
							<TwoFactorCard hasCredentialAccount={userHasPassword} />
							{authConfig.enableSocialLogin && <ConnectedAccountsCard />}
						</div>
					</div>
				</div>
			</PageBody>
		</Page>
	);
}
