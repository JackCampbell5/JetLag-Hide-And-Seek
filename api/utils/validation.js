import { z } from 'zod';

// User schemas
export const userCreateSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email().max(100),
  password: z.string().min(6),
});

export const userLoginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
});

// Game schemas
export const drawCardsSchema = z.object({
  question_type: z.enum([
    'MATCHING',
    'MEASURING',
    'THERMOMETER',
    'RADAR',
    'TENTACLES',
    'PHOTOS',
  ]),
});

export const updateHandSchema = z.object({
  hand: z.array(z.any()).length(5),
});

export const updateHandSizeSchema = z.object({
  game_size: z.number().int().min(3).max(5),
});

export const playCardSchema = z.object({
  hand_position: z.number().int().min(0).max(4),
  discard_positions: z.array(z.number().int().min(0).max(4)).nullable().optional(),
});

export const placePendingCardsSchema = z.object({
  cards_to_place: z.array(z.any()),
  discard_positions: z.array(z.number().int().min(0).max(4)),
});

// Stats schemas
export const historyQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
