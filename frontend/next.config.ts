import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	poweredByHeader: false,
	allowedDevOrigins: ["outliers.idealtouchtrading.com"],
	typescript: {
		// Prevent TypeScript check errors from blocking production builds
		ignoreBuildErrors: true,
	},
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{ key: "X-Content-Type-Options", value: "nosniff" },
					{ key: "X-Frame-Options", value: "SAMEORIGIN" },
					{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
					{ key: "Permissions-Policy", value: "camera=(), geolocation=()" },
					{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
				],
			},
		];
	},
	turbopack: {
		rules: {
			"*.css": {
				loaders: ["@tailwindcss/turbopack"],
				as: "*.css",
			},
		},
	},
	// Remote pattern rules for Supabase storage image loading
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "*.supabase.co", // Allow all Supabase storage subdomains
				port: "",
				pathname: "/**",
			},
		],
	},
	async rewrites() {
		const backendUrl =
			process.env.BACKEND_INTERNAL_URL ||
			process.env.NEXT_PUBLIC_API_URL ||
			"https://legal-copilot-backend-088i.onrender.com";

		return [
			{
				source: "/api/:path*",
				destination: `${backendUrl}/api/:path*`,
			},
		];
	},
};

export default nextConfig;
