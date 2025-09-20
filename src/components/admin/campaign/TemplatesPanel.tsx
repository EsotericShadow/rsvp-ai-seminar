'use client'

import { useId, useMemo, useState } from 'react'
import { CampaignTemplate } from '@prisma/client'

// FAKE TYPES FOR NOW
type Template = CampaignTemplate

const DEFAULT_PREVIEW_CONTEXT: Record<string, string> = {
  business_name: 'Rainbow Inn Motel',
  invite_link: 'https://rsvp.evergreenwebsolutions.ca/rsvp?eid=biz_sample',
  unsubscribe_link: 'https://rsvp.evergreenwebsolutions.ca/unsubscribe',
}

const KNOWN_TOKENS = ['business_name', 'invite_link', 'unsubscribe_link'] as const

const renderPreview = (template: string, context: Record<string, string>) =>
  template.replace(/{{\s*([\w.]+)\s*}}/g, (_, key: string) => {
    const normalised = key.trim()
    return context[normalised] ?? `{{${normalised}}}`
  })

type TemplateDraft = { id?: string; name: string; subject: string; htmlBody: string; textBody: string }

type TemplatesPanelProps = {
  templates: Template[]
  draft: TemplateDraft
  setDraft: (draft: TemplateDraft) => void
  onEdit: (template: Template) => void
  onDuplicate: (template: Template) => void
  onRemove: (id: string) => void
  onSubmit: () => Promise<void>
  isSaving: boolean
}

export function TemplatesPanel({ templates, draft, setDraft, onEdit, onDuplicate, onRemove, onSubmit, isSaving }: TemplatesPanelProps) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="w-full lg:max-w-sm lg:flex-none">
        <TemplatesSidebar
          draft={draft}
          setDraft={setDraft}
          onSubmit={onSubmit}
          isSaving={isSaving}
        />
      </aside>
      <main className="w-full flex-1 min-w-0">
        <TemplatesMain
          templates={templates}
          draft={draft}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onRemove={onRemove}
        />
      </main>
    </div>
  )
}

