# Todo App Color Palette 🎨

## Design Philosophy

A balanced tricolor palette with blue as the primary color, yellow for editing states, and orange for destructive actions. Body text uses readable black/gray for optimal readability.

## Color Breakdown

### Primary: Blue Spectrum 💙

- **Background Gradient**: `from-blue-50 via-sky-50 to-cyan-50` - Soft, subtle blue gradient
- **Main Title**: `text-blue-600` - Bold, vibrant blue
- **Primary Button**: `bg-blue-500` → `hover:bg-blue-600` - Classic blue for main actions
- **Checkboxes**: `text-blue-600` - Blue when checked
- **Focus Rings**: `ring-blue-400` - Blue accessibility indicators
- **Borders (hover)**: `border-blue-300` - Blue accents on interaction

### Secondary: Yellow 💛

- **Edit Mode Background**: `bg-yellow-50` - Soft yellow to indicate editing
- **Edit Mode Border**: `border-yellow-300` - Yellow frame for edit state
- **Edit Mode Focus**: `ring-yellow-400` - Yellow focus ring when editing

### Accent: Orange 🧡

- **Delete Button**: `text-orange-600` → `hover:text-orange-700` - Orange for destructive actions
- **Delete Hover**: `hover:bg-orange-50` - Subtle orange background on hover

### Neutral: Black/Gray for Readability 📖

- **Body Text**: `text-gray-800` - Dark gray for optimal readability
- **Completed Tasks**: `text-gray-400` - Lighter gray for completed items
- **Subtitle**: `text-gray-700` - Medium gray for secondary text
- **Footer**: `text-gray-600` - Subtle gray for footer
- **Borders**: `border-gray-200` / `border-gray-300` - Neutral borders
- **Loading Text**: `text-gray-700` - Readable loading message

### Error States ❌

- **Error Text**: `text-red-600` - Red for validation errors
- **Error Backgrounds**: `bg-red-50` - Soft red backgrounds

## Visual Hierarchy

1. **Blue** = Primary actions, branding, trust
2. **Yellow** = Temporary states (editing)
3. **Orange** = Caution/destructive actions (delete)
4. **Black/Gray** = Content, readability first

## Accessibility

- All text meets WCAG AA contrast requirements
- Focus indicators use blue (`#3b82f6`) for consistency
- Color is never the only indicator of state (icons, text, borders also used)

## User Experience

- **Subtle background**: Doesn't compete with content
- **Readable text**: Black/gray ensures easy reading
- **Clear actions**: Blue buttons stand out
- **Safe editing**: Yellow indicates temporary edit mode
- **Careful deletion**: Orange warns before destructive action
