import { BookOpen, ClipboardList, Settings } from 'lucide-react';

export type Section = 'details' | 'lessons' | 'quiz';

// Three panels, one at a time. The old screen stacked all three down one page, which put the delete
// button somewhere you scroll past on the way to writing a lesson.
export const BuilderNav = ({
  section,
  lessons,
  hasQuiz,
  onSelect,
}: {
  section: Section;
  lessons: number;
  hasQuiz: boolean;
  onSelect: (next: Section) => void;
}) => {
  const items = [
    { key: 'details' as const, icon: Settings, label: 'Course details', hint: 'Title and cover' },
    {
      key: 'lessons' as const,
      icon: BookOpen,
      label: 'Lessons',
      hint: `${lessons} in the syllabus`,
    },
    {
      key: 'quiz' as const,
      icon: ClipboardList,
      label: 'Quiz',
      hint: hasQuiz ? 'Written' : 'Not added yet',
    },
  ];

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
      {items.map(({ key, icon: Icon, label, hint }) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key)}
          className={`flex shrink-0 items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition ${
            section === key
              ? 'border-brand-200 bg-brand-50 text-brand-700'
              : 'border-transparent text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Icon className="size-4 shrink-0" />

          <span className="leading-tight">
            <span className="block text-sm font-medium">{label}</span>
            <span className="hidden text-xs text-slate-500 lg:block">{hint}</span>
          </span>
        </button>
      ))}
    </nav>
  );
};
