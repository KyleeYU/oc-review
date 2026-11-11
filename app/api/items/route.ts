import { NextRequest, NextResponse } from 'next/server'
import { courseIdentity } from '@/lib/courseDiscovery'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { category_id, name, description, user_token } = await req.json()

  if (!category_id || !name?.trim()) {
    return NextResponse.json({ error: '参数错误' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data: category, error: categoryError } = await supabase
    .from('categories').select('slug').eq('id', category_id).single()
  if (categoryError || !category) {
    return NextResponse.json({ error: '分类不存在或暂时无法读取' }, { status: 400 })
  }
  if (category.slug === 'course') {
    const { data: existing, error: lookupError } = await supabase
      .from('items').select('id, name').eq('category_id', category_id).eq('is_hidden', false)
    if (lookupError) return NextResponse.json({ error: '暂时无法检查重复课程，请重试' }, { status: 500 })
    const duplicate = existing?.find(item => courseIdentity(item.name) === courseIdentity(name))
    if (duplicate) {
      return NextResponse.json({ error: '该课程已存在，请到已有课程下评价', id: duplicate.id }, { status: 409 })
    }
  }

  const { data, error } = await supabase
    .from('items')
    .insert({
      category_id,
      name: name.trim(),
      description: description?.trim() || null,
      created_by: 'anonymous',
      user_token: user_token || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: '提交失败，请重试' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: data.id })
}
