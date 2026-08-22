'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Building2, Database, Edit3, ExternalLink, FileSpreadsheet, HardDrive, ImagePlus, MapPin, Menu, Phone, PlusCircle, Printer, Trash2, X } from 'lucide-react'
import { FestivalModeAdmin } from '@/components/festival-mode-admin'
import { ProductMediaAdmin } from '@/components/product-media-admin'
import { RammedGalleryAdmin } from '@/components/rammed-gallery-admin'

type Product = {
  _id?: string
  name: string
  category: string
  description: string
  image?: string
  images?: string[]
}
type Lead = {
  _id?: string
  name?: string
  email?: string
  phone?: string
  organization?: string
  address?: string
  message?: string
  productName?: string
  createdAt?: string
  status?: 'Pending' | 'Finalized' | 'Not Finalized' | string
  finalAmount?: string
  reason?: string
  isPrinted?: boolean
  printedAt?: string
}
type Metrics = {
  visitors: number
  quotes: number
  daily: number
  monthly: number
  yearly: number
  products: { name: string; clicks: number }[]
}
type Office = {
  _id?: string
  city: string
  state?: string
  label?: string
  isMain?: boolean
  address: string
  phone?: string
  mobile?: string
  mapUrl?: string
}
type StorageData = {
  mongo: {
    totalMB: number
    usedMB: number
    freeMB: number
    usagePercent: number
    warningLimitMB: number
    isWarning: boolean
  }
  media: {
    totalMB: number
    usedMB: number
    freeMB: number
    usagePercent: number
    productsCount: number
  }
  leads: {
    total: number
    printed: number
    unprinted: number
  }
}

