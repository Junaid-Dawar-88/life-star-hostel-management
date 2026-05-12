"use client";

import { InfiniteSlider } from "@/components/marketing/primitives/infinite-slider";
import { ProgressiveBlur } from "@/components/marketing/primitives/progressive-blur";

const hostelNames = [
	"Al-Noor Hostel, Lahore",
	"City View Hostel, Faisalabad",
	"Gulshan Residency, Karachi",
	"Star Boys Hostel, Islamabad",
	"Zara Girls Hostel, Rawalpindi",
	"Noor Students Hostel, Multan",
	"Green Valley Hostel, Peshawar",
	"Pak Hostel, Quetta",
];

export function LogoCloudSection() {
	return (
		<section className="overflow-hidden border-border/50 border-t">
			<div className="group relative mx-auto max-w-screen-2xl px-4 sm:px-6 md:px-12">
				<p className="pt-6 text-center text-xs font-semibold tracking-widest text-marketing-fg-muted uppercase">
					Trusted by hostels across Pakistan
				</p>
				<div className="relative w-full py-5">
					<InfiniteSlider speedOnHover={20} speed={35} gap={64}>
						{hostelNames.map((name) => (
							<div
								key={name}
								className="flex items-center gap-2 rounded-full border border-marketing-border bg-marketing-card px-4 py-1.5"
							>
								<span className="size-1.5 rounded-full bg-marketing-fg-muted/50" />
								<span className="whitespace-nowrap text-sm font-medium text-marketing-fg-muted">
									{name}
								</span>
							</div>
						))}
					</InfiniteSlider>

					<ProgressiveBlur
						className="pointer-events-none absolute inset-y-0 left-0 h-full w-20"
						direction="left"
						blurIntensity={1}
					/>
					<ProgressiveBlur
						className="pointer-events-none absolute inset-y-0 right-0 h-full w-20"
						direction="right"
						blurIntensity={1}
					/>
				</div>
			</div>
		</section>
	);
}
