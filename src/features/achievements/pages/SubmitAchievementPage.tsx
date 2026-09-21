import { Link, useNavigate } from 'react-router-dom';
import { AchievementForm } from '../components/AchievementForm';
import { ArrowLeftIcon } from '@/components/ui/Icons';

export const SubmitAchievementPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            to="/achievements"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-800"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            <span>Back to My Achievements</span>
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Submit an Achievement</h1>
          <p className="mt-1 text-sm text-gray-600">
            Submit your certifications, hackathon victories, research publications, or leadership roles for CESA Leaderboard verification.
          </p>
        </div>
      </div>

      <AchievementForm onSuccess={() => navigate('/achievements')} />
    </div>
  );
};
