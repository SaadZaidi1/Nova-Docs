import { z } from 'zod';

/** Schema for user registration input */
export const RegisterInputSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128, 'Password must be 128 characters or less'),
});

/** Schema for user login input */
export const LoginInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/** Schema for creating a new document */
export const CreateDocumentInputSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
});

/** Schema for updating a document */
export const PatchDocumentInputSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').optional(),
  content: z.string().optional(),
});

/** Schema for sharing a document */
export const ShareInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  permission: z.enum(['viewer', 'editor'], {
    errorMap: () => ({ message: 'Permission must be either "viewer" or "editor"' }),
  }),
});

// Export inferred types
export type RegisterInput = z.infer<typeof RegisterInputSchema>;
export type LoginInput = z.infer<typeof LoginInputSchema>;
export type CreateDocumentInput = z.infer<typeof CreateDocumentInputSchema>;
export type PatchDocumentInput = z.infer<typeof PatchDocumentInputSchema>;
export type ShareInput = z.infer<typeof ShareInputSchema>;
