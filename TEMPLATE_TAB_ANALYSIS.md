# Template Tab Analysis & Rebuild Plan

## Current Tab Structure

### Tab Navigation (CampaignControls.tsx lines 648-714)
```tsx
<nav className="border-b border-white/10 pb-4">
  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 mobile-scroll mobile-touch">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition mobile-touch ${
          activeTab === tab.id
            ? 'bg-emerald-500 text-emerald-950 shadow'
            : 'bg-white/5 text-neutral-300 hover:bg-white/10'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
</nav>

<div className="mt-6">
  {activeTab === 'campaigns' && <CampaignsView ... />}
  {activeTab === 'groups' && <GroupsPanel ... />}
  {activeTab === 'templates' && <TemplatesPanel ... />}
</div>
```

## Tab Content Structures

### 1. Campaigns Tab (CampaignsView)
**Structure**: Sidebar + Main Content (no white background wrapper)
```tsx
<div className="flex flex-col gap-6 lg:flex-row">
  <aside className="w-full lg:max-w-sm lg:flex-none">
    <CampaignsPanel ... />  // Has bg-white/5
  </aside>
  <main className="w-full flex-1 min-w-0">
    <SequenceEditor ... />  // Has space-y-6, NO white background
  </main>
</div>
```

### 2. Audience Groups Tab (GroupsPanel)
**Structure**: Single Panel (with white background wrapper)
```tsx
<section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6">
  // All content inside has white background
</section>
```

### 3. Templates Tab (TemplatesPanel) - CURRENT ISSUE
**Structure**: Sidebar + Main Content (should match campaigns)
```tsx
<div className="flex flex-col gap-6 lg:flex-row">
  <aside className="w-full lg:max-w-sm lg:flex-none">
    <TemplatesSidebar ... />  // Has bg-white/5
  </aside>
  <main className="w-full flex-1 min-w-0">
    <TemplatesMain ... />     // Has space-y-6, NO white background
  </main>
</div>
```

## The Problem

The templates tab is correctly structured to match the campaigns tab, but there's still a white background appearing. This suggests:

1. **Browser caching** - Old CSS is being served
2. **Build issue** - Changes aren't being compiled properly
3. **CSS specificity** - Some other CSS is overriding the styles
4. **Component wrapper** - There's an invisible wrapper adding white background

## Template Tab Requirements

### Inputs (Props)
```tsx
type TemplatesPanelProps = {
  templates: Template[]                    // List of existing templates
  draft: TemplateDraft                     // Current template being edited
  setDraft: (draft: TemplateDraft) => void // Update draft
  onEdit: (template: Template) => void     // Edit existing template
  onDuplicate: (template: Template) => void // Duplicate template
  onRemove: (id: string) => void          // Delete template
  onSubmit: () => Promise<void>           // Save template
  isSaving: boolean                       // Loading state
}

type TemplateDraft = {
  id?: string
  name: string
  subject: string
  htmlBody: string
  textBody: string
}
```

### Outputs (Functions)
- **Create Template**: Save new template to database
- **Edit Template**: Load existing template into draft
- **Duplicate Template**: Copy template with new name
- **Delete Template**: Remove template from database
- **Preview Template**: Live preview with variable substitution
- **Variable Rendering**: Replace {{variable}} with actual values

### Key Features
1. **Sidebar**: Template creation/editing form
2. **Main Content**: Live preview + existing templates list
3. **Variable System**: Support for {{business_name}}, {{invite_link}}, etc.
4. **Live Preview**: Real-time rendering with sample data
5. **Template Management**: CRUD operations for templates

## Rebuild Plan

### Step 1: Delete Current Implementation
- Remove `TemplatesPanel.tsx`
- Remove import from `CampaignControls.tsx`
- Remove template-related state and functions

### Step 2: Create New TemplatesPanel
- Copy `CampaignsView` structure exactly
- Create `TemplatesSidebar` (copy from `CampaignsPanel`)
- Create `TemplatesMain` (copy from `SequenceEditor`)
- Ensure NO white background wrappers

### Step 3: Implement Template-Specific Logic
- Template form (name, subject, HTML, text)
- Live preview with variable substitution
- Template list with edit/duplicate/delete actions
- Variable input controls

### Step 4: Test & Verify
- Ensure layout matches campaigns tab exactly
- Test all template operations
- Verify responsive design
- Check for any white background issues

## Files to Modify

1. **Delete**: `rsvp-app/src/components/admin/campaign/TemplatesPanel.tsx`
2. **Modify**: `rsvp-app/src/components/admin/campaign/CampaignControls.tsx`
   - Remove TemplatesPanel import
   - Remove template-related state/functions
   - Add new template tab implementation

## Expected Result

The templates tab should render exactly like the campaigns tab:
- Same container size and layout
- Sidebar with white background
- Main content with dark background
- No white padding/margins around main content
- Responsive design that works on mobile/tablet/desktop