function TemplatesSidebar({ draft, setDraft, onSubmit, isSaving }: {
  draft: TemplateDraft
  setDraft: (draft: TemplateDraft) => void
  onSubmit: () => Promise<void>
  isSaving: boolean
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-white">Templates</h2>
          <p className="text-xs text-neutral-400">Create and manage email templates.</p>
        </div>
        {draft.id ? (
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-200">Editing {draft.name}</span>
        ) : null}
      </header>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
        className="space-y-4"
      >
        <div>
          <label className="text-xs uppercase tracking-wide text-neutral-400">Template name</label>
          <input
            required
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
            placeholder="AI Seminar Invite"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-neutral-400">Subject</label>
          <input
            required
            value={draft.subject}
            onChange={(event) => setDraft({ ...draft, subject: event.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
            placeholder="Invitation: Evergreen AI Seminar"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-neutral-400">HTML content</label>
          <textarea
            required
            value={draft.htmlBody}
            onChange={(event) => setDraft({ ...draft, htmlBody: event.target.value })}
            rows={8}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 font-mono text-xs text-emerald-100 focus:border-emerald-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide text-neutral-400">Plain text (optional)</label>
          <textarea
            value={draft.textBody}
            onChange={(event) => setDraft({ ...draft, textBody: event.target.value })}
            rows={4}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 font-mono text-xs text-neutral-200 focus:border-emerald-400 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? 'Saving…' : draft.id ? 'Update template' : 'Create template'}
        </button>
      </form>
    </div>
  )
}

function TemplatesMain({ templates, draft, onEdit, onDuplicate, onRemove }: {
  templates: Template[]
  draft: TemplateDraft
  onEdit: (template: Template) => void
  onDuplicate: (template: Template) => void
  onRemove: (id: string) => void
}) {
  const previewId = useId()
  const [previewContext, setPreviewContext] = useState<Record<string, string>>(DEFAULT_PREVIEW_CONTEXT)
  const [showPlainText, setShowPlainText] = useState(false)

  const renderedHtml = useMemo(() => renderPreview(draft.htmlBody || '', previewContext), [draft.htmlBody, previewContext])
  const renderedSubject = useMemo(() => renderPreview(draft.subject || '', previewContext), [draft.subject, previewContext])
  const renderedText = useMemo(() => renderPreview(draft.textBody || '', previewContext), [draft.textBody, previewContext])

  const updatePreview = (token: string, value: string) => {
    setPreviewContext((prev) => ({ ...prev, [token]: value }))
  }

  const resetPreviewContext = () => setPreviewContext(DEFAULT_PREVIEW_CONTEXT)

  return (
    <div className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Template Preview & Management</h2>
          <p className="text-sm text-neutral-400">Preview your templates and manage existing ones.</p>
        </div>
      </header>

      <div className="space-y-6">
        {/* Live Preview Section */}
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <header className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-neutral-200">Live preview</p>
              <p className="text-xs text-neutral-500">
                Rendered with sample data · Subject: <span className="text-neutral-300">{renderedSubject || '—'}</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-neutral-300">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-200">Preview data</span>
                  <button type="button" onClick={resetPreviewContext} className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-neutral-300 hover:border-white/30">
                    Reset
                  </button>
                </div>
                <div className="grid gap-2">
                  {KNOWN_TOKENS.map((token) => (
                    <label key={token} className="flex flex-col gap-1">
                      <span className="text-neutral-500">{`{{${token}}}`}</span>
                      <input
                        value={previewContext[token] ?? ''}
                        onChange={(event) => updatePreview(token, event.target.value)}
                        className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-white focus:border-emerald-400 focus:outline-none"
                        placeholder={`Sample ${token.replace('_', ' ')}`}
                      />
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-neutral-300">
                <input
                  type="checkbox"
                  checked={showPlainText}
                  onChange={(event) => setShowPlainText(event.target.checked)}
                  className="h-3 w-3 rounded border-white/20 bg-black/40 text-emerald-500 focus:ring-emerald-400"
                />
                Plain text
              </label>
            </div>
          </header>
          {showPlainText ? (
            <pre className="max-h-72 overflow-auto rounded-lg border border-white/10 bg-black/60 p-3 text-xs text-neutral-200 whitespace-pre-wrap">
              {renderedText || 'Plain text body will appear here.'}
            </pre>
          ) : (
            <div
              id={previewId}
              className="prose prose-sm prose-invert max-h-72 overflow-auto rounded-lg border border-white/10 bg-black/40 p-4"
              dangerouslySetInnerHTML={{ __html: renderedHtml || '<p class="text-neutral-500">HTML preview will appear here.</p>' }}
            />
          )}
        </div>

        {/* Templates List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-neutral-200">Existing Templates</h3>
          {templates.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/20 bg-black/30 p-4 text-sm text-neutral-400">
              No templates yet. Create one to get started.
            </div>
          ) : (
            templates.map((template) => (
              <article key={template.id} className="rounded-xl border border-white/10 bg-black/40 p-4">
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-white">{template.name}</h3>
                    <p className="text-xs text-neutral-400">Subject: {template.subject}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <button
                      onClick={() => onEdit(template)}
                      className="rounded-full border border-white/10 px-3 py-1 text-neutral-200 hover:border-emerald-400 hover:text-emerald-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDuplicate(template)}
                      className="rounded-full border border-white/10 px-3 py-1 text-neutral-200 hover:border-white/30"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => onRemove(template.id)}
                      className="rounded-full border border-red-500/40 px-3 py-1 text-red-200 hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </header>
                <details className="mt-3 text-xs text-neutral-300">
                  <summary className="cursor-pointer text-neutral-400">Quick preview</summary>
                  <div className="prose prose-invert mt-2 max-w-none rounded-lg border border-white/10 bg-black/30 p-3" dangerouslySetInnerHTML={{ __html: renderPreview(template.htmlBody, previewContext) }} />
                </details>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
