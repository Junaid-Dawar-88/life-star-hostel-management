import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import {
	admin,
	captcha,
	openAPI,
	organization,
	twoFactor,
	username,
} from "better-auth/plugins";
import { appConfig } from "@/config/app.config";
import { authConfig } from "@/config/auth.config";
import { prisma } from "@/lib/db";
import {
	sendConfirmEmailAddressChangeEmail,
	sendOrganizationInvitationEmail,
	sendPasswordResetEmail,
	sendVerifyEmailAddressEmail,
} from "@/lib/email";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { getBaseUrl } from "@/lib/utils";

const appUrl = getBaseUrl();

export const auth = betterAuth({
	baseURL: appUrl,
	trustedOrigins: authConfig.trustedOrigins,
	appName: appConfig.appName,
	database: prismaAdapter(prisma, {
		provider: "postgresql",
		usePlural: false,
		transaction: true,
	}),
	advanced: {
		database: {
			generateId: false,
		},
	},
	session: {
		expiresIn: authConfig.sessionCookieMaxAge,
		freshAge: 0,
	},
	user: {
		additionalFields: {
			onboardingComplete: {
				type: "boolean",
				required: false,
			},
			banned: {
				type: "boolean",
				required: false,
			},
			banReason: {
				type: "string",
				required: false,
			},
			banExpires: {
				type: "date",
				required: false,
			},
		},
		deleteUser: {
			enabled: true,
		},
		changeEmail: {
			enabled: true,
			sendChangeEmailVerification: async (
				{ user: { email, name }, url },
				_request,
			) => {
				await sendConfirmEmailAddressChangeEmail({
					recipient: email,
					name,
					confirmLink: url,
				});
			},
		},
	},
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["google"],
		},
	},
	emailAndPassword: {
		enabled: true,
		autoSignIn: false,
		requireEmailVerification: true,
		minPasswordLength: authConfig.minimumPasswordLength,
		sendResetPassword: async ({ user, url }, _request) => {
			await sendPasswordResetEmail({
				recipient: user.email,
				appName: appConfig.appName,
				name: user.name,
				resetPasswordLink: url,
			});
		},
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		expiresIn: authConfig.verificationExpiresIn,
		sendVerificationEmail: async ({ user: { email, name }, url }, _request) => {
			await sendVerifyEmailAddressEmail({
				recipient: email,
				name,
				verificationLink: url,
			});
		},
	},
	socialProviders: {
		google: {
			prompt: "select_account",
			clientId: env.GOOGLE_CLIENT_ID ?? "",
			clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
			scope: ["email", "profile"],
		},
	},
	plugins: [
		username(),
		admin(),
		...(env.TURNSTILE_SECRET_KEY
			? [
					captcha({
						provider: "cloudflare-turnstile",
						secretKey: env.TURNSTILE_SECRET_KEY,
					}),
				]
			: []),
		organization({
			sendInvitationEmail: async (
				{ email, inviter, id, organization },
				_request,
			) => {
				const existingUser = await prisma.user.findFirst({
					where: { email },
					select: { id: true },
				});

				const url = new URL(
					existingUser ? "/auth/sign-in" : "/auth/sign-up",
					getBaseUrl(),
				);

				url.searchParams.set("invitationId", id);
				url.searchParams.set("email", email);

				const inviterUser = await prisma.user.findFirst({
					where: { id: inviter.userId },
					select: { email: true, name: true },
				});

				await sendOrganizationInvitationEmail({
					recipient: email,
					appName: appConfig.appName,
					organizationName: organization.name,
					invitedByEmail: inviterUser?.email ?? "",
					invitedByName: inviterUser?.name ?? "",
					inviteLink: url.toString(),
				});
			},
		}),
		openAPI(),
		twoFactor(),
	],
	databaseHooks: {
		session: {
			create: {
				async before(session, ctx) {
					const targetUser = await prisma.user.findFirst({
						where: { id: session.userId },
						select: {
							id: true,
							banned: true,
							banReason: true,
							banExpires: true,
						},
					});

					if (targetUser?.banned) {
						if (
							targetUser.banExpires &&
							new Date(targetUser.banExpires) < new Date()
						) {
							await prisma.user.update({
								where: { id: targetUser.id },
								data: {
									banned: false,
									banReason: null,
									banExpires: null,
								},
							});
						} else {
							let message =
								targetUser.banReason || "Your account has been suspended";
							if (targetUser.banExpires) {
								const expiryDate = new Date(
									targetUser.banExpires,
								).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								});
								message += `|expires:${expiryDate}`;
							}
							throw new APIError("FORBIDDEN", {
								code: "USER_BANNED",
								message,
							});
						}
					}

					return { ...ctx, data: session };
				},
			},
		},
	},
	hooks: {
		before: createAuthMiddleware(async (ctx) => {
			if (ctx.path === "/sign-up/email" || ctx.path === "/sign-in/email") {
				if (ctx.path === "/sign-in/email") {
					const email = ctx.body?.email;
					const targetUser = email
						? await prisma.user.findFirst({
								where: { email },
								select: {
									id: true,
									banned: true,
									banReason: true,
									banExpires: true,
								},
							})
						: null;

					if (targetUser?.banned) {
						if (
							targetUser.banExpires &&
							new Date(targetUser.banExpires) < new Date()
						) {
							await prisma.user.update({
								where: { id: targetUser.id },
								data: {
									banned: false,
									banReason: null,
									banExpires: null,
								},
							});
						} else {
							let message =
								targetUser.banReason || "Your account has been suspended";
							if (targetUser.banExpires) {
								const expiryDate = new Date(
									targetUser.banExpires,
								).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								});
								message += `|expires:${expiryDate}`;
							}
							throw new APIError("FORBIDDEN", {
								code: "USER_BANNED",
								message,
							});
						}
					}
				}
			}
		}),
	},
	onAPIError: {
		onError(error, ctx) {
			logger.error(error, "auth error", ctx);
		},
	},
});
