import { withContentCollections } from "@content-collections/next";
import withBundleAnalyzer from "@next/bundle-analyzer";
import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

// Validate environment variables at build time
import "./lib/env";

const nextConfig: NextConfig = {
	serverExternalPackages: ["natural", "picocolors", "pino", "thread-stream"],
	experimental: {
		optimizePackageImports: ["recharts", "lucide-react", "date-fns"],
	},
	turbopack: {
		root: __dirname,
		resolveExtensions: [".ts", ".tsx", ".js", ".jsx"],
	},
	logging: {
		fetches: {
			fullUrl: true,
		},
	},

	reactStrictMode: true,
	poweredByHeader: false,
	images: {
		dangerouslyAllowSVG: true,
		remotePatterns: [
			{
				// google profile images
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
			{
				// random user avatars
				protocol: "https",
				hostname: "randomuser.me",
			},
		],
	},
	async redirects() {
		return [
			{
				source: "/dashboard/admin",
				destination: "/dashboard/admin/users",
				permanent: false,
			},
		];
	},
	webpack: (config, { webpack }) => {
		config.plugins.push(
			new webpack.IgnorePlugin({
				resourceRegExp: /^pg-native$|^cloudflare:sockets$/,
			}),
		);

		return config;
	},
};

const bundleAnalyzerConfig =
	process.env.ANALYZE === "true"
		? withBundleAnalyzer({ enabled: true })(nextConfig)
		: nextConfig;

const withMDX = createMDX();

export default withContentCollections(withMDX(bundleAnalyzerConfig));
