'use client'

import { CampaignTemplate } from '@prisma/client'

// FAKE TYPES FOR NOW
type Template = CampaignTemplate

export function TemplatesPanel({
  templates,
  draft,
  setDraft,
  onEdit,
  onRemove,
  onSubmit,
  isSaving,
}: {
  templates: Template[]
  draft: { id?: string; name: string; subject: string; htmlBody: string; textBody: string }
  setDraft: (draft: { id?: string; name: string; subject: string; htmlBody: string; textBody: string }) => void
  onEdit: (template: Template) => void
  onRemove: (id: string) => void
  onSubmit: () => Promise<void>
  isSaving: boolean
}) {
  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Templates</h2>
          <p className="text-sm text-neutral-400">Define reusable email copy with personalization tokens.</p>
        </div>
        {draft.id ? (
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-200">Editing {draft.name}</span>
        ) : null}
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
          className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-4"
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
              rows={10}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-neutral-400">Plain text (optional)</label>
            <textarea
              value={draft.textBody}
              onChange={(event) => setDraft({ ...draft, textBody: event.target.value })}
              rows={5}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-500">
              Tokens: <code className="text-emerald-300">{'{{business_name}}'}</code>, <code className="text-emerald-300">{'{{invite_link}}'}</code>
            </p>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving…' : draft.id ? 'Update template' : 'Create template'}
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {templates.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/20 bg-black/30 p-4 text-sm text-neutral-400">
              No templates yet. Create one to get started.
            </div>
          ) : (
            templates.map((template) => (
              <article key={template.id} className="rounded-xl border border-white/10 bg-black/40 p-4">
                <header className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-white">{template.name}</h3>
                    <p className="text-xs text-neutral-400">Subject: {template.subject}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(template)}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-neutral-200 hover:border-emerald-400 hover:text-emerald-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onRemove(template.id)}
                      className="rounded-full border border-red-500/40 px-3 py-1 text-xs text-red-200 hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </header>
                <details className="mt-3 text-xs text-neutral-300">
                  <summary className="cursor-pointer text-neutral-400">Preview HTML</summary>
                  <div className="prose prose-invert mt-2 max-w-none" dangerouslySetInnerHTML={{ __html: template.htmlBody }} />
                </details>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
