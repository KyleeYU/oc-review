'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Item } from '@/types'
import { courseMetadata, discoverCourses, GER_LABELS, SUBJECT_LABELS, type CourseSort } from '@/lib/courseDiscovery'

export default function CourseDirectory({ items, ratingsReady }: { items: Item[]; ratingsReady: boolean }) {
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState('')
  const [ger, setGer] = useState('')
  const [sort, setSort] = useState<CourseSort>('name')
  const subjects = [...new Set(items.map(i => courseMetadata(i.name).subject))].sort()
  const filtered = discoverCourses(items, { search, subject, ger, introductory: false, sort })
  const active = search || subject || ger || sort !== 'name'

  function reset() { setSearch(''); setSubject(''); setGer(''); setSort('name') }
  return (
    <section aria-label="课程目录">
      <div className="card p-4 sm:p-5 mb-5 space-y-4">
        <label className="block text-sm font-medium">
          搜索课程
          <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="课程编号或名称，如 ECON、心理学…" className="input mt-1.5" />
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="text-xs text-slate-500">学科
            <select aria-label="学科" className="input mt-1.5" value={subject} onChange={e => setSubject(e.target.value)}>
              <option value="">全部学科</option>
              {subjects.map(s => <option key={s} value={s}>{s} · {SUBJECT_LABELS[s] || s}</option>)}
            </select>
          </label>
          <label className="text-xs text-slate-500">GER 要求
            <select aria-label="GER 要求" className="input mt-1.5" value={ger} onChange={e => setGer(e.target.value)}>
              <option value="">全部 GER</option>
              {Object.entries(GER_LABELS).map(([tag, label]) => <option key={tag} value={tag}>{tag} · {label}</option>)}
            </select>
          </label>
          <label className="text-xs text-slate-500">排序
            <select aria-label="排序" className="input mt-1.5" value={sort} onChange={e => setSort(e.target.value as CourseSort)}>
              <option value="name">课程编号</option>
              <option value="popular" disabled={!ratingsReady}>最热门 · 评价最多</option>
              <option value="rating" disabled={!ratingsReady}>评分最高</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {active && <button type="button" onClick={reset} className="text-xs text-slate-500 underline underline-offset-4">重置筛选</button>}
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">热门按本站公开评价数排序。</p>
        <p className="text-xs text-slate-400 leading-relaxed">GER 参考 <a className="underline" href="https://oxford.emory.edu/catalog/documents/26-27-ox-catalog_01.30.26.pdf" target="_blank" rel="noreferrer">Oxford 2026–27 目录</a>，具体班次以 OPUS 为准。</p>
      </div>
      <div className="flex items-center justify-between mb-3 text-xs text-slate-500" aria-live="polite">
        <span>显示 {filtered.length} / {items.length} 门课程</span>
        <span>{sort === 'popular' ? '评价最多优先' : sort === 'rating' ? '评分最高优先' : '按课程编号'}</span>
      </div>
      {!ratingsReady && sort !== 'name' ? <div className="card p-8 text-center text-sm text-slate-500" role="status">正在加载评价数据…</div> : filtered.length === 0 ? (
        <div className="card p-10 text-center"><p className="text-sm text-slate-500">没有符合条件的课程</p><button type="button" onClick={reset} className="mt-3 text-sm text-brand-700 underline">清除筛选</button></div>
      ) : <div className="space-y-2">
        {filtered.map((item, index) => {
          const metadata = courseMetadata(item.name)
          return <Link key={item.id} href={`/course/${item.id}`} className="card-link p-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">{sort === 'popular' && (item.review_count || 0) > 0 && <span className="text-brand-500 mr-2">#{index + 1}</span>}{item.name}</div>
              {item.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{SUBJECT_LABELS[metadata.subject] || metadata.subject}</span>
                {metadata.ger.map(tag => <span key={tag} title={GER_LABELS[tag]} className="rounded bg-brand-50 px-2 py-0.5 text-[10px] text-brand-700">{tag}</span>)}
              </div>
            </div>
            <div className="shrink-0 text-right">
              {!ratingsReady ? <div className="skeleton h-4 w-12" /> : <>
                {item.avg_rating != null && <div className="text-base font-bold text-gold-500">{item.avg_rating.toFixed(1)} <span className="text-xs">★</span></div>}
                <div className="text-[11px] text-slate-400 mt-1">{item.review_count ? `${item.review_count} 条评价` : '暂无评价'}</div>
              </>}
            </div>
          </Link>
        })}
      </div>}
    </section>
  )
}
