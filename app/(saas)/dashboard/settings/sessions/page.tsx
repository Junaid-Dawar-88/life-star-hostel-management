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
import { ActiveSessionsCard } from "@/components/user/active-sessions-card";
import { getSession } from "@/lib/auth/server";

export const metadata: Metadata = {
	title: "Sessions",
};

export default async function SessionsSettingsPage(): Promise<React.JSX.Element> {
	const session = await getSession();
	if (!session) {
		redirect("/auth/sign-in");
	}

	return (
		<Page>
			<PageHeader>
				<PagePrimaryBar>
					<PageTitle>Sessions</PageTitle>
				</PagePrimaryBar>
			</PageHeader>
			<PageBody>
				<div className="p-4 pb-24 sm:px-6 sm:pt-6">
					<div className="max-w-2xl">
						<div className="mb-6">
							<PageTitle>Active Sessions</PageTitle>
						</div>
						<div className="space-y-4">
							<ActiveSessionsCard />
						</div>
					</div>
				</div>
			</PageBody>
		</Page>
	);
}
