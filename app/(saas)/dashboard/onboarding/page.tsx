import type { Metadata } from "next";
import { redirect } from "next/navigation";
import * as React from "react";
import { OnboardingCard } from "@/components/onboarding/onboarding-card";
import { getSession } from "@/lib/auth/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
	title: "Set up your account",
};

type OnboardingPageProps = {
	searchParams: Promise<{ step?: string }>;
};

export default async function OnboardingPage({
	searchParams,
}: OnboardingPageProps): Promise<React.JSX.Element> {
	const session = await getSession();
	if (!session) {
		return redirect("/auth/sign-in");
	}

	const { step } = await searchParams;

	// Allow step=2 (org creation) even when profile onboarding is already done —
	// this handles the case where the user completed step 1 but has no organization yet.
	if (session.user.onboardingComplete && step !== "2") {
		return redirect("/dashboard");
	}

	return (
		<React.Suspense>
			<OnboardingCard />
		</React.Suspense>
	);
}