export default function AdminPage() {
  const [active, setActive] = useState('Overview')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loaded, setLoaded] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [storageStats, setStorageStats] = useState<StorageData | null>(null)
  const [metrics, setMetrics] = useState<Metrics>({
    visitors: 0,
    quotes: 0,
    daily: 0,
    monthly: 0,
    yearly: 0,
    products: [],
  })
  const [settings, setSettings] = useState({ phone: '', whatsapp: '', email: '' })
  const [message, setMessage] = useState('')

  // Deal tracking state
  const [dealModalLead, setDealModalLead] = useState<Lead | null>(null)
  const [dealStatus, setDealStatus] = useState<'Pending' | 'Finalized' | 'Not Finalized'>('Pending')
  const [dealAmount, setDealAmount] = useState('')
  const [dealReason, setDealReason] = useState('')
  const [updatingDeal, setUpdatingDeal] = useState(false)

  // Regional Offices state
  const [offices, setOffices] = useState<Office[]>([])
  const [officeForm, setOfficeForm] = useState<Office>({
    city: '',
    state: '',
    label: '',
    address: '',
    phone: '',
    mobile: '',
    mapUrl: '',
    isMain: false,
  })
  const [editingOfficeId, setEditingOfficeId] = useState<string | null>(null)
  const [officeSaving, setOfficeSaving] = useState(false)

  // Product form state
  const [form, setForm] = useState({ name: '', category: '', description: '' })
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [newCategory, setNewCategory] = useState(false)

  const nav = ['Overview', 'Products', 'Product Media', 'Rammed Gallery', 'Regional Offices', 'Leads & enquiries', 'Analytics', 'Festival Mode', 'Settings']

  const loadOffices = async () => {
    try {
      const res = await fetch('/api/admin/offices')
      if (res.ok) {
        setOffices(await res.json())
      }
    } catch {
      // Ignore
    }
  }

  const loadStorage = async () => {
    try {
      const res = await fetch('/api/admin/storage')
      if (res.ok) {
        setStorageStats(await res.json())
      }
    } catch {
      // Ignore
    }
  }

  const load = async () => {
    const [p, l, a, s, o, st] = await Promise.all([
      fetch('/api/admin/products'),
      fetch('/api/admin/quotes'),
      fetch('/api/admin/analytics'),
      fetch('/api/admin/settings'),
      fetch('/api/admin/offices'),
      fetch('/api/admin/storage'),
    ])
    if (p.ok) {
      setProducts(await p.json())
      setLoaded(true)
    }
    if (l.ok) setLeads((await l.json()).quotes || [])
    if (a.ok) setMetrics(await a.json())
    if (s.ok) setSettings(await s.json())
    if (o.ok) setOffices(await o.json())
    if (st.ok) setStorageStats(await st.json())
  }

  useEffect(() => {
    load()
  }, [])

  const purgePrintedLeads = async () => {
    if (!confirm('Are you sure you want to delete all PRINTED leads to free up storage?')) return
    try {
      const res = await fetch('/api/admin/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'purge_printed' }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessage(data.message || 'Purged printed leads.')
        load()
      }
    } catch {
      alert('Failed to purge printed leads.')
    }
  }

  const forceDeleteOldestLeads = async () => {
    if (!confirm('⚠️ WARNING: You are force deleting oldest leads (printed & unprinted). Continue?')) return
    try {
      const res = await fetch('/api/admin/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'force_delete_oldest', limit: 5 }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessage(data.message || 'Force deleted oldest leads.')
        load()
      }
    } catch {
      alert('Failed to force delete oldest leads.')
    }
  }

  const markAllLeadsPrinted = async () => {
    try {
      await fetch('/api/admin/quotes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_printed' }),
      })
      window.print()
      load()
    } catch {
      window.print()
    }
  }

  function exportLeadsToCSV() {
    if (!leads || !leads.length) {
      alert('No leads available to export.')
      return
    }

    const headers = [
      'S.No',
      'Date',
      'Product Name',
      'Client Name',
      'Organization',
      'Phone',
      'Email',
      'Address',
      'Requirement Details',
      'Deal Status',
      'Final Deal Amount',
      'Rejection Reason',
      'Printed Status',
    ]

    const rows = leads.map((l, index) => [
      index + 1,
      l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'N/A',
      `"${(l.productName || 'General Enquiry').replace(/"/g, '""')}"`,
      `"${(l.name || 'Unnamed').replace(/"/g, '""')}"`,
      `"${(l.organization || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.address || '').replace(/"/g, '""')}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`,
      `"${(l.status || 'Pending').replace(/"/g, '""')}"`,
      `"${(l.finalAmount || '').replace(/"/g, '""')}"`,
      `"${(l.reason || '').replace(/"/g, '""')}"`,
      l.isPrinted ? 'Printed' : 'Not Printed',
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Raamed_Leads_Report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  async function saveOffice(e: React.FormEvent) {
    e.preventDefault()
    if (!officeForm.city || !officeForm.address) {
      alert('City and Full Address are required!')
      return
    }
    setOfficeSaving(true)
    try {
      const isEdit = Boolean(editingOfficeId)
      const url = '/api/admin/offices'
      const method = isEdit ? 'PUT' : 'POST'
      const payload = isEdit ? { ...officeForm, _id: editingOfficeId } : officeForm

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setMessage(isEdit ? 'Office updated successfully!' : 'New office added successfully!')
        setOfficeForm({ city: '', state: '', label: '', address: '', phone: '', mobile: '', mapUrl: '', isMain: false })
        setEditingOfficeId(null)
        loadOffices()
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to save office')
      }
    } catch {
      alert('Server error saving office')
    } finally {
      setOfficeSaving(false)
    }
  }

  async function deleteOffice(office: Office) {
    if (!confirm(`Are you sure you want to delete ${office.city} office?`)) return
    try {
      const res = await fetch(`/api/admin/offices?id=${office._id || ''}&city=${encodeURIComponent(office.city)}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setMessage(`Deleted ${office.city} office.`)
        loadOffices()
      }
    } catch {
      alert('Failed to delete office')
    }
  }

  function startEditOffice(office: Office) {
    setEditingOfficeId(office._id || office.city)
    setOfficeForm({
      city: office.city || '',
      state: office.state || '',
      label: office.label || '',
      address: office.address || '',
      phone: office.phone || '',
      mobile: office.mobile || '',
      mapUrl: office.mapUrl || '',
      isMain: Boolean(office.isMain),
    })
  }

  function cancelEditOffice() {
    setEditingOfficeId(null)
    setOfficeForm({ city: '', state: '', label: '', address: '', phone: '', mobile: '', mapUrl: '', isMain: false })
  }

  const openDealModal = (lead: Lead) => {
    setDealModalLead(lead)
    const st = (lead.status as 'Pending' | 'Finalized' | 'Not Finalized') || 'Pending'
    setDealStatus(st === 'Finalized' || st === 'Not Finalized' ? st : 'Pending')
    setDealAmount(lead.finalAmount || '')
    setDealReason(lead.reason || '')
  }

  const saveDealStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dealModalLead) return
    setUpdatingDeal(true)

    try {
      const res = await fetch('/api/admin/quotes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: dealModalLead._id,
          email: dealModalLead.email,
          status: dealStatus,
          finalAmount: dealStatus === 'Finalized' ? dealAmount : '',
          reason: dealStatus === 'Not Finalized' ? dealReason : '',
        }),
      })

      if (res.ok) {
        setMessage(`Updated deal status for ${dealModalLead.name || 'lead'}`)
        setDealModalLead(null)
        load()
      } else {
        alert('Failed to update deal status')
      }
    } catch {
      alert('Error updating deal status')
    } finally {
      setUpdatingDeal(false)
    }
  }

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products]
  )

  const allProducts = products

  async function upload(file: File) {
    const data = new FormData()
    data.append('file', file)
    const r = await fetch('/api/admin/upload', { method: 'POST', body: data })
    const result = await r.json()
    if (!r.ok) throw new Error(result.error || 'Upload failed')
    return result.url
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    if (images.length + files.length > 5) {
      alert(`You can upload a maximum of 5 photos per product. You currently have ${images.length} photo(s).`)
      return
    }
    setUploading(true)
    setMessage('')
    try {
      const newUrls: string[] = []
      for (const file of files) {
        const url = await upload(file)
        newUrls.push(url)
      }
      setImages((prev) => [...prev, ...newUrls].slice(0, 5))
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Photo upload failed'
      alert(errorMsg)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function removeImage(indexToRemove: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault()
    if (images.length < 1) {
      alert('Please upload at least 1 photo for the product (maximum 5).')
      return
    }
    const payload = {
      ...form,
      images,
      image: images[0] || '',
    }
    const r = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (r.ok) {
      setMessage('Product published with ' + images.length + ' photo(s).')
      setForm({ name: '', category: '', description: '' })
      setImages([])
      setNewCategory(false)
      load()
    } else {
      const res = await r.json()
      alert(res.error || 'Could not publish product')
    }
  }

  async function removeProduct(product: Product) {
    if (!confirm(`Remove ${product.name}?`)) return
    const query = product._id
      ? `id=${encodeURIComponent(product._id)}`
      : `name=${encodeURIComponent(product.name)}`
    const r = await fetch(`/api/admin/products?${query}`, { method: 'DELETE' })
    setMessage(r.ok ? 'Product removed.' : 'Could not remove product.')
    load()
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault()
    const r = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setMessage(r.ok ? 'Website settings saved.' : 'Could not save settings.')
  }

  return (
    <main className="min-h-screen bg-[#f6f9fa] text-[#102a43]">
      {/* Global Print Styles */}
      <style jsx global>{`
        @media print {
          body, main, section {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          aside, header, nav, .no-print, button, form, .storage-banner, .action-column {
            display: none !important;
          }
          section {
            padding-left: 0 !important;
          }
          .print-header {
            display: block !important;
          }
          .print-container {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 11px !important;
          }
          th, td {
            border: 1px solid #cbd5e1 !important;
            padding: 8px !important;
          }
        }
      `}</style>

      {/* Official Print Header (Visible only on print/PDF output) */}
      <div className="hidden print-header p-4 mb-4">
        <div className="flex items-center justify-between border-b-2 border-[#102a43] pb-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#102a43]">RAAMED HEALTHCARE EQUIPMENT</h1>
            <p className="text-xs font-semibold text-slate-600">Official Client Lead Enquiries & Deal Status Report</p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p className="font-bold">Date: {new Date().toLocaleDateString()}</p>
            <p>Total Leads: {leads.length}</p>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-[#dce8eb] bg-white p-6 lg:block z-30 no-print">
        <a href="/" className="text-xl font-bold">
          Raamed
          <span className="block text-xs font-normal text-[#6f8793]">Admin workspace</span>
        </a>
        <nav className="mt-12 grid gap-2">
          {nav.map((item) => (
            <button
              key={item}
              onClick={() => setActive(item)}
              className={`rounded-xl px-4 py-3 text-left text-sm transition ${
                active === item ? 'bg-[#e5f4f2] font-bold text-[#f36f2b]' : 'text-[#5a7484] hover:bg-slate-50'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Slide-out Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileNavOpen(false)}
          />

          {/* Drawer content panel */}
          <div className="fixed inset-y-0 left-0 w-72 bg-white p-6 shadow-2xl flex flex-col justify-between z-50">
            <div>
              <div className="flex items-center justify-between">
                <a href="/" className="text-xl font-bold">
                  Raamed
                  <span className="block text-xs font-normal text-[#6f8793]">Admin workspace</span>
                </a>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close menu"
                >
                  <X className="size-6" />
                </button>
              </div>

              <nav className="mt-10 grid gap-2">
                {nav.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setActive(item)
                      setMobileNavOpen(false)
                    }}
                    className={`rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                      active === item
                        ? 'bg-[#e5f4f2] font-bold text-[#f36f2b] border-l-4 border-[#f36f2b]'
                        : 'text-[#5a7484] hover:bg-slate-50'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </nav>
            </div>

            <div className="border-t border-slate-100 pt-4 text-xs text-slate-400">
              Logged in as Admin • Raamed IDE
            </div>
          </div>
        </div>
      )}

      <section className="lg:pl-72">
        {/* Header with Mobile Menu Button */}
        <header className="border-b border-[#dce8eb] bg-white px-5 py-4 flex items-center justify-between lg:px-8 no-print">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6f8793]">Raamed operations</p>
            <h1 className="text-2xl font-semibold mt-0.5">{active}</h1>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-white hover:text-[#f36f2b] lg:hidden"
            aria-label="Open menu options"
          >
            <Menu className="size-5 text-[#f36f2b]" />
            <span>Options</span>
          </button>
        </header>

        <div className="p-5 lg:p-8">
          {message && (
            <p className="mb-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>
          )}

          {/* Storage Warning Banner when storage > 480MB or threshold met */}
          {storageStats?.mongo.isWarning && (
            <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:p-5 shadow-sm text-[#102a43] no-print">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="size-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-amber-900 text-base">⚠️ Storage Warning: MongoDB Near Capacity ({storageStats.mongo.usedMB} MB / 512 MB)</h3>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      Storage usage is above <strong className="underline">480 MB</strong>. To prevent database overflow, clean up printed leads or purge oldest records.
                    </p>

                    {storageStats.leads.unprinted > 0 ? (
                      <div className="mt-3 rounded-xl bg-white/80 p-3 border border-amber-200 text-xs text-amber-900">
                        <p className="font-bold text-red-700">
                          ⚠️ Warning: You have {storageStats.leads.unprinted} unprinted lead(s)! Please print them before purging.
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={markAllLeadsPrinted}
                            className="rounded-lg bg-emerald-700 px-3 py-1.5 font-bold text-white shadow-sm hover:bg-emerald-800"
                          >
                            🖨️ Print & Mark All Leads Now
                          </button>
                          <button
                            type="button"
                            onClick={purgePrintedLeads}
                            className="rounded-lg bg-amber-700 px-3 py-1.5 font-bold text-white shadow-sm hover:bg-amber-800"
                          >
                            🗑️ Delete Printed Leads ({storageStats.leads.printed})
                          </button>
                          <button
                            type="button"
                            onClick={forceDeleteOldestLeads}
                            className="rounded-lg border border-red-300 bg-red-100 px-3 py-1.5 font-bold text-red-800 hover:bg-red-200"
                          >
                            ⚠️ Force Delete Oldest Leads
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={purgePrintedLeads}
                          className="rounded-lg bg-emerald-700 px-3 py-1.5 font-bold text-white shadow-sm hover:bg-emerald-800"
                        >
                          🗑️ Clean Up Printed Leads ({storageStats.leads.printed})
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Storage & Database Analytics Gauge Cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-2 no-print">
            {/* MongoDB Storage Gauge */}
            <div className="rounded-2xl border border-[#dce8eb] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="size-5 text-[#f36f2b]" />
                  <h3 className="font-semibold text-base text-[#102a43]">MongoDB Database Storage</h3>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                  512 MB Quota
                </span>
              </div>

              {storageStats ? (
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                    <span>Used: {storageStats.mongo.usedMB} MB</span>
                    <span>Free: {storageStats.mongo.freeMB} MB</span>
                  </div>

                  <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        storageStats.mongo.isWarning ? 'bg-red-500' : 'bg-[#f36f2b]'
                      }`}
                      style={{ width: `${Math.min(100, storageStats.mongo.usagePercent)}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>Usage: {storageStats.mongo.usagePercent}%</span>
                    <span>Warning limit: 480 MB</span>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-xs text-slate-400">Loading database storage stats...</p>
              )}
            </div>

            {/* Vercel & Media Storage Gauge */}
            <div className="rounded-2xl border border-[#dce8eb] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="size-5 text-[#0c6670]" />
                  <h3 className="font-semibold text-base text-[#102a43]">Vercel & Product Photos Storage</h3>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                  1,024 MB (1GB) Quota
                </span>
              </div>

              {storageStats ? (
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                    <span>Media Used: {storageStats.media.usedMB} MB</span>
                    <span>Free: {storageStats.media.freeMB} MB</span>
                  </div>

                  <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-[#0c6670] transition-all duration-500 rounded-full"
                      style={{ width: `${Math.min(100, storageStats.media.usagePercent)}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>Products: {storageStats.media.productsCount} items</span>
                    <span>Usage: {storageStats.media.usagePercent}%</span>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-xs text-slate-400">Loading media storage stats...</p>
              )}
            </div>
          </div>

          {active === 'Overview' && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  ['All visitors', metrics.visitors],
                  ['All quotes', metrics.quotes],
                  ['Today', metrics.daily],
                  ['This month', metrics.monthly],
                  ['This year', metrics.yearly],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-2xl border border-[#dce8eb] bg-white p-5">
                    <p className="text-sm text-[#6f8793]">{label}</p>
                    <p className="mt-2 text-3xl font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-[#dce8eb] bg-white p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Recent quote enquiries</h2>
                  <button onClick={() => setActive('Leads & enquiries')} className="text-sm text-[#f36f2b]">
                    View all
                  </button>
                </div>
                <div className="mt-4 grid gap-3">
                  {leads.slice(0, 5).map((lead, i) => (
                    <div key={i} className="flex justify-between border-b border-[#edf2f3] pb-3 text-sm">
                      <span className="font-medium">
                        {lead.name || 'Unnamed'}
                        <span className="ml-2 text-[#6f8793]">{lead.organization}</span>
                      </span>
                      <span className="text-[#6f8793]">{lead.email}</span>
                    </div>
                  ))}
                  {!leads.length && <p className="text-sm text-[#6f8793]">No enquiries yet.</p>}
                </div>
              </div>
            </>
          )}

          {active === 'Products' && (
            <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
              <form onSubmit={saveProduct} className="rounded-2xl border border-[#dce8eb] bg-white p-5">
                <h2 className="font-semibold">Add product</h2>
                <div className="mt-4 grid gap-3">
                  <input
                    required
                    placeholder="Product name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="rounded-xl border p-3"
                  />
                  <select
                    required={!newCategory}
                    value={newCategory ? '__new__' : form.category}
                    onChange={(e) => {
                      if (e.target.value === '__new__') {
                        setNewCategory(true)
                        setForm({ ...form, category: '' })
                      } else setForm({ ...form, category: e.target.value })
                    }}
                    className="rounded-xl border p-3"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                    <option value="__new__">+ New category</option>
                  </select>

                  {newCategory && (
                    <input
                      required
                      placeholder="New category name"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="rounded-xl border p-3"
                    />
                  )}

                  <textarea
                    required
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="min-h-28 rounded-xl border p-3"
                  />

                  {/* Multi-Photo Upload Section */}
                  <div className="rounded-xl border border-dashed border-[#dce8eb] p-4 bg-[#fbfdfd]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#0c6670]">
                        Product Photos (1 to 5 photos)
                      </label>
                      <span className="text-xs font-semibold text-[#6f8793]">
                        {images.length} / 5 uploaded
                      </span>
                    </div>

                    {images.length > 0 && (
                      <div className="mt-3 grid grid-cols-5 gap-2">
                        {images.map((imgUrl, idx) => (
                          <div key={idx} className="relative group size-16 overflow-hidden rounded-lg border border-slate-200 bg-white">
                            <img src={imgUrl} alt={`Product ${idx + 1}`} className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-0.5 right-0.5 grid size-5 place-items-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
                              title="Remove photo"
                            >
                              <X className="size-3" />
                            </button>
                            {idx === 0 && (
                              <span className="absolute bottom-0 inset-x-0 bg-[#f36f2b] text-[9px] font-bold text-center text-white py-0.5">
                                Main
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {images.length < 5 && (
                      <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#dce8eb] bg-white py-3 text-sm font-semibold text-[#f36f2b] transition hover:border-[#f36f2b] hover:bg-orange-50">
                        <ImagePlus className="size-4" />
                        {uploading
                          ? 'Uploading photos...'
                          : images.length === 0
                          ? 'Select 1 to 5 photos'
                          : `Add more photos (${5 - images.length} remaining)`}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={uploading}
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <button
                    disabled={uploading || images.length === 0}
                    className="rounded-xl bg-[#f36f2b] p-3 font-semibold text-white transition hover:bg-[#dd5b1d] disabled:opacity-50"
                  >
                    {uploading ? 'Uploading images...' : 'Publish product'}
                  </button>
                </div>
              </form>

              <div className="grid gap-4 sm:grid-cols-2">
                {allProducts.map((product) => {
                  const productImages = product.images && product.images.length ? product.images : (product.image ? [product.image] : [])
                  const mainImage = productImages[0]
                  return (
                    <article key={product._id || product.name} className="flex flex-col justify-between rounded-2xl border border-[#dce8eb] bg-white p-5 shadow-sm">
                      <div>
                        {mainImage && (
                          <div className="relative mb-3 h-36 w-full overflow-hidden rounded-xl bg-slate-100">
                            <img src={mainImage} alt={product.name} className="h-full w-full object-cover" />
                            {productImages.length > 1 && (
                              <span className="absolute top-2 right-2 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-white">
                                {productImages.length} photos
                              </span>
                            )}
                          </div>
                        )}

                        {productImages.length > 1 && (
                          <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
                            {productImages.map((img, i) => (
                              <img key={i} src={img} alt="" className="size-10 rounded-md object-cover border border-slate-200" />
                            ))}
                          </div>
                        )}

                        <p className="text-xs font-semibold uppercase tracking-wider text-[#f36f2b]">{product.category}</p>
                        <h3 className="mt-1 font-semibold text-lg">{product.name}</h3>
                        <p className="mt-2 text-sm text-[#6f8793] leading-relaxed">{product.description}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeProduct(product)}
                        className="mt-5 flex items-center justify-center gap-1.5 w-full rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 className="size-4" /> Delete product
                      </button>
                    </article>
                  )
                })}

                {loaded && !allProducts.length && (
                  <div className="col-span-2 rounded-2xl border border-dashed border-[#dce8eb] p-10 text-center text-sm text-[#6f8793]">
                    No products in catalogue yet. Use the form on the left to add a product (1 to 5 photos).
                  </div>
                )}
              </div>
            </div>
          )}

          {active === 'Regional Offices' && (
            <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
              {/* Left Column Form */}
              <form onSubmit={saveOffice} className="rounded-2xl border border-[#dce8eb] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg">{editingOfficeId ? 'Edit Regional Office' : 'Add Regional Office'}</h2>
                  {editingOfficeId && (
                    <button type="button" onClick={cancelEditOffice} className="text-xs font-semibold text-slate-500 hover:text-slate-800">
                      Cancel edit
                    </button>
                  )}
                </div>

                <div className="mt-4 grid gap-3">
                  <label className="grid gap-1 text-xs font-semibold text-slate-600">
                    Branch Label / Title
                    <input
                      required
                      placeholder="e.g. Main Branch (Headquarters), Patna Branch"
                      value={officeForm.label}
                      onChange={(e) => setOfficeForm({ ...officeForm, label: e.target.value })}
                      className="rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#f36f2b]"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="grid gap-1 text-xs font-semibold text-slate-600">
                      City *
                      <input
                        required
                        placeholder="e.g. Delhi (NCR), Patna"
                        value={officeForm.city}
                        onChange={(e) => setOfficeForm({ ...officeForm, city: e.target.value })}
                        className="rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#f36f2b]"
                      />
                    </label>

                    <label className="grid gap-1 text-xs font-semibold text-slate-600">
                      State
                      <input
                        placeholder="e.g. Delhi, Bihar, UP"
                        value={officeForm.state}
                        onChange={(e) => setOfficeForm({ ...officeForm, state: e.target.value })}
                        className="rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#f36f2b]"
                      />
                    </label>
                  </div>

                  <label className="grid gap-1 text-xs font-semibold text-slate-600">
                    Full Physical Address *
                    <textarea
                      required
                      placeholder="Enter full building address, area, pincode..."
                      value={officeForm.address}
                      onChange={(e) => setOfficeForm({ ...officeForm, address: e.target.value })}
                      className="min-h-24 rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#f36f2b]"
                    />
                  </label>

                  <label className="grid gap-1 text-xs font-semibold text-slate-600">
                    Landline Phone (HQ)
                    <input
                      placeholder="e.g. 011-36650267"
                      value={officeForm.phone}
                      onChange={(e) => setOfficeForm({ ...officeForm, phone: e.target.value })}
                      className="rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#f36f2b]"
                    />
                  </label>

                  <label className="grid gap-1 text-xs font-semibold text-slate-600">
                    Mobile / WhatsApp Number
                    <input
                      placeholder="e.g. +91 96259 70722"
                      value={officeForm.mobile}
                      onChange={(e) => setOfficeForm({ ...officeForm, mobile: e.target.value })}
                      className="rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#f36f2b]"
                    />
                  </label>

                  <label className="grid gap-1 text-xs font-semibold text-slate-600">
                    Google Maps Share Link
                    <input
                      placeholder="https://www.google.com/maps/..."
                      value={officeForm.mapUrl}
                      onChange={(e) => setOfficeForm({ ...officeForm, mapUrl: e.target.value })}
                      className="rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#f36f2b]"
                    />
                  </label>

                  <label className="flex items-center gap-2 pt-2 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={officeForm.isMain}
                      onChange={(e) => setOfficeForm({ ...officeForm, isMain: e.target.checked })}
                      className="size-4 accent-[#f36f2b]"
                    />
                    Mark as Main Headquarters (Delhi HQ)
                  </label>

                  <button
                    disabled={officeSaving}
                    className="mt-3 rounded-full bg-[#f36f2b] p-3.5 font-bold text-white transition hover:bg-[#dd5b1d] disabled:opacity-60"
                  >
                    {officeSaving ? 'Saving office...' : editingOfficeId ? 'Update office' : 'Add office'}
                  </button>
                </div>
              </form>

              {/* Right Column List */}
              <div>
                <h2 className="text-[#102a43] text-xl font-semibold">Current Regional Offices ({offices.length})</h2>
                <p className="mt-1 text-sm text-[#6f8793]">
                  These offices appear live on the website branch network page (`/offices`) and customer contact buttons.
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {offices.map((office, idx) => (
                    <article
                      key={office._id || office.city || idx}
                      className={`flex flex-col justify-between rounded-2xl border p-5 bg-white shadow-sm transition ${
                        office.isMain ? 'border-[#f36f2b] ring-1 ring-[#f36f2b]/30' : 'border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                              office.isMain ? 'bg-[#f36f2b] text-white' : 'bg-slate-100 text-[#0c6670]'
                            }`}
                          >
                            {office.label || office.city}
                          </span>
                          {office.isMain && (
                            <span className="text-[11px] font-semibold text-[#f36f2b]">Main HQ</span>
                          )}
                        </div>

                        <h3 className="mt-3 text-lg font-bold text-[#102a43]">{office.city}</h3>
                        {office.state && <p className="text-xs font-bold uppercase text-slate-400">{office.state}</p>}

                        <p className="mt-3 text-sm text-slate-600 leading-relaxed">{office.address}</p>

                        <div className="mt-4 space-y-1 text-xs">
                          {office.phone && (
                            <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                              <Phone className="size-3.5 text-[#f36f2b]" /> Landline: {office.phone}
                            </p>
                          )}
                          {office.mobile && (
                            <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                              <Phone className="size-3.5 text-[#49a878]" /> Mobile/WA: {office.mobile}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                        <button
                          type="button"
                          onClick={() => startEditOffice(office)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          <Edit3 className="size-3.5 text-[#0c6670]" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteOffice(office)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 className="size-3.5" /> Delete
                        </button>
                      </div>
                    </article>
                  ))}

                  {!offices.length && (
                    <div className="col-span-2 rounded-2xl border border-dashed border-[#dce8eb] p-10 text-center text-sm text-[#6f8793]">
                      No regional offices added yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {active === 'Leads & enquiries' && (
            <div className="rounded-2xl border border-[#dce8eb] bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-lg">All Lead Enquiries & Deal Tracking</h2>
                  <p className="text-xs text-[#6f8793] mt-0.5">Track deal statuses, final amounts, rejection reasons, and manage storage auto-purge.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 no-print">
                  <button
                    type="button"
                    onClick={markAllLeadsPrinted}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition"
                  >
                    <Printer className="size-3.5 text-amber-400" /> Print PDF / Paper Report
                  </button>

                  <button
                    type="button"
                    onClick={exportLeadsToCSV}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition"
                  >
                    <FileSpreadsheet className="size-3.5 text-white" /> Export to Excel (.xlsx / .csv)
                  </button>

                  <button
                    type="button"
                    onClick={purgePrintedLeads}
                    className="flex items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
                  >
                    <Trash2 className="size-3.5 text-emerald-700" /> Purge Printed Leads ({storageStats?.leads.printed || 0})
                  </button>

                  <button
                    type="button"
                    onClick={forceDeleteOldestLeads}
                    className="flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition"
                  >
                    <AlertTriangle className="size-3.5 text-red-600" /> Force Delete Oldest
                  </button>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto print-container">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-[#6f8793]">
                      <th className="p-3.5">Product & Print Status</th>
                      <th className="p-3.5">Client & Contact</th>
                      <th className="p-3.5">Requirement Details</th>
                      <th className="p-3.5">Deal Status</th>
                      <th className="p-3.5 text-right action-column no-print">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leads.map((l, i) => (
                      <tr key={l._id || i} className="hover:bg-slate-50/50 transition">
                        <td className="p-3.5 align-top">
                          <span className="inline-block rounded-xl bg-orange-100/80 px-2.5 py-1 text-xs font-bold text-[#f36f2b]">
                            {l.productName || 'General Enquiry'}
                          </span>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[11px] text-slate-400">
                              {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'Recent'}
                            </span>
                            {l.isPrinted ? (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                                🖨️ Printed
                              </span>
                            ) : (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                ⚠️ Not Printed
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-3.5 align-top">
                          <p className="font-bold text-[#102a43]">{l.name || 'Unnamed'}</p>
                          {l.organization && <p className="text-xs font-semibold text-[#0c6670]">{l.organization}</p>}
                          <div className="mt-1.5 flex flex-wrap gap-2 text-xs">
                            <a href={`mailto:${l.email}`} className="text-slate-600 underline hover:text-[#f36f2b]">
                              {l.email}
                            </a>
                            {l.phone && (
                              <a href={`tel:${l.phone}`} className="font-semibold text-emerald-700 hover:underline">
                                {l.phone}
                              </a>
                            )}
                          </div>
                        </td>

                        <td className="max-w-xs p-3.5 align-top text-xs text-slate-600">
                          {l.address && <p className="font-medium text-slate-700">📍 {l.address}</p>}
                          <p className="mt-1 leading-relaxed">{l.message || 'No message provided.'}</p>
                        </td>

                        <td className="p-3.5 align-top">
                          {l.status === 'Finalized' ? (
                            <div className="inline-flex flex-col rounded-xl bg-emerald-50 p-2 border border-emerald-200">
                              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                🟢 Deal Finalized
                              </span>
                              {l.finalAmount && (
                                <span className="mt-0.5 text-xs font-extrabold text-emerald-800">
                                  Amount: {l.finalAmount}
                                </span>
                              )}
                            </div>
                          ) : l.status === 'Not Finalized' ? (
                            <div className="inline-flex flex-col rounded-xl bg-red-50 p-2 border border-red-200">
                              <span className="text-xs font-bold text-red-700 flex items-center gap-1">
                                🔴 Deal Not Finalized
                              </span>
                              {l.reason && (
                                <span className="mt-0.5 text-xs font-medium text-red-800">
                                  Reason: {l.reason}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-block rounded-xl bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                              🟡 Pending / In Process
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 align-top text-right action-column no-print">
                          <button
                            type="button"
                            onClick={() => openDealModal(l)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#f36f2b] hover:text-[#f36f2b]"
                          >
                            Update Deal
                          </button>
                        </td>
                      </tr>
                    ))}

                    {!leads.length && (
                      <tr>
                        <td colSpan={5} className="p-10 text-center text-sm text-slate-500">
                          No lead enquiries received yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Deal Status Update Modal */}
          {dealModalLead && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-lg text-[#102a43]">Update Deal Status</h3>
                    <p className="text-xs text-slate-500">{dealModalLead.name} • {dealModalLead.productName || 'General Enquiry'}</p>
                  </div>
                  <button onClick={() => setDealModalLead(null)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
                    <X className="size-5" />
                  </button>
                </div>

                <form onSubmit={saveDealStatus} className="mt-4 grid gap-4 text-sm">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Deal Finalized Status *</p>
                    <div className="grid gap-2">
                      <label className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ${dealStatus === 'Finalized' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                        <input
                          type="radio"
                          name="statusOption"
                          checked={dealStatus === 'Finalized'}
                          onChange={() => setDealStatus('Finalized')}
                          className="accent-emerald-600 size-4"
                        />
                        <div>
                          <p className="font-bold text-emerald-800">🟢 Deal Finalized (Closed-Won)</p>
                          <p className="text-xs text-emerald-600">Client purchased equipment / contract closed.</p>
                        </div>
                      </label>

                      <label className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ${dealStatus === 'Not Finalized' ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}>
                        <input
                          type="radio"
                          name="statusOption"
                          checked={dealStatus === 'Not Finalized'}
                          onChange={() => setDealStatus('Not Finalized')}
                          className="accent-red-600 size-4"
                        />
                        <div>
                          <p className="font-bold text-red-800">🔴 Deal Not Finalized (Lost / Rejected)</p>
                          <p className="text-xs text-red-600">Client did not purchase or selected alternative.</p>
                        </div>
                      </label>

                      <label className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ${dealStatus === 'Pending' ? 'border-amber-500 bg-amber-50' : 'border-slate-200'}`}>
                        <input
                          type="radio"
                          name="statusOption"
                          checked={dealStatus === 'Pending'}
                          onChange={() => setDealStatus('Pending')}
                          className="accent-amber-600 size-4"
                        />
                        <div>
                          <p className="font-bold text-amber-800">🟡 Pending / In Negotiation</p>
                          <p className="text-xs text-amber-600">Follow-up in progress.</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {dealStatus === 'Finalized' && (
                    <label className="grid gap-1 text-xs font-bold text-slate-700 bg-emerald-50/50 p-3 rounded-xl border border-emerald-200">
                      Final Deal Amount (₹) *
                      <input
                        required
                        type="text"
                        placeholder="e.g. ₹ 2,50,000"
                        value={dealAmount}
                        onChange={(e) => setDealAmount(e.target.value)}
                        className="rounded-xl border border-slate-300 bg-white p-2.5 text-sm font-semibold outline-none focus:border-emerald-500"
                      />
                    </label>
                  )}

                  {dealStatus === 'Not Finalized' && (
                    <label className="grid gap-1 text-xs font-bold text-slate-700 bg-red-50/50 p-3 rounded-xl border border-red-200">
                      Reason for Not Finalizing *
                      <select
                        value={dealReason}
                        onChange={(e) => setDealReason(e.target.value)}
                        className="rounded-xl border border-slate-300 bg-white p-2.5 text-sm font-medium outline-none focus:border-red-500"
                      >
                        <option value="">Select reason</option>
                        <option value="Price too high">Price too high / Budget issue</option>
                        <option value="Competitor selected">Competitor selected</option>
                        <option value="Project / Budget postponed">Project / Budget postponed</option>
                        <option value="Specifications mismatch">Specifications mismatch</option>
                        <option value="Client stopped responding">Client stopped responding</option>
                        <option value="Other">Other / Custom reason</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Or enter custom reason..."
                        value={dealReason}
                        onChange={(e) => setDealReason(e.target.value)}
                        className="mt-2 rounded-xl border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-red-500"
                      />
                    </label>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setDealModalLead(null)}
                      className="flex-1 rounded-full border border-slate-200 py-3 font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={updatingDeal}
                      className="flex-1 rounded-full bg-[#f36f2b] py-3 font-bold text-white transition hover:bg-[#dd5b1d] disabled:opacity-60"
                    >
                      {updatingDeal ? 'Saving...' : 'Save Deal Status'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {active === 'Analytics' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-[#dce8eb] bg-white p-5">
                <h2 className="font-semibold">Visitor and quote overview</h2>
                <div className="mt-6 grid grid-cols-3 items-end gap-5">
                  <div>
                    <div
                      className="h-36 rounded-t-xl bg-[#e5f4f2]"
                      style={{ height: `${Math.max(20, Math.min(144, metrics.yearly))}px` }}
                    />
                    <p className="mt-2 text-center text-xs">Year</p>
                  </div>
                  <div>
                    <div
                      className="h-36 rounded-t-xl bg-[#b7ddd7]"
                      style={{ height: `${Math.max(20, Math.min(144, metrics.monthly))}px` }}
                    />
                    <p className="mt-2 text-center text-xs">Month</p>
                  </div>
                  <div>
                    <div
                      className="h-36 rounded-t-xl bg-[#f36f2b]"
                      style={{ height: `${Math.max(20, Math.min(144, metrics.daily))}px` }}
                    />
                    <p className="mt-2 text-center text-xs">Today</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#dce8eb] bg-white p-5">
                <h2 className="font-semibold">Product quote clicks</h2>
                <div className="mt-5 grid gap-4">
                  {metrics.products.map((p) => (
                    <div key={p.name}>
                      <div className="flex justify-between text-sm">
                        <span>{p.name}</span>
                        <span>{p.clicks}</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-[#edf2f3]">
                        <div
                          className="h-2 rounded-full bg-[#f36f2b]"
                          style={{ width: `${Math.min(100, p.clicks * 10)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {!metrics.products.length && (
                    <p className="text-sm text-[#6f8793]">
                      Product click analytics will appear here as visitors interact with quotes.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {active === 'Product Media' && <ProductMediaAdmin />}

          {active === 'Rammed Gallery' && <RammedGalleryAdmin />}

          {active === 'Festival Mode' && <FestivalModeAdmin />}

          {active === 'Settings' && (
            <div className="max-w-2xl rounded-2xl border border-[#dce8eb] bg-white p-6">
              <h2 className="text-xl font-semibold">Website settings</h2>
              <p className="mt-1 text-sm text-[#6f8793]">
                Update the contact details shown across the public website.
              </p>
              <form onSubmit={saveSettings} className="mt-6 grid gap-4">
                <label className="grid gap-2 text-sm font-medium">
                  Phone
                  <input
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="rounded-xl border p-3"
                    placeholder="+91..."
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  WhatsApp
                  <input
                    value={settings.whatsapp}
                    onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                    className="rounded-xl border p-3"
                    placeholder="WhatsApp number"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Support email
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="rounded-xl border p-3"
                    placeholder="Business@raamed.online"
                  />
                </label>
                <button className="rounded-xl bg-[#f36f2b] p-3 font-semibold text-white">
                  Save website settings
                </button>
              </form>

              <div className="mt-8 border-t pt-6">
                <h3 className="font-semibold">Admin password</h3>
                <p className="mt-1 text-sm text-[#6f8793]">
                  Change the password from the secure admin credentials settings in Vercel.
                </p>
                <a
                  className="mt-3 inline-block text-sm font-semibold text-[#f36f2b]"
                  href="https://vercel.com/raamed1/raamed-org-could-host/settings/environment-variables"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Vercel password settings
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
