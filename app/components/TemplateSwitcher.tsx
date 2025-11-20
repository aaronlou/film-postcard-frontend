'use client';

import { TemplateType } from '../types/template';
import { TEMPLATE_CONFIGS } from '../config/templates';

interface TemplateSwitcherProps {
  currentTemplate: TemplateType;
  onTemplateChange: (template: TemplateType) => void;
}

export default function TemplateSwitcher({ currentTemplate, onTemplateChange }: TemplateSwitcherProps) {
  return (
    <div className="flex gap-2 sm:gap-3 justify-center mb-6 sm:mb-8 overflow-x-auto px-4 sm:px-0 pb-2 scrollbar-hide">
      {TEMPLATE_CONFIGS.map((template) => (
        <button
          key={template.id}
          onClick={() => onTemplateChange(template.id)}
          className={`
            flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all flex-shrink-0 text-sm sm:text-base
            ${currentTemplate === template.id
              ? 'bg-stone-800 text-white shadow-lg'
              : 'bg-white/60 text-stone-700 hover:bg-white border border-stone-200'
            }
          `}
        >
          <span className="text-lg sm:text-xl">{template.icon}</span>
          <span className="whitespace-nowrap">{template.nameCN}</span>
        </button>
      ))}
    </div>
  );
}
