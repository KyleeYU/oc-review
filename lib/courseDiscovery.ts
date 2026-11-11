import catalog from '@/data/course-catalog.json'
import type { Item } from '@/types'

export const GER_LABELS: Record<string, string> = {
  HA: '人文与艺术', NS: '自然科学', QR: '定量推理', SS: '社会科学',
  FW: '大一写作', CC: '持续沟通与写作', IC: '跨文化沟通',
  ETHN: '种族与族裔', DSC: 'Discovery Seminar', XA: '体验式学习', PED: '体育',
}
export const SUBJECT_LABELS: Record<string, string> = {
  AAS: '非裔美国研究', ACT: '会计', AMST: '美国研究', ANTH: '人类学', ARAB: '阿拉伯语',
  ART: '艺术', ASTR: '天文学', BIOL: '生物', CHEM: '化学', CHN: '中文', CS: '计算机科学',
  DANC: '舞蹈', DASCI: '数据科学', DSC: 'Discovery Seminar', ECON: '经济学', ENG: '英语文学',
  ENGCW: '创意写作', ENVS: '环境科学', FILM: '电影与媒体', FREN: '法语', GER: '德语',
  HIST: '历史', IDS: '跨学科研究', INTER: '实习', LACS: '拉美与加勒比研究', LAT: '拉丁语',
  LING: '语言学', MATH: '数学', MESAS: '中东与南亚研究', MUS: '音乐', NBB: '神经科学',
  NRSG: '护理', OCS: '信息科学', OXST: 'Oxford Studies', PE: '体育', PHIL: '哲学',
  PHYS: '物理', POLS: '政治学', PSYC: '心理学', QTM: '定量方法', REL: '宗教', SOC: '社会学',
  SPAN: '西班牙语', THEA: '戏剧', WGS: '女性、性别与性研究',
}

export function parseCourse(name: string) {
  const match = name.trim().toUpperCase().match(/^([A-Z]+)(?:_OX)?\s*(\d{3})([A-Z]*)(?:\s*\(([A-Z]+)\))?$/)
  if (!match) return null
  const [, subject, number, suffix, optional = ''] = match
  // Optional lab/experiential notation is retained so distinct courses are not collapsed.
  return { subject, number: Number(number), suffix: suffix + optional, catalogSuffix: suffix, code: `${subject}_OX${number}${suffix}${optional}` }
}

export function courseIdentity(name: string) {
  return parseCourse(name)?.code ?? name.trim().replace(/\s+/g, ' ').toLowerCase()
}

export function courseMetadata(name: string) {
  const parsed = parseCourse(name)
  const records = catalog.courses as Record<string, { ger: string[]; introductory: boolean }>
  const base = parsed ? `${parsed.subject}_OX${parsed.number}` : ''
  const source = parsed ? records[base + parsed.catalogSuffix]
    ?? records[base + parsed.catalogSuffix.replace(/[WE]/g, '')]
    ?? records[base] : undefined
  const ger = new Set(source?.ger || [])
  // W and E are section-specific designations; never assign these by subject or title.
  if (parsed?.suffix.includes('W')) ger.add('CC')
  if (parsed?.suffix.includes('E')) ger.add('XA')
  if (parsed?.subject === 'DSC' && parsed.number === 101) ger.add('DSC')
  return { subject: parsed?.subject ?? 'OTHER', ger: [...ger], introductory: source?.introductory ?? false }
}

export type CourseSort = 'name' | 'popular' | 'rating'
export interface CourseFilters { search: string; subject: string; ger: string; introductory: boolean; sort: CourseSort }

export function discoverCourses(items: Item[], filters: CourseFilters) {
  const q = filters.search.trim().toLowerCase()
  return items.filter(item => {
    const metadata = courseMetadata(item.name)
    return (!q || `${item.name} ${item.description || ''} ${SUBJECT_LABELS[metadata.subject] || ''}`.toLowerCase().includes(q))
      && (!filters.subject || metadata.subject === filters.subject)
      && (!filters.ger || (filters.ger === 'unknown' ? metadata.ger.length === 0 : metadata.ger.includes(filters.ger)))
      && (!filters.introductory || metadata.introductory)
  }).sort((a, b) => {
    if (filters.sort === 'popular') {
      const difference = (b.review_count || 0) - (a.review_count || 0)
      if (difference) return difference
    }
    if (filters.sort === 'rating') {
      const difference = (b.avg_rating ?? -1) - (a.avg_rating ?? -1)
      if (difference) return difference
      const countDifference = (b.review_count || 0) - (a.review_count || 0)
      if (countDifference) return countDifference
    }
    return a.name.localeCompare(b.name, 'en', { numeric: true, sensitivity: 'base' }) || a.id - b.id
  })
}
