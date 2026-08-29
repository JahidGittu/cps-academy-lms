import Link from 'next/link';
import { BookOpen, ClipboardList, Settings, Users, Eye, Lock } from 'lucide-react';

export type Section = 'details' | 'lessons' | 'quiz';

export const BuilderNav = ({
  section,
  lessons,
  hasQuiz,
  courseId,
  isNewCourse = false,
  onSelect,
}: {
  section: Section;
  lessons: number;
  hasQuiz: boolean;
  courseId?: string;
  isNewCourse?: boolean;
  onSelect: (next: Section) => void;
}) => {
  const items = [
    { key: 'details' as const, icon: Settings, label: 'Course Details', hint: isNewCourse ? 'Step 1: Setup' : 'Title & cover' },
    {
      key: 'lessons' as const,
      icon: isNewCourse ? Lock : BookOpen,
      label: 'Lessons',
      hint: isNewCourse ? 'Step 2 (Locked)' : `${lessons} in syllabus`,
    },
    {
      key: 'quiz' as const,
      icon: isNewCourse ? Lock : ClipboardList,
      label: 'Quiz',
      hint: isNewCourse ? 'Step 3 (Locked)' : (hasQuiz ? 'Added' : 'None'),
    },
  ];

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0 lg:sticky lg:top-20 z-10">
      <div className="flex gap-1.5 overflow-x-auto lg:flex-col">
        {items.map(({ key, icon: Icon, label, hint }) => {
          const isLocked = isNewCourse && key !== 'details';

          return (
            <button
              key={key}
              type="button"
              disabled={isLocked}
              onClick={() => !isLocked && onSelect(key)}
              className={`flex shrink-0 items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition ${
                isLocked
                  ? 'opacity-60 cursor-not-allowed bg-canvas border-theme text-muted'
                  : section === key
                  ? 'border-brand-border bg-brand-subtle text-brand font-bold shadow-2xs cursor-pointer'
                  : 'border-theme bg-surface text-secondary hover:bg-elevated hover:text-primary cursor-pointer'
              }`}
            >
              <Icon className={`size-4 shrink-0 ${section === key && !isLocked ? 'text-brand' : 'text-muted'}`} />

              <span className="leading-tight">
                <span className="block text-xs sm:text-sm">{label}</span>
                <span className="hidden text-xs text-muted font-normal lg:block">{hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      {courseId && (
        <div className="hidden lg:flex lg:flex-col gap-1.5 pt-3 border-t border-subtle">
          <Link
            href={`/courses/${courseId}/students`}
            className="flex items-center gap-2.5 rounded-lg border border-theme bg-surface px-3 py-2 text-xs font-semibold text-secondary hover:bg-elevated hover:text-brand transition"
          >
            <Users className="size-4 text-muted" />
            <span>Students Roster</span>
          </Link>

          <Link
            href={`/courses/${courseId}`}
            className="flex items-center gap-2.5 rounded-lg border border-theme bg-surface px-3 py-2 text-xs font-semibold text-secondary hover:bg-elevated hover:text-brand transition"
          >
            <Eye className="size-4 text-muted" />
            <span>Preview Course</span>
          </Link>
        </div>
      )}
    </nav>
  );
};
