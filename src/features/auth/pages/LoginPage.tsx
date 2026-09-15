import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
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
  const setSession = useAuthStore((s) => s.setSession);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setSession(data.user, data.auth, data.tokens.accessToken, data.tokens.refreshToken);
      navigate('/');
    },
  });

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="mb-6 text-2xl font-bold">Log in</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">PRN or Email</label>
          <input
            {...register('prnOrEmail')}
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="STU-2026-001 or you@institution.edu"
          />
          {errors.prnOrEmail && <p className="mt-1 text-xs text-red-600">{errors.prnOrEmail.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            type="password"
            {...register('password')}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
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

      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
