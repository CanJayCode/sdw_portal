import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAchievementTypes, submitAchievement, submitGuestAchievement } from '../api';
import { useAuthStore } from '@/store/auth';
import { ErrorMessage, Spinner } from '@/components/ui/Feedback';

const authenticatedSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  achievementTypeId: z.string().min(1, 'Please select an achievement type'),
  semesterId: z.string().optional(),
  evidenceUrls: z
    .array(
      z.object({
        url: z.string().url('Please enter a valid URL (e.g. https://...)'),
      })
    )
    .min(1, 'At least one evidence URL is required'),
});

const guestSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  prn: z.string().min(3, 'PRN is required'),
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  achievementTypeId: z.string().min(1, 'Please select an achievement type'),
  evidenceUrls: z
    .array(
      z.object({
        url: z.string().url('Please enter a valid URL (e.g. https://...)'),
      })
    )
    .min(1, 'At least one evidence URL is required'),
});

type AuthenticatedFormValues = z.infer<typeof authenticatedSchema>;
type GuestFormValues = z.infer<typeof guestSchema>;

interface AchievementFormProps {
  isGuest?: boolean;
  onSuccess?: () => void;
}

export const AchievementForm: React.FC<AchievementFormProps> = ({
  isGuest: initialIsGuest = false,
  onSuccess,
}) => {
  const { isAuthenticated } = useAuthStore();
  const [isGuestMode, setIsGuestMode] = useState(initialIsGuest || !isAuthenticated);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const queryClient = useQueryClient();

  // Fetch Achievement Types
  const { data: types, isLoading: isTypesLoading, isError: isTypesError } = useQuery({
    queryKey: ['achievementTypes'],
    queryFn: getAchievementTypes,
  });

  // Auth Form
  const authForm = useForm<AuthenticatedFormValues>({
    resolver: zodResolver(authenticatedSchema),
    defaultValues: {
      title: '',
      description: '',
      achievementTypeId: '',
      evidenceUrls: [{ url: '' }],
    },
  });

  const authEvidenceArray = useFieldArray({
    control: authForm.control,
    name: 'evidenceUrls',
  });

  // Guest Form
  const guestForm = useForm<GuestFormValues>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      name: '',
      email: '',
      prn: '',
      title: '',
      description: '',
      achievementTypeId: '',
      evidenceUrls: [{ url: '' }],
    },
  });

  const guestEvidenceArray = useFieldArray({
    control: guestForm.control,
    name: 'evidenceUrls',
  });

  // Mutations
  const authMutation = useMutation({
    mutationFn: submitAchievement,
    onSuccess: () => {
      setSubmitSuccess(true);
      authForm.reset();
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      if (onSuccess) onSuccess();
    },
  });

  const guestMutation = useMutation({
    mutationFn: submitGuestAchievement,
    onSuccess: () => {
      setSubmitSuccess(true);
      guestForm.reset();
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      if (onSuccess) onSuccess();
    },
  });

  if (isTypesLoading) return <Spinner />;
  if (isTypesError) return <ErrorMessage message="Failed to load achievement categories. Please try again later." />;

  const isPending = authMutation.isPending || guestMutation.isPending;
  const currentError = authMutation.error || guestMutation.error;

  const selectedTypeId = isGuestMode
    ? guestForm.watch('achievementTypeId')
    : authForm.watch('achievementTypeId');
  const selectedType = types?.find((t) => t._id === selectedTypeId);

  const onAuthSubmit = (data: AuthenticatedFormValues) => {
    setSubmitSuccess(false);
    authMutation.mutate({
      title: data.title,
      description: data.description,
      achievementTypeId: data.achievementTypeId,
      semesterId: data.semesterId,
      evidenceUrls: data.evidenceUrls.map((e) => e.url),
    });
  };

  const onGuestSubmit = (data: GuestFormValues) => {
    setSubmitSuccess(false);
    guestMutation.mutate({
      name: data.name,
      email: data.email,
      prn: data.prn,
      title: data.title,
      description: data.description,
      achievementTypeId: data.achievementTypeId,
      evidenceUrls: data.evidenceUrls.map((e) => e.url),
    });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Mode switcher if authenticated */}
      {isAuthenticated && (
        <div className="mb-6 flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => {
              setIsGuestMode(false);
              setSubmitSuccess(false);
            }}
            className={`pb-3 text-sm font-semibold transition-colors ${
              !isGuestMode
                ? 'border-b-2 border-brand-600 text-brand-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Student Submission
          </button>
          <button
            type="button"
            onClick={() => {
              setIsGuestMode(true);
              setSubmitSuccess(false);
            }}
            className={`ml-6 pb-3 text-sm font-semibold transition-colors ${
              isGuestMode
                ? 'border-b-2 border-brand-600 text-brand-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Guest / External Submission
          </button>
        </div>
      )}

      {submitSuccess && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <p className="font-bold">Achievement Submitted Successfully!</p>
          <p className="mt-1 text-xs text-emerald-700">
            Your achievement has been submitted and automatically queued for Documentation Review by an ACM Doc Member.
          </p>
        </div>
      )}

      {currentError && (
        <div className="mb-4">
          <ErrorMessage
            message={
              (currentError as any)?.response?.data?.message ||
              'Failed to submit achievement. Please check your form and try again.'
            }
          />
        </div>
      )}

      {!isGuestMode ? (
        /* Authenticated Student Form */
        <form onSubmit={authForm.handleSubmit(onAuthSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Achievement Category / Type <span className="text-rose-500">*</span>
            </label>
            <select
              {...authForm.register('achievementTypeId')}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="">-- Select an achievement category --</option>
              {types?.map((type) => (
                <option key={type._id} value={type._id}>
                  {type.name} ({type.category}) — {type.defaultPoints} pts
                </option>
              ))}
            </select>
            {authForm.formState.errors.achievementTypeId && (
              <p className="mt-1 text-xs text-rose-600">
                {authForm.formState.errors.achievementTypeId.message}
              </p>
            )}
            {selectedType && (
              <div className="mt-2 rounded bg-brand-50 p-2.5 text-xs text-brand-800">
                <span className="font-semibold">{selectedType.name}</span>: {selectedType.description} (+{selectedType.defaultPoints} leaderboard points upon approval)
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Achievement Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              {...authForm.register('title')}
              placeholder="e.g. 1st Prize at National AI Hackathon 2026"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            {authForm.formState.errors.title && (
              <p className="mt-1 text-xs text-rose-600">{authForm.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description / Summary <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              {...authForm.register('description')}
              placeholder="Detail your role, project built, competition scope, or publication specifics..."
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            {authForm.formState.errors.description && (
              <p className="mt-1 text-xs text-rose-600">
                {authForm.formState.errors.description.message}
              </p>
            )}
          </div>

          {/* Evidence URLs */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Supporting Evidence URLs (Certificates, papers, repos) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => authEvidenceArray.append({ url: '' })}
                className="text-xs font-semibold text-brand-600 hover:text-brand-800"
              >
                + Add Another URL
              </button>
            </div>

            {authEvidenceArray.fields.map((field, idx) => (
              <div key={field.id} className="mt-2 flex items-center gap-2">
                <input
                  type="url"
                  {...authForm.register(`evidenceUrls.${idx}.url` as const)}
                  placeholder="https://storage.institution.edu/certificates/cert.pdf"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
                {authEvidenceArray.fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => authEvidenceArray.remove(idx)}
                    className="rounded p-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {authForm.formState.errors.evidenceUrls && (
              <p className="mt-1 text-xs text-rose-600">
                {authForm.formState.errors.evidenceUrls.message ||
                  authForm.formState.errors.evidenceUrls.root?.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 shadow-sm"
          >
            {isPending ? 'Submitting for Review...' : 'Submit Achievement'}
          </button>
        </form>
      ) : (
        /* Guest Student Form */
        <form onSubmit={guestForm.handleSubmit(onGuestSubmit)} className="space-y-5">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
            <strong>Guest Submission:</strong> Achievements submitted with your PRN and email will automatically be linked to your student account once you sign up or log in.
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...guestForm.register('name')}
                placeholder="Sameer Joshi"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
              {guestForm.formState.errors.name && (
                <p className="mt-1 text-xs text-rose-600">{guestForm.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Institutional PRN <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...guestForm.register('prn')}
                placeholder="STU-2026-099"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
              {guestForm.formState.errors.prn && (
                <p className="mt-1 text-xs text-rose-600">{guestForm.formState.errors.prn.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              {...guestForm.register('email')}
              placeholder="sameer.joshi@institution.edu"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            {guestForm.formState.errors.email && (
              <p className="mt-1 text-xs text-rose-600">{guestForm.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Achievement Category / Type <span className="text-rose-500">*</span>
            </label>
            <select
              {...guestForm.register('achievementTypeId')}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="">-- Select an achievement category --</option>
              {types?.map((type) => (
                <option key={type._id} value={type._id}>
                  {type.name} ({type.category}) — {type.defaultPoints} pts
                </option>
              ))}
            </select>
            {guestForm.formState.errors.achievementTypeId && (
              <p className="mt-1 text-xs text-rose-600">
                {guestForm.formState.errors.achievementTypeId.message}
              </p>
            )}
            {selectedType && (
              <div className="mt-2 rounded bg-brand-50 p-2.5 text-xs text-brand-800">
                <span className="font-semibold">{selectedType.name}</span>: {selectedType.description} (+{selectedType.defaultPoints} pts)
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Achievement Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              {...guestForm.register('title')}
              placeholder="e.g. Speaker at Cloud Community Day 2026"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            {guestForm.formState.errors.title && (
              <p className="mt-1 text-xs text-rose-600">{guestForm.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              {...guestForm.register('description')}
              placeholder="Describe the event, talk or achievement..."
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            {guestForm.formState.errors.description && (
              <p className="mt-1 text-xs text-rose-600">
                {guestForm.formState.errors.description.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Evidence URLs <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => guestEvidenceArray.append({ url: '' })}
                className="text-xs font-semibold text-brand-600 hover:text-brand-800"
              >
                + Add Another URL
              </button>
            </div>

            {guestEvidenceArray.fields.map((field, idx) => (
              <div key={field.id} className="mt-2 flex items-center gap-2">
                <input
                  type="url"
                  {...guestForm.register(`evidenceUrls.${idx}.url` as const)}
                  placeholder="https://example.com/certificate.pdf"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
                {guestEvidenceArray.fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => guestEvidenceArray.remove(idx)}
                    className="rounded p-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {guestForm.formState.errors.evidenceUrls && (
              <p className="mt-1 text-xs text-rose-600">
                {guestForm.formState.errors.evidenceUrls.message ||
                  guestForm.formState.errors.evidenceUrls.root?.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 shadow-sm"
          >
            {isPending ? 'Submitting Guest Achievement...' : 'Submit as Guest'}
          </button>
        </form>
      )}
    </div>
  );
};
