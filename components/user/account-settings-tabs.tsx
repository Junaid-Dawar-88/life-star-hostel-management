import type * as React from "react";
import { ChangeEmailCard } from "@/components/user/change-email-card";
import { ChangeNameCard } from "@/components/user/change-name-card";
import { DeleteAccountCard } from "@/components/user/delete-account-card";
import { UserAvatarCard } from "@/components/user/user-avatar-card";

export function AccountSettingsTabs(): React.JSX.Element {
	return (
		<div className="space-y-4">
			<UserAvatarCard />
			<ChangeNameCard />
			<ChangeEmailCard />
			<DeleteAccountCard />
		</div>
	);
}
