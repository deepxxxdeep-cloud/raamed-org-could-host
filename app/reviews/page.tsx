import { Quote } from 'lucide-react'
import { SiteFooter, SiteHeader, SectionIntro } from '@/components/site-shell'

const reviewList = [
  ['Dr. Meera Kulkarni', 'Medical Director, Asterline Hospital', 'Raamed helped us standardise our monitoring equipment across three departments. The team understood our workflow before recommending anything.'],
  ['Dr. Arjun Malhotra', 'Consultant Surgeon, Northview Clinic', 'Clear documentation, responsive service, and equipment that performs consistently. It is rare to get all three from one partner.'],
  ['Sonal Iyer', 'Procurement Lead, CareBridge Network', 'Their regional support makes a real difference. We can get a practical answer quickly, even after installation.'],
]

export default function ReviewsPage() { return <main className="bg-[#f7fafb] text-[#102a43]"><SiteHeader /><section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><SectionIntro eyebrow="Reviews" title="Trusted by the people behind care." text="The best measure of our work is what clinical and procurement teams say after they have worked with us." /><div className="mt-14 grid gap-5 lg:grid-cols-3">{reviewList.map(([name, role, text]) => <article key={name} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><Quote className="size-8 text-[#f36f2b]" /><p className="mt-7 text-lg leading-8 text-slate-700">“{text}”</p><div className="mt-8 border-t border-slate-200 pt-5"><p className="font-bold">{name}</p><p className="mt-1 text-sm text-slate-500">{role}</p></div></article>)}</div></section><SiteFooter /></main> }
