"use client";

import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Plan {
	name: string;
	description: string;
	monthlyPrice: number | null;
	yearlyPrice: number | null;
	isFree: boolean;
	isEnterprise: boolean;
	features: string[];
	cta: { text: string; href: string };
	highlighted?: boolean;
}

const plans: Plan[] = [
	{
		name: "Free",
		description: "Get started with the basics.",
		monthlyPrice: 0,
		yearlyPrice: 0,
		isFree: true,
		isEnterprise: false,
		features: [
			"Up to 3 users",
			"5 projects",
			"Basic analytics",
			"Email support",
		],
		cta: { text: "Get started", href: "/auth/sign-up" },
	},
	{
		name: "Pro",
		description: "Everything you need to scale.",
		monthlyPrice: 29,
		yearlyPrice: 23,
		isFree: false,
		isEnterprise: false,
		highlighted: true,
		features: [
			"Unlimited users",
			"Unlimited projects",
			"Advanced analytics",
			"Priority support",
			"Custom integrations",
			"SSO",
		],
		cta: { text: "Start free trial", href: "/auth/sign-up" },
	},
	{
		name: "Enterprise",
		description: "For large teams with advanced needs.",
		monthlyPrice: null,
		yearlyPrice: null,
		isFree: false,
		isEnterprise: true,
		features: [
			"Everything in Pro",
			"Dedicated infrastructure",
			"SLA guarantee",
			"Custom contracts",
			"Onboarding support",
			"Audit logs",
		],
		cta: { text: "Contact sales", href: "/contact" },
	},
];

interface PricingSectionProps {
	headline?: string;
	showFreePlans?: boolean;
	showEnterprisePlans?: boolean;
	defaultInterval?: "month" | "year";
}

export function PricingSection({
	headline,
	showFreePlans = true,
	showEnterprisePlans = true,
	defaultInterval = "month",
}: PricingSectionProps) {
	const [interval, setInterval] = useState<"month" | "year">(defaultInterval);

	const visiblePlans = plans.filter((plan) => {
		if (plan.isFree && !showFreePlans) return false;
		if (plan.isEnterprise && !showEnterprisePlans) return false;
		return true;
	});

	return (
		<section id="pricing-plans" className="py-16">
			<div className="mx-auto flex max-w-2xl flex-col items-center gap-10 px-6 md:max-w-3xl lg:max-w-7xl lg:px-10">
				{headline && (
					<h2
						className={cn(
							"text-balance text-center font-display text-[2rem] leading-10 tracking-tight",
							"text-marketing-fg",
							"sm:text-5xl sm:leading-14",
						)}
					>
						{headline}
					</h2>
				)}

				{/* Interval toggle */}
				<div className="flex items-center gap-3 rounded-full border border-marketing-border bg-marketing-card p-1">
					<button
						type="button"
						onClick={() => setInterval("month")}
						className={cn(
							"rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
							interval === "month"
								? "bg-marketing-accent text-marketing-accent-fg"
								: "text-marketing-fg-muted hover:text-marketing-fg",
						)}
					>
						Monthly
					</button>
					<button
						type="button"
						onClick={() => setInterval("year")}
						className={cn(
							"rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
							interval === "year"
								? "bg-marketing-accent text-marketing-accent-fg"
								: "text-marketing-fg-muted hover:text-marketing-fg",
						)}
					>
						Yearly
						<span className="ml-1.5 rounded-full bg-green-100 px-1.5 py-0.5 text-xs text-green-700">
							-20%
						</span>
					</button>
				</div>

				{/* Plan cards */}
				<div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{visiblePlans.map((plan) => (
						<div
							key={plan.name}
							className={cn(
								"flex flex-col gap-6 rounded-2xl border p-8",
								plan.highlighted
									? "border-marketing-accent bg-marketing-accent/5"
									: "border-marketing-border bg-marketing-card",
							)}
						>
							<div className="flex flex-col gap-2">
								<h3 className="font-semibold text-marketing-fg text-lg">
									{plan.name}
								</h3>
								<p className="text-marketing-fg-muted text-sm">
									{plan.description}
								</p>
							</div>

							<div className="flex items-end gap-1">
								{plan.monthlyPrice === null ? (
									<span className="font-display text-4xl font-bold text-marketing-fg">
										Custom
									</span>
								) : (
									<>
										<span className="font-display text-4xl font-bold text-marketing-fg">
											$
											{interval === "month"
												? plan.monthlyPrice
												: plan.yearlyPrice}
										</span>
										{plan.monthlyPrice > 0 && (
											<span className="mb-1 text-marketing-fg-muted text-sm">
												/ mo
											</span>
										)}
									</>
								)}
							</div>

							<Link
								href={plan.cta.href}
								className={cn(
									"inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors",
									plan.highlighted
										? "bg-marketing-accent text-marketing-accent-fg hover:bg-marketing-accent-hover"
										: "border border-marketing-border text-marketing-fg hover:bg-marketing-card-hover",
								)}
							>
								{plan.cta.text}
							</Link>

							<ul className="flex flex-col gap-3">
								{plan.features.map((feature) => (
									<li key={feature} className="flex items-center gap-2.5">
										<CheckIcon className="size-4 shrink-0 text-marketing-accent" />
										<span className="text-marketing-fg-muted text-sm">
											{feature}
										</span>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
