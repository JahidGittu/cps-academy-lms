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
              className={`flex shrink-0 items-center gap-2.5 rounded border px-3 py-2.5 text-left transition ${
                isLocked
                  ? 'opacity-60 cursor-not-allowed bg-slate-50/80 border-slate-200/60 text-slate-400'
                  : section === key
                  ? 'border-brand-300 bg-brand-50/90 text-brand-800 font-bold shadow-2xs cursor-pointer'
                  : 'border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer'
              }`}
            >
              <Icon className={`size-4 shrink-0 ${section === key && !isLocked ? 'text-brand-600' : 'text-slate-400'}`} />

              <span className="leading-tight">
                <span className="block text-xs sm:text-sm">{label}</span>
                <span className="hidden text-xs text-slate-400 font-normal lg:block">{hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      {courseId && (
        <div className="hidden lg:flex lg:flex-col gap-1.5 pt-3 border-t border-slate-200/80">
          <Link
            href={`/courses/${courseId}/students`}
            className="flex items-center gap-2.5 rounded border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition"
          >
            <Users className="size-4 text-slate-400" />
            <span>Students Roster</span>
          </Link>

          <Link
            href={`/courses/${courseId}`}
            className="flex items-center gap-2.5 rounded border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition"
          >
            <Eye className="size-4 text-slate-400" />
            <span>Preview Course</span>
          </Link>
        </div>
      )}
    </nav>
  );
};
