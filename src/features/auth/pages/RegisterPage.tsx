import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { registerStudent } from '../api';
import { useAuthStore } from '@/store/auth';
import { ErrorMessage } from '@/components/ui/Feedback';

const schema = z.object({
  prn: z.string().min(1, 'PRN is required'),
  email: z.string().email('Enter a valid email'),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(8, 'Minimum 8 characters'),
  branch: z.string().min(1, 'Branch is required'),
  year: z.enum(['FE', 'SE', 'TE', 'BE']),
});

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      year: 'FE',
    },
  });

  const mutation = useMutation({
    mutationFn: registerStudent,
    onSuccess: (data) => {
      setSession(data.user, data.auth, data.tokens.accessToken, data.tokens.refreshToken);
      navigate('/');
    },
  });

  return (
    <div className="ui-card mx-auto mt-8 max-w-sm sm:mt-12">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Create your account</h1>

      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Full name</label>
          <input {...register('name')} className="w-full rounded-md border px-3 py-2 text-sm" />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">PRN</label>
          <input {...register('prn')} className="w-full rounded-md border px-3 py-2 text-sm" />
          {errors.prn && <p className="mt-1 text-xs text-red-600">{errors.prn.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input {...register('email')} className="w-full rounded-md border px-3 py-2 text-sm" />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Branch</label>
          <input {...register('branch')} className="w-full rounded-md border px-3 py-2 text-sm" />
          {errors.branch && <p className="mt-1 text-xs text-red-600">{errors.branch.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Year</label>
          <select {...register('year')} className="w-full rounded-md border px-3 py-2 text-sm">
            <option value="FE">FE</option>
            <option value="SE">SE</option>
            <option value="TE">TE</option>
            <option value="BE">BE</option>
          </select>
          {errors.year && <p className="mt-1 text-xs text-red-600">{errors.year.message}</p>}
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
                : 'Registration failed'
            }
          />
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-md bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {mutation.isPending ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
