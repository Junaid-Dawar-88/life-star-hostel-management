import type * as React from "react";
import { SettingsSidebar } from "@/components/organization/settings-sidebar";

export type SettingsLayoutProps = React.PropsWithChildren;

export default function SettingsLayout({
	children,
}: SettingsLayoutProps): React.JSX.Element {
	return (
		<div className="flex h-full w-full overflow-hidden">
			<SettingsSidebar />
			<div className="flex-1 overflow-auto">{children}</div>
		</div>
	);
}
