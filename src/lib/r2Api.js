const rawBase = import.meta.env.VITE_API_BASE_URL || ''
export const API_BASE = rawBase.replace(/\/$/, '')

function mapRemoteLesson(raw, fallback) {
  if (!raw || typeof raw !== 'object') return fallback

  const vocabulary = Array.isArray(raw.vocabulary)
    ? raw.vocabulary.map((x) => [x.hanzi, x.pinyin, x.meaning_vi])
    : fallback.vocabulary

  const grammar = Array.isArray(raw.grammar)
    ? raw.grammar.map((g) => ({
        title: g.title,
        description: g.explanation_vi,
        examples: (g.patterns || []).map((p) => [p.form, p.example, p.pinyin, p.meaning_vi]),
      }))
    : fallback.grammar

  const speaking = Array.isArray(raw.speaking_practice)
    ? raw.speaking_practice.map((x) => [x.hanzi, x.pinyin, x.meaning_vi])
    : fallback.speaking

  const multipleChoice = Array.isArray(raw.quiz)
    ? raw.quiz.filter((q) => q.type === 'multiple_choice').map((q) => {
        const options = (q.options || []).map((x) => x.text)
        const answer = Math.max(0, (q.options || []).findIndex((x) => x.id === q.answer))
        return { q: q.prompt_vi, options, answer }
      })
    : fallback.quiz

  return {
    ...fallback,
    id: raw.id || fallback.id,
    titleVi: raw.title_vi || fallback.titleVi,
    titleZh: raw.title_zh || fallback.titleZh,
    videoKey: raw.video?.r2_key || fallback.videoKey,
    objectives: raw.learning_objectives || fallback.objectives,
    vocabulary,
    grammar: grammar.length ? grammar : fallback.grammar,
    speaking: speaking.length ? speaking : fallback.speaking,
    quiz: multipleChoice.length ? multipleChoice : fallback.quiz,
  }
}

export async function fetchLesson01(fallback) {
  if (!API_BASE) return { lesson: fallback, source: 'fallback' }
  const response = await fetch(`${API_BASE}/api/lesson/volume-01/lesson-01`)
  if (!response.ok) throw new Error(`Lesson API ${response.status}`)
  const raw = await response.json()
  return { lesson: mapRemoteLesson(raw, fallback), source: 'r2' }
}

export function getVideoUrl(videoKey) {
  if (!API_BASE || !videoKey) return ''
  return `${API_BASE}/api/video/${videoKey.replace(/^video\//, '')}`
}
