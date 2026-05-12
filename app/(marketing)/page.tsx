import { CtaSection } from "@/components/marketing/sections/cta-section";
import { FaqSection } from "@/components/marketing/sections/faq-section";
import { FeaturesSection } from "@/components/marketing/sections/features-section";
import { HeroSection } from "@/components/marketing/sections/hero-section";
import { LatestArticlesSection } from "@/components/marketing/sections/latest-articles-section";
import { LogoCloudSection } from "@/components/marketing/sections/logo-cloud-section";
import { StatsSection } from "@/components/marketing/sections/stats-section";
import { TestimonialsSection } from "@/components/marketing/sections/testimonials-section";
import { appConfig } from "@/config/app.config";
import { getAllPosts } from "@/lib/marketing/blog/posts";

function OrganizationJsonLd() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: appConfig.appName,
		description: appConfig.description,
		url: appConfig.baseUrl,
		logo: `${appConfig.baseUrl}/favicon.svg`,
		contactPoint: {
			"@type": "ContactPoint",
			email: appConfig.contact.email,
			telephone: appConfig.contact.phone,
			contactType: "customer service",
		},
		address: {
			"@type": "PostalAddress",
			streetAddress: appConfig.contact.address,
		},
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
		/>
	);
}

function WebSiteJsonLd() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: appConfig.appName,
		description: appConfig.description,
		url: appConfig.baseUrl,
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: `${appConfig.baseUrl}/blog?q={search_term_string}`,
			},
			"query-input": "required name=search_term_string",
		},
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
		/>
	);
}

export default async function HomePage() {
	const posts = await getAllPosts();

	const faqContent = {
		headline: "Questions & Answers",
		items: [
			{
				question: "How do I add residents and rooms?",
				answer:
					"After signing up, you can set up your hostel by adding rooms, bed types, and pricing. Then start adding residents with their details, assign them to a room, and track everything from the dashboard.",
			},
			{
				question: "Can I manage multiple hostel branches?",
				answer:
					"Yes. Life Star Hostel Management supports multiple organizations (branches). You can create separate workspaces for each branch and switch between them with a single account.",
			},
			{
				question: "How does billing and payment tracking work?",
				answer:
					"The system lets you set monthly rent per resident, generate invoices, and record payments. Outstanding dues are automatically flagged so you never miss a payment.",
			},
			{
				question: "Can I control what my staff can see?",
				answer:
					"Absolutely. You can invite staff members and assign roles — manager, receptionist, or accountant — with different levels of access so everyone sees only what they need.",
			},
			{
				question: "Is my data secure?",
				answer:
					"Yes. All data is encrypted in transit and at rest. We use industry-standard security practices and your resident data is never shared with third parties.",
			},
			{
				question: "Do you offer customer support?",
				answer:
					"We provide dedicated support via email. Our team typically responds within a few hours to help you get the most out of the platform.",
			},
		],
	};

	const ctaContent = {
		headline: "Ready to manage your hostel smarter?",
		description:
			"Create your free account today and get your hostel up and running in minutes.",
		primaryCta: {
			text: "Get Started Free",
			href: "/auth/sign-up",
		},
		secondaryCta: {
			text: "Contact Us",
			href: "/contact",
		},
	};

	return (
		<>
			<OrganizationJsonLd />
			<WebSiteJsonLd />
			<HeroSection />
			<LogoCloudSection />
			<FeaturesSection />
			<StatsSection />
			<TestimonialsSection />
			<FaqSection content={faqContent} />
			<LatestArticlesSection posts={posts} />
			<CtaSection content={ctaContent} />
		</>
	);
}
