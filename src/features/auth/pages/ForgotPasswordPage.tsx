import { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api';
import { ErrorMessage } from '@/components/ui/Feedback';
import { MailIcon, ArrowLeftIcon } from '@/components/ui/Icons';

const schema = z.object({
  prnOrEmail: z.string().min(1, 'PRN or email is required'),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [submittedTarget, setSubmittedTarget] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (_, variables) => {
      setSubmittedTarget(variables.prnOrEmail);
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  const handleResetAgain = () => {
    setSubmittedTarget(null);
    reset();
  };

  return (
    <div className="ui-card mx-auto mt-12 max-w-md sm:mt-16">
      {submittedTarget ? (
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60">
            <MailIcon className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Password reset link sent
          </h1>
          <p className="mb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            If an account is associated with{' '}
            <strong className="font-semibold text-gray-900 dark:text-gray-100">{submittedTarget}</strong>,
            we have sent instructions to reset your password.
          </p>

          <div className="mb-6 space-y-2 rounded-xl border border-gray-200 bg-gray-50/80 p-4 text-left text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-400">
            <div className="flex items-start gap-2">
              <span className="text-brand-600 dark:text-brand-400">•</span>
              <span>Reset links remain valid for <strong>15 minutes</strong>.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-brand-600 dark:text-brand-400">•</span>
              <span>Be sure to check your <strong>spam or junk</strong> folder.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-brand-600 dark:text-brand-400">•</span>
              <span>
                If you are a student, check your official college institutional mailbox.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-brand-600 dark:text-brand-400">•</span>
              <span>
                Need direct help? Contact CESA admin at{' '}
                <span className="font-medium text-brand-600 dark:text-brand-400">support@cesa-sdw.org</span>
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center rounded-md bg-brand-600 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
            >
              Back to log in
            </Link>

            <button
              type="button"
              onClick={handleResetAgain}
              className="w-full text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Didn't receive it? Enter a different PRN or email
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Forgot password
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Enter your student PRN or registered institutional email, and we'll help you reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">PRN or Institutional Email</label>
              <input
                {...register('prnOrEmail')}
                className="w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                placeholder="STU-2026-001 or you@institution.edu"
                autoFocus
              />
              {errors.prnOrEmail && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.prnOrEmail.message}</p>
              )}
            </div>

            {mutation.isError && (
              <ErrorMessage
                message={
                  axios.isAxiosError(mutation.error)
                    ? (mutation.error.response?.data?.message || mutation.error.message)
                    : 'Failed to request password reset'
                }
              />
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded-md bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'Sending reset link...' : 'Send reset link'}
            </button>
          </form>

          <div className="mt-6 border-t border-gray-200 pt-4 text-center dark:border-gray-800">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to login</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
