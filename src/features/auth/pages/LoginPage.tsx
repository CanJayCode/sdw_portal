import { useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '../api';
import { useAuthStore } from '@/store/auth';
import { ErrorMessage } from '@/components/ui/Feedback';

const schema = z.object({
  prnOrEmail: z.string().min(1, 'PRN or email is required'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession, setGuestSession, isAuthenticated, isGuest } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !isGuest) {
      const destination = (location.state?.from?.pathname as string | undefined) || '/dashboard';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, isGuest, navigate, location.state]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setSession(data.user, data.auth, data.tokens.accessToken, data.tokens.refreshToken);
      const destination = (location.state?.from?.pathname as string | undefined) || '/dashboard';
      navigate(destination);
    },
  });

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  const handleGuestLogin = () => {
    setGuestSession();
    const destination = (location.state?.from?.pathname as string | undefined) || '/';
    navigate(destination);
  };

  return (
    <div className="ui-card mx-auto mt-12 max-w-sm sm:mt-16">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Log in</h1>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Sign in to access your student portal and manage club activities
        </p>
      </div>

      {isGuest && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
          You are currently in Guest Mode. Log in to access your registered student profile.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">PRN or Email</label>
          <input
            {...register('prnOrEmail')}
            className="w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            placeholder="STU-2026-001 or you@institution.edu"
          />
          {errors.prnOrEmail && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.prnOrEmail.message}</p>}
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium">Password</label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-brand-600 hover:text-brand-500 hover:underline dark:text-brand-400"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            {...register('password')}
            className="w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
          {errors.password && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>}
        </div>

        {mutation.isError && (
          <ErrorMessage
            message={
              axios.isAxiosError(mutation.error)
                ? (mutation.error.response?.data?.message
                    ? `${mutation.error.response.data.message}${
                        Array.isArray(mutation.error.response.data.errors) && mutation.error.response.data.errors.length > 0
                          ? `: ${mutation.error.response.data.errors.map((e: { message?: string }) => e.message).filter(Boolean).join(', ')}`
                          : ''
                      }`
                    : mutation.error.code === 'ERR_NETWORK' || !mutation.error.response
                      ? 'Unable to connect to the backend server. Please make sure the backend is running at http://localhost:5000.'
                      : mutation.error.message)
                : 'Login failed'
            }
          />
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-md bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {mutation.isPending ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      {/* Guest Mode Option */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
            or explore
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGuestLogin}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        <span>👤</span>
        <span>Continue as Guest</span>
      </button>

      <p className="mt-5 text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
          Register
        </Link>
      </p>
    </div>
  );
}
