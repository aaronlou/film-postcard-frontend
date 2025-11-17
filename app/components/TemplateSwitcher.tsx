'use client';

import { TemplateType } from '../types/template';
import { TEMPLATE_CONFIGS } from '../config/templates';

interface TemplateSwitcherProps {
  currentTemplate: TemplateType;
  onTemplateChange: (template: TemplateType) => void;
}

export default function TemplateSwitcher({ currentTemplate, onTemplateChange }: TemplateSwitcherProps) {
  return (
    <div className="flex gap-3 justify-center mb-8">
      {TEMPLATE_CONFIGS.map((template) => (
        <button
          key={template.id}
          onClick={() => onTemplateChange(template.id)}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all
            ${currentTemplate === template.id
              ? 'bg-stone-800 text-white shadow-lg'
              : 'bg-white/60 text-stone-700 hover:bg-white border border-stone-200'
            }
          `}
        >
          <span className="text-xl">{template.icon}</span>
          <span>{template.nameCN}</span>
        </button>
      ))}
    </div>
  );
}
