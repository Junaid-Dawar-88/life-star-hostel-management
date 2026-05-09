"use client";

import * as React from "react";
import { useProgressRouter } from "@/hooks/use-progress-router";
import { authClient } from "@/lib/auth/client";

export function AutoActivateOrg({
	orgId,
}: {
	orgId: string;
}): React.JSX.Element {
	const router = useProgressRouter();

	React.useEffect(() => {
		authClient.organization
			.setActive({ organizationId: orgId })
			.then(() => router.replace("/dashboard/organization"));
	}, [orgId, router]);

	return (
		<div className="flex h-screen items-center justify-center">
			<div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
		</div>
	);
}
