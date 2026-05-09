import { redirect } from "next/navigation";
import type * as React from "react";
import { getOrganizationList, getSession } from "@/lib/auth/server";
import { AutoActivateOrg } from "./auto-activate-org";

export const dynamic = "force-dynamic";

export default async function DashboardIndexPage(): Promise<React.JSX.Element> {
	const session = await getSession();

	if (!session) {
		redirect("/auth/sign-in");
	}

	if (session.session.activeOrganizationId) {
		redirect("/dashboard/organization");
	}

	if (!session.user.onboardingComplete) {
		redirect("/dashboard/onboarding");
	}

	// Onboarding complete but no active org in session — auto-activate the first org
	const orgs = await getOrganizationList();
	if (orgs.length > 0) {
		return <AutoActivateOrg orgId={orgs[0].id} />;
	}

	// User has no organizations at all — go through onboarding to create one
	redirect("/dashboard/onboarding");
}
