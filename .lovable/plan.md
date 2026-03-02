

## Roster Category Enhancements

### Overview
Three improvements to the roster category/folder system:
1. Drag-and-drop artists into category folders
2. Clickable folders that open a detail view showing only that folder's artists
3. Back navigation and category name subheader in the folder detail view

### Implementation

**1. Drag-and-Drop Artists into Folders**

- Wrap the Roster page content with `@hello-pangea/dnd`'s `DragDropContext` (already installed in the project)
- Make each `ArtistCard` in the uncategorized section a `Draggable`
- Make each `RosterFolderCard` a `Droppable` zone
- On drop, call `setArtistFolder.mutate({ artistId, folderId })` to assign the artist to that folder
- Add a visual drop indicator (border highlight) on folder cards when an artist is being dragged over them

**2. Category Folder Detail View**

Two approaches considered -- using **local state** (not a new route) keeps it simple and avoids new route/page setup. The folder detail will be rendered inline within the Roster page:

- Add a `selectedFolderId` state to `Roster.tsx`
- When a folder card is clicked, set `selectedFolderId` to that folder's ID
- When `selectedFolderId` is set, render a filtered view showing only that folder's artists (same `ArtistCard` grid) instead of the main roster view
- Clicking an artist card still navigates to `/roster/:artistId` as normal

**3. Back Button and Category Subheader**

- When inside a folder detail view, replace the page title area with:
  - A back arrow button (matching the `ArrowLeft` pattern used in `ArtistDetail.tsx`) that clears `selectedFolderId` and returns to the main roster
  - The category/folder name displayed as a subheader beneath or beside the "Roster" title

### Technical Details

**Files to modify:**
- `src/pages/Roster.tsx` -- Add DnD context, folder detail state, conditional rendering for folder view vs main view, back button
- `src/components/roster/ArtistCard.tsx` -- Wrap with `Draggable` (or accept drag props from parent)
- `src/components/roster/RosterFolderCard.tsx` -- Wrap with `Droppable` and add drop highlight styling

**New components (none required)** -- all changes fit within existing files.

**DnD structure in Roster.tsx:**
```text
DragDropContext (onDragEnd -> assign artist to folder)
  |
  +-- Droppable (each folder card)
  |     RosterFolderCard with drop highlight
  |
  +-- Droppable ("uncategorized" zone)
        Draggable (each ArtistCard)
```

**Folder detail view logic in Roster.tsx:**
```text
if (selectedFolderId) {
  render:
    - Back arrow button + folder name subheader
    - Grid of ArtistCards filtered to folder_id === selectedFolderId
} else {
  render:
    - Current folder cards grid + uncategorized artists grid (with DnD)
}
```

