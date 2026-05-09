import { z } from "zod/v4";

const seatTypeEnum = z.enum(["1_seater", "2_seater", "3_seater", "4_seater"]);
const floorEnum = z.enum(["1", "2", "3", "4", "5", "6", "7", "8"]);

export const listRoomsSchema = z.object({
	query: z.string().optional(),
});

export const createRoomSchema = z.object({
	name: z.string().trim().min(1, "Room name is required").max(100),
	seatType: seatTypeEnum,
	floor: floorEnum,
});

export const updateRoomSchema = z.object({
	id: z.string().uuid(),
	name: z.string().trim().min(1).max(100).optional(),
	seatType: seatTypeEnum.optional(),
	floor: floorEnum.optional(),
});

export const deleteRoomSchema = z.object({
	id: z.string().uuid(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
