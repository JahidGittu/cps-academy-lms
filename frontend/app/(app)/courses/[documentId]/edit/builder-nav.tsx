import Link from 'next/link';
import { BookOpen, Users, Eye, Lock, ArrowRight, ArrowLeft, Layers, HelpCircle, ExternalLink } from 'lucide-react';

export type Section = 'details' | 'lessons' | 'quiz';

export const BuilderNav = ({
  section,
  lessons,
  hasQuiz,
  courseId,
  courseTitle = 'Course Studio',
  isNewCourse = false,
  onSelect,
}: {
  section: Section;
  lessons: number;
  hasQuiz: boolean;
  courseId?: string;
  courseTitle?: string;
  isNewCourse?: boolean;
  onSelect: (next: Section) => void;
}) => {
  const items = [
    {
      key: 'details' as const,
      icon: Layers,
      label: 'Course Info',
      hint: isNewCourse ? 'Step 1: Setup' : 'Title & Thumbnail',
    },
    {
      key: 'lessons' as const,
      icon: isNewCourse ? Lock : BookOpen,
      label: 'Curriculum',
      hint: isNewCourse ? 'Step 2 (Locked)' : `${lessons} Lessons in Syllabus`,
    },
    {
      key: 'quiz' as const,
      icon: isNewCourse ? Lock : HelpCircle,
      label: 'Quiz Assessment',
      hint: isNewCourse ? 'Step 3 (Locked)' : (hasQuiz ? '1 Quiz Added' : 'Not Added'),
    },
  ];

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0 lg:sticky lg:top-20 z-10">
      {/* Studio Header Card */}
      <div className="hidden lg:block rounded-xl border border-theme bg-surface p-3.5 shadow-2xs mb-2">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <BookOpen className="size-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-primary">{courseTitle}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold tracking-wider text-muted uppercase">
                {isNewCourse ? 'Draft' : 'Course Builder'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex gap-1.5 overflow-x-auto lg:flex-col">
        {items.map(({ key, icon: Icon, label, hint }) => {
          const isLocked = isNewCourse && key !== 'details';
          const isActive = section === key;

          return (
            <button
              key={key}
              type="button"
              disabled={isLocked}
              onClick={() => !isLocked && onSelect(key)}
              className={`flex shrink-0 items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all cursor-pointer ${
                isLocked
                  ? 'opacity-50 cursor-not-allowed bg-canvas border-theme text-muted'
                  : isActive
                  ? 'border-sky-500/40 bg-sky-500/15 text-sky-400 font-bold shadow-xs'
                  : 'border-theme bg-surface text-secondary hover:bg-elevated hover:text-primary'
              }`}
            >
              <Icon className={`size-4.5 shrink-0 ${isActive && !isLocked ? 'text-sky-400' : 'text-muted'}`} />

              <span className="leading-tight">
                <span className="block text-xs sm:text-sm font-semibold">{label}</span>
                <span className="hidden text-[11px] text-muted font-normal lg:block mt-0.5">{hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Step Progression: Next / Finish Action Buttons */}
      {!isNewCourse && (
        <div className="hidden lg:flex lg:flex-col gap-2 pt-3 border-t border-subtle mt-1">
          {section === 'details' && (
            <button
              type="button"
              onClick={() => onSelect('lessons')}
              className="flex items-center justify-between gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-3 text-xs font-bold text-white shadow-md shadow-sky-600/20 hover:shadow-sky-500/30 cursor-pointer transition-all"
            >
              <span>Next: Curriculum</span>
              <ArrowRight className="size-4" />
            </button>
          )}

          {section === 'lessons' && (
            <button
              type="button"
              onClick={() => onSelect('quiz')}
              className="flex items-center justify-between gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-3 text-xs font-bold text-white shadow-md shadow-sky-600/20 hover:shadow-sky-500/30 cursor-pointer transition-all"
            >
              <span>Next: Quiz Assessment</span>
              <ArrowRight className="size-4" />
            </button>
          )}

          {section === 'quiz' && courseId && (
            <div className="space-y-2">
              <a
                href={`/courses/${courseId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:shadow-emerald-500/30 transition-all"
              >
                <span>View Live Course ↗</span>
                <ExternalLink className="size-4" />
              </a>

              <button
                type="button"
                onClick={() => onSelect('lessons')}
                className="w-full flex items-center justify-between gap-2 rounded-xl border border-theme bg-surface px-4 py-2.5 text-xs font-bold text-secondary hover:bg-elevated hover:text-primary cursor-pointer transition-all"
              >
                <span className="flex items-center gap-1.5">
                  <ArrowLeft className="size-3.5" />
                  <span>Back to Curriculum</span>
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Studio Links */}
      {courseId && (
        <div className="hidden lg:flex lg:flex-col gap-1.5 pt-3 border-t border-subtle">
          <Link
            href={`/courses/${courseId}/students`}
            className="flex items-center gap-2.5 rounded-xl border border-theme bg-surface px-3.5 py-2.5 text-xs font-semibold text-secondary hover:bg-elevated hover:text-sky-400 transition"
          >
            <Users className="size-4 text-muted" />
            <span>Students Roster</span>
          </Link>

          <a
            href={`/courses/${courseId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-xl border border-theme bg-surface px-3.5 py-2.5 text-xs font-semibold text-secondary hover:bg-elevated hover:text-sky-400 transition"
          >
            <Eye className="size-4 text-muted" />
            <span>Live Course Page ↗</span>
          </a>
        </div>
      )}
    </nav>
  );
};
