"use client";

import type * as React from "react";
import { ActiveOrganizationProvider } from "@/components/active-organization-provider";
import type { getOrganizationById } from "@/lib/auth/server";
import { HostelProvider } from "@/lib/hostel-context";

export function OrganizationProviders({
	organization,
	children,
}: React.PropsWithChildren<{
	organization: NonNullable<Awaited<ReturnType<typeof getOrganizationById>>>;
}>): React.JSX.Element {
	return (
		<ActiveOrganizationProvider organization={organization}>
			<HostelProvider>{children}</HostelProvider>
		</ActiveOrganizationProvider>
	);
}
