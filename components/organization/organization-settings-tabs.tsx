"use client";

import type * as React from "react";
import { DeleteOrganizationCard } from "@/components/organization/delete-organization-card";
import { OrganizationChangeNameCard } from "@/components/organization/organization-change-name-card";
import { OrganizationLogoCard } from "@/components/organization/organization-logo-card";

export function OrganizationSettingsTabs(): React.JSX.Element {
	return (
		<div className="space-y-4">
			<OrganizationLogoCard />
			<OrganizationChangeNameCard />
			<DeleteOrganizationCard />
		</div>
	);
}
