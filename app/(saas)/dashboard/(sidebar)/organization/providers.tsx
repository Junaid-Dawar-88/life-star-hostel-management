"use client";

import NiceModal from "@ebay/nice-modal-react";
import type * as React from "react";
import { ActiveOrganizationProvider } from "@/components/active-organization-provider";
import { SelectedMonthProvider } from "@/components/organization/selected-month-context";
import type { getOrganizationById } from "@/lib/auth/server";

export function OrganizationProviders({
	organization,
	children,
}: React.PropsWithChildren<{
	organization: NonNullable<Awaited<ReturnType<typeof getOrganizationById>>>;
}>): React.JSX.Element {
	return (
		<ActiveOrganizationProvider organization={organization}>
			<SelectedMonthProvider>
				<NiceModal.Provider>{children}</NiceModal.Provider>
			</SelectedMonthProvider>
		</ActiveOrganizationProvider>
	);
}
