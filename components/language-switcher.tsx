'use client'

import { useState } from 'react'
import { Check, Globe } from 'lucide-react'
import { LANGUAGES, type Language, useLanguage } from '@/lib/language-context'

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const currentOption = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0]

  const handleSelect = (langCode: Language) => {
    setLanguage(langCode)
    setOpen(false)
  }

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-[#f36f2b] hover:bg-white hover:text-[#f36f2b]"
        aria-label="Change language"
      >
        <Globe className="size-3.5 text-[#f36f2b]" />
        <span>{currentOption.flag}</span>
        <span>{currentOption.nativeName}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 max-h-80 w-52 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl backdrop-blur-xl">
            <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t('selectLanguage')}
            </p>
            <div className="mt-1 flex flex-col gap-0.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    language === lang.code
                      ? 'bg-orange-50 text-[#f36f2b]'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#102a43]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                    <span className="text-[10px] text-slate-400">({lang.name})</span>
                  </span>
                  {language === lang.code && <Check className="size-3.5 text-[#f36f2b]" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
