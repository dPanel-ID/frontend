import { z } from 'zod';

function isEmptyOrHttpUrl(value: string) {
  if (!value) return true;

  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export const formSchema = z
  .object({
    fullname: z //
      .string()
      .trim()
      .min(1, 'page.profile.modal.validation.fullNameRequired')
      .max(120, 'page.profile.modal.validation.fullNameTooLong'),
    avatar_url: z //
      .string()
      .trim()
      .max(2048, 'page.profile.modal.validation.avatarUrlTooLong')
      .refine(
        isEmptyOrHttpUrl,
        'page.profile.modal.validation.avatarUrlInvalid',
      )
      .optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const password = data.password ?? '';
    const confirmPassword = data.confirmPassword ?? '';
    const hasPassword = password.trim().length > 0;
    const hasConfirmPassword = confirmPassword.trim().length > 0;

    if (!hasPassword && !hasConfirmPassword) return;

    if (!hasPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'page.profile.modal.validation.passwordRequired',
        path: ['password'],
      });
    } else if (password.length < 8) {
      ctx.addIssue({
        code: 'custom',
        message: 'page.profile.modal.validation.passwordTooShort',
        path: ['password'],
      });
    }

    if (!hasConfirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'page.profile.modal.validation.confirmPasswordRequired',
        path: ['confirmPassword'],
      });
    } else if (hasPassword && password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'page.profile.modal.validation.confirmPasswordMismatch',
        path: ['confirmPassword'],
      });
    }
  });

export type FormSchema = z.infer<typeof formSchema>;
