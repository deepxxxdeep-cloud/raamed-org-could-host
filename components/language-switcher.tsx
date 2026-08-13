'use client'

import { useEffect, useState } from 'react'
import { Check, Globe } from 'lucide-react'
import { LANGUAGES, type Language, useLanguage } from '@/lib/language-context'

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const currentOption = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0]

  useEffect(() => {
    // Inject Google Translate script if not already present for auto-translation option
    const existingScript = document.getElementById('google-translate-script')
    if (!existingScript) {
      const script = document.createElement('script')
      script.id = 'google-translate-script'
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      document.body.appendChild(script)

      window.googleTranslateElementInit = () => {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            { pageLanguage: 'en', autoDisplay: false },
            'google_translate_element'
          )
        }
      }
    }
  }, [])

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
          <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl backdrop-blur-xl">
            <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t('selectLanguage')}
            </p>
            <div className="mt-1 flex flex-col gap-0.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code)
                    setOpen(false)
                  }}
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

            <div className="mt-2 border-t border-slate-100 pt-2">
              <div id="google_translate_element" className="scale-90 transform-gpu opacity-80" />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

declare global {
  interface Window {
    googleTranslateElementInit?: () => void
    google?: {
      translate?: {
        TranslateElement: new (options: Record<string, unknown>, elementId: string) => void
      }
    }
  }
}
