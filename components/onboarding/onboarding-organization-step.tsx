"use client";

import { ArrowRightIcon } from "lucide-react";
import type * as React from "react";
import { z } from "zod/v4";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useZodForm } from "@/hooks/use-zod-form";
import { authClient } from "@/lib/auth/client";
import { logger } from "@/lib/logger";
import { trpc } from "@/trpc/client";

const formSchema = z.object({
	name: z.string().min(1, "Hostel name is required"),
});

export type OnboardingOrganizationStepProps = {
	onCompleted: () => void;
};

export function OnboardingOrganizationStep({
	onCompleted,
}: OnboardingOrganizationStepProps): React.JSX.Element {
	const createOrganizationMutation = trpc.organization.create.useMutation();

	const methods = useZodForm({
		schema: formSchema,
		defaultValues: { name: "" },
	});

	const onSubmit = methods.handleSubmit(async ({ name }) => {
		methods.clearErrors("root");
		try {
			const org = await createOrganizationMutation.mutateAsync({ name });
			if (!org) throw new Error("Failed to create organization");

			await authClient.organization.setActive({ organizationId: org.id });

			onCompleted();
		} catch (err) {
			logger.error(err);
			methods.setError("root", {
				type: "server",
				message: "Could not create your hostel. Please try again.",
			});
		}
	});

	return (
		<Form {...methods}>
			<form className="flex flex-col items-stretch gap-8" onSubmit={onSubmit}>
				<FormField
					control={methods.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Hostel Name</FormLabel>
							<FormControl>
								<Input
									{...field}
									placeholder="e.g. Life Star Hostel"
									autoComplete="organization"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				{methods.formState.errors.root && (
					<p className="text-destructive text-sm">
						{methods.formState.errors.root.message}
					</p>
				)}
				<Button loading={methods.formState.isSubmitting} type="submit">
					Finish Setup
					<ArrowRightIcon className="ml-2 size-4 shrink-0" />
				</Button>
			</form>
		</Form>
	);
}
