"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface Testimonial {
	name: string;
	role: string;
	company: string;
	quote: string;
	avatar: string;
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
	return (
		<figure className="flex flex-col justify-between gap-10 rounded-md bg-marketing-card p-6 text-sm">
			<blockquote className="flex flex-col gap-4">
				<p>"{testimonial.quote}"</p>
			</blockquote>
			<figcaption className="flex items-center gap-4">
				<div className="flex size-12 overflow-hidden rounded-full outline -outline-offset-1 outline-black/5 dark:outline-white/5">
					<Image
						src={testimonial.avatar}
						alt={testimonial.name}
						width={160}
						height={160}
						className="size-full object-cover bg-white/75 dark:bg-black/75"
					/>
				</div>
				<div>
					<p className="font-semibold text-marketing-fg">{testimonial.name}</p>
					<p className="text-marketing-fg-muted">
						{testimonial.role} at {testimonial.company}
					</p>
				</div>
			</figcaption>
		</figure>
	);
}

export function TestimonialsSection() {
	const testimonials: Testimonial[] = [
		{
			name: "Ahmed Raza",
			role: "Owner",
			company: "Al-Noor Hostel, Lahore",
			quote:
				"Managing 80 rooms used to be a nightmare. Life Star Hostel Management made it simple — I can see everything from one screen.",
			avatar: "/marketing/avatars/man-32.jpg",
		},
		{
			name: "Fatima Khan",
			role: "Manager",
			company: "Gulshan Hostel, Karachi",
			quote:
				"The billing and payment tracking feature saved us hours every month. Our accounts are always up to date now.",
			avatar: "/marketing/avatars/woman-44.jpg",
		},
		{
			name: "Usman Tariq",
			role: "Administrator",
			company: "Star Boys Hostel, Islamabad",
			quote:
				"Check-in and check-out used to be on paper. Now it's digital, instant, and error-free. Our residents love it too.",
			avatar: "/marketing/avatars/man-75.jpg",
		},
		{
			name: "Sana Malik",
			role: "Owner",
			company: "Zara Girls Hostel, Rawalpindi",
			quote:
				"The role system is brilliant. My receptionist only sees bookings, my accountant only sees payments. Clean and secure.",
			avatar: "/marketing/avatars/woman-26.jpg",
		},
		{
			name: "Bilal Hussain",
			role: "Operations Manager",
			company: "City View Hostel, Faisalabad",
			quote:
				"We went from spreadsheets to a proper system in one day. The onboarding was incredibly smooth.",
			avatar: "/marketing/avatars/man-46.jpg",
		},
		{
			name: "Ayesha Noor",
			role: "Director",
			company: "Noor Students Hostel, Multan",
			quote:
				"Outstanding support team. Every question I had during setup was answered within hours. Highly recommended.",
			avatar: "/marketing/avatars/woman-68.jpg",
		},
	];

	return (
		<section id="testimonials" className="py-16">
			<div className="mx-auto flex max-w-2xl flex-col gap-10 px-6 md:max-w-3xl lg:max-w-7xl lg:gap-16 lg:px-10">
				{/* Header */}
				<div className="flex max-w-2xl flex-col gap-6">
					<div className="flex flex-col gap-2">
						<h2
							className={cn(
								"text-pretty font-display text-[2rem] leading-10 tracking-tight",
								"text-marketing-fg",
								"sm:text-5xl sm:leading-14",
							)}
						>
							Loved by hostel managers everywhere
						</h2>
					</div>
					<div className="text-base leading-7 text-marketing-fg-muted text-pretty">
						<p>
							Hear from hostel owners and managers across Pakistan who run their
							operations on Life Star Hostel Management.
						</p>
					</div>
				</div>

				{/* Testimonials Grid */}
				<div>
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
						{testimonials.map((testimonial) => (
							<TestimonialCard
								key={testimonial.name}
								testimonial={testimonial}
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
