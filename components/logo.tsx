import Image from "next/image";
import type * as React from "react";
import { appConfig } from "@/config/app.config";
import { cn } from "@/lib/utils";

export type LogoProps = {
	className?: string;
	withLabel?: boolean;
};

export function Logo({
	withLabel = true,
	className,
}: LogoProps): React.JSX.Element {
	return (
		<span
			className={cn(
				"flex items-center font-semibold text-foreground leading-none",
				className,
			)}
		>
			<div className="flex size-9 items-center justify-center overflow-hidden rounded-md">
				<Image
					src="/logo.jpeg"
					alt={appConfig.appName}
					width={36}
					height={36}
					className="size-full object-cover"
					priority
				/>
			</div>
			{withLabel && (
				<span className="ml-2 hidden font-bold text-lg md:block">
					{appConfig.appName}
				</span>
			)}
		</span>
	);
}
