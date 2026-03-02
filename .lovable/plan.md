

## Notes Editor Improvements + Social Image Fix

### 1. Enter in title moves focus to body
When the user presses Enter in the title `<input>`, prevent the default behavior and focus the Tiptap editor body instead.

### 2. Reorganize toolbar into 3 dropdown groups
Replace the current flat toolbar with 3 distinct icon-triggered dropdowns:

- **Block type dropdown** (existing "Body v" dropdown) -- options: Body, Title, Heading, Subheading
- **List dropdown** (new, using `List` icon) -- options: Bullet List, Numbered List, Checklist (requires adding `@tiptap/extension-task-list` and `@tiptap/extension-task-item`)
- **Text effects dropdown** (new, using `Type` icon) -- options: Bold, Italic, Underline, Strikethrough

### 3. Keyboard shortcuts
Tiptap's StarterKit already handles Cmd+B (bold), Cmd+I (italic). The Underline extension handles Cmd+U. For Cmd+S (strikethrough), add a custom keyboard shortcut via `addKeyboardShortcuts` on the StarterKit or a custom extension, since the default strikethrough shortcut is Cmd+Shift+S.

### 4. Checklist support
Install `@tiptap/extension-task-list` and `@tiptap/extension-task-item` and add them to the editor extensions. Add CSS styles for task list checkboxes.

### 5. Social sharing image (og:image)
The current `og:image` points to a cropped flag image. You need to upload a properly formatted social preview image (recommended 1200x630px) and update the `og:image` and `twitter:image` meta tags in `index.html`. Since this is controlled by the image URL in the meta tags, you can either:
- Upload a new social image to the project's `public/` folder and reference it with the full `https://rollout.cc/social-preview.png` URL
- Or upload a new image to the same storage bucket

I'd recommend creating a proper 1200x630 social card image. **Do you have a social preview image you'd like to use, or should I create a simple branded one using the Rollout logo on a dark background?**

### Technical Details

**Files to modify:**
- `src/components/notes/NotesPanel.tsx` -- Add Enter handler on title input, restructure toolbar into 3 dropdowns, add TaskList/TaskItem extensions, add Cmd+S shortcut for strikethrough
- `src/index.css` -- Add task list checkbox styling
- `index.html` -- Update og:image once new image is provided
- Install: `@tiptap/extension-task-list`, `@tiptap/extension-task-item`

**Title Enter handler (line ~436-444):**
Add `onKeyDown` to the title input that calls `editor.commands.focus("start")` on Enter.

**Toolbar restructure:**
Replace the current inline B/I/U/S buttons with a `Type` icon dropdown containing those 4 options. Add a `List` icon dropdown with Bullet, Numbered, and Checklist. Keep the existing block-type dropdown as-is.

**Strikethrough shortcut:**
Create a small custom extension or configure StarterKit's strike to map `Mod-s` in addition to the default `Mod-Shift-s`.

