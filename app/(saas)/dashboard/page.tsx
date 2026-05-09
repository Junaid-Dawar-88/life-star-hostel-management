import { redirect } from "next/navigation";
import type * as React from "react";
import {
	getOrganizationById,
	getOrganizationList,
	getSession,
} from "@/lib/auth/server";
import { AutoActivateOrg } from "./auto-activate-org";

export const dynamic = "force-dynamic";

export default async function DashboardIndexPage(): Promise<React.JSX.Element> {
	const session = await getSession();

	if (!session) {
		redirect("/auth/sign-in");
	}

	// Verify the active org actually exists before redirecting to it — prevents
	// a redirect loop when the org was deleted but the session cookie still holds its ID.
	if (session.session.activeOrganizationId) {
		const org = await getOrganizationById(session.session.activeOrganizationId);
		if (org) {
			redirect("/dashboard/organization");
		}
	}

	if (!session.user.onboardingComplete) {
		redirect("/dashboard/onboarding");
	}

	// Onboarding complete but no active org in session — auto-activate the first org
	const orgs = await getOrganizationList();
	const firstOrg = orgs[0];
	if (firstOrg) {
		return <AutoActivateOrg orgId={firstOrg.id} />;
	}

	// User has no organizations — send to org creation step of onboarding
	redirect("/dashboard/onboarding?step=2");
}
