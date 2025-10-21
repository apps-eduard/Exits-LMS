# Role & Menu Matrix - Visual Hierarchy Guide 🎨

## Quick Visual Examples

This document shows visual examples of how the hierarchical UI displays menus with parent-child relationships.

---

## 📊 Matrix Display Examples

### Example 1: Simple Parent-Child Structure

**Menu Structure in Database:**
```
├─ Dashboard (parent)
│  └─ Dashboard Analytics (child)
│
├─ Settings (parent)
│  └─ Profile Settings (child)
```

**How It Appears in Matrix:**

```
┌─────────────────────────────────────────────────────────────┬──────────────┐
│ Menu / Navigation Hierarchy                                 │ Super Admin  │
├─────────────────────────────────────────────────────────────┼──────────────┤
│ 🏢 PLATFORM MENUS (4)                                       │              │
├─────────────────────────────────────────────────────────────┼──────────────┤
│ 🟨🟨🟨🟨🟨 [Amber Background]                                │              │
│ 📁 Dashboard                          👨‍👩‍👧 Parent ⚙️  │ ☑️  👨‍👩‍👧    │
│ Route: /dashboard                                           │              │
├─────────────────────────────────────────────────────────────┼──────────────┤
│ 🔵🔵🔵🔵🔵 [Blue Background]                                 │              │
│ └─ Dashboard Analytics                🔗 Child | 📈       │ ☑️  🔗      │
│ 📍 Parent: Dashboard                                        │              │
│ Route: /dashboard/analytics                                │              │
├─────────────────────────────────────────────────────────────┼──────────────┤
│ 🟨🟨🟨🟨🟨 [Amber Background]                                │              │
│ ⚙️ Settings                           👨‍👩‍👧 Parent ⚙️  │ ☑️  👨‍👩‍👧    │
│ Route: /settings                                            │              │
├─────────────────────────────────────────────────────────────┼──────────────┤
│ 🔵🔵🔵🔵🔵 [Blue Background]                                 │              │
│ └─ Profile Settings                   🔗 Child | 👤      │ ☑️  🔗      │
│ 📍 Parent: Settings                                         │              │
│ Route: /settings/profile                                   │              │
└─────────────────────────────────────────────────────────────┴──────────────┘
```

**Visual Elements:**
- 🟨 Amber background = Parent menu
- 🔵 Blue background = Child menu
- 👨‍👩‍👧 Badge = Parent status
- 🔗 Badge = Child status
- 📍 Text = Parent reference
- `└─` = Indentation for child

---

### Example 2: Multi-Role Assignment

**Multiple Roles with Different Access:**

```
┌──────────────────────────────────┬────────────┬──────────────┬──────────────┐
│ Menu / Navigation Hierarchy      │ Super Admin│ Tenant Admin │ User Manager │
├──────────────────────────────────┼────────────┼──────────────┼──────────────┤
│ 🏢 PLATFORM MENUS (3)            │            │              │              │
├──────────────────────────────────┼────────────┼──────────────┼──────────────┤
│ [Amber] 📁 Tenants              │ ☑️ 👨‍👩‍👧  │ ☐           │ ☑️ 👨‍👩‍👧    │
│ Route: /tenants                  │            │              │              │
├──────────────────────────────────┼────────────┼──────────────┼──────────────┤
│ [Blue] └─ Tenant Details        │ ☑️ 🔗     │ ☐           │ ☑️ 🔗        │
│ 📍 Parent: Tenants               │            │              │              │
│ Route: /tenants/details          │            │              │              │
├──────────────────────────────────┼────────────┼──────────────┼──────────────┤
│ [Amber] 👥 Users                │ ☑️ 👨‍👩‍👧  │ ☑️ 👨‍👩‍👧  │ ☑️ 👨‍👩‍👧    │
│ Route: /users                    │            │              │              │
├──────────────────────────────────┼────────────┼──────────────┼──────────────┤
│ [Blue] └─ User Permissions      │ ☑️ 🔗     │ ☑️ 🔗       │ ☑️ 🔗        │
│ 📍 Parent: Users                 │            │              │              │
│ Route: /users/permissions        │            │              │              │
└──────────────────────────────────┴────────────┴──────────────┴──────────────┘
```

**Key Observations:**
- Super Admin has all menus (protected role)
- Tenant Admin has Tenants + Users sections
- User Manager only manages Users section
- Purple background (☑️ 👨‍👩‍👧) = Protected role columns
- Parent assignments cascade to children automatically

---

### Example 3: Complex Hierarchy with Multiple Parents

```
┌──────────────────────────────────────┬─────────────┐
│ Menu / Navigation Hierarchy          │ Support     │
├──────────────────────────────────────┼─────────────┤
│ [Amber] 📁 Dashboard                │ ☑️ 👨‍👩‍👧    │
│ Route: /dashboard                   │             │
├──────────────────────────────────────┼─────────────┤
│ [Blue] └─ Dashboard Analytics      │ ☑️ 🔗      │
│ 📍 Parent: Dashboard                │             │
│ Route: /dashboard/analytics         │             │
├──────────────────────────────────────┼─────────────┤
│ [Amber] 📊 Reports                 │ ☑️ 👨‍👩‍👧    │
│ Route: /reports                     │             │
├──────────────────────────────────────┼─────────────┤
│ [Blue] └─ Sales Reports            │ ☑️ 🔗      │
│ 📍 Parent: Reports                  │             │
│ Route: /reports/sales               │             │
├──────────────────────────────────────┼─────────────┤
│ [Blue] └─ User Reports             │ ☑️ 🔗      │
│ 📍 Parent: Reports                  │             │
│ Route: /reports/users               │             │
├──────────────────────────────────────┼─────────────┤
│ [Amber] ⚙️ Settings                │ ☑️ 👨‍👩‍👧    │
│ Route: /settings                    │             │
├──────────────────────────────────────┼─────────────┤
│ [Blue] └─ Profile Settings         │ ☑️ 🔗      │
│ 📍 Parent: Settings                 │             │
│ Route: /settings/profile            │             │
└──────────────────────────────────────┴─────────────┘
```

**Features Shown:**
- One parent can have multiple children (Reports has 2 children)
- Color coding makes hierarchy immediate
- Parent reference shows which parent each child belongs to
- Support role gets appropriate menu access

---

## 🌓 Dark Mode Appearance

### Light Mode
```
Parent:
┌────────────────────────────────────────┐
│ [Light Amber Background]               │
│ 👨‍👩‍👧 Parent [Green Badge]              │
│ Text in Dark Gray (#374151)           │
└────────────────────────────────────────┘

Child:
┌────────────────────────────────────────┐
│ [Light Blue Background]                │
│ 🔗 Child [Blue Badge]                 │
│ Text in Dark Gray (#374151)           │
└────────────────────────────────────────┘
```

### Dark Mode
```
Parent:
┌────────────────────────────────────────┐
│ [Deep Amber/Brown Background]          │
│ 👨‍👩‍👧 Parent [Light Amber Badge]       │
│ Text in Light Gray (#E5E7EB)          │
└────────────────────────────────────────┘

Child:
┌────────────────────────────────────────┐
│ [Deep Blue Background]                 │
│ 🔗 Child [Light Blue Badge]           │
│ Text in Light Gray (#E5E7EB)          │
└────────────────────────────────────────┘
```

---

## 📐 Spacing and Indentation

### Hierarchy Levels

```
Level 0 (Parent Menu):
[Column] No indentation

Level 1 (Child of Parent):
[Column] └─ 16px left indentation

Level 2 (Grandchild):
[Column] └─ 32px left indentation (if supported)
```

### Visual Representation

```
Menu Structure:
Dashboard              ← Level 0, No indent
├─ Analytics          ← Level 1, 16px indent
│  ├─ Sales           ← Level 2, 32px indent
│  └─ Users           ← Level 2, 32px indent
└─ Preferences        ← Level 1, 16px indent

Settings              ← Level 0, No indent
├─ Profile            ← Level 1, 16px indent
└─ Notifications      ← Level 1, 16px indent
```

---

## 🎯 Interactive Elements

### Checkbox States

**Unchecked Parent:**
```
☐ Dashboard (Parent)
  ☐ Dashboard Analytics (Child)
```
- Unchecked = Role does NOT have access to menu

**Checked Parent:**
```
☑️ Dashboard (Parent) 👨‍👩‍👧
  ☑️ Dashboard Analytics (Child) 🔗
```
- All children automatically checked
- Parent shows 👨‍👩‍👧 indicator

**Partially Checked:**
```
⬜ Dashboard (Parent)
  ☑️ Dashboard Analytics (Child) 🔗
```
- Some children checked (visual but not typical)

**Protected Role:**
```
☑️ Dashboard (Protected Role)
  ☑️ Dashboard Analytics
```
- Purple background on role column
- Checkboxes disabled (read-only)

---

## 🔄 Dynamic Updates

### Before Menu Structure Change

**Database State:**
```
Settings (id: uuid-1, parent: null)
├─ Profile (id: uuid-2, parent: uuid-1)
```

**Matrix Display:**
```
[Amber] ⚙️ Settings (Parent)
[Blue]  └─ Profile (Child - Parent: Settings)
```

### After User Changes Parent

**User Action:** Edit Profile Settings to be under Dashboard instead

**Database State (Updated):**
```
Settings (id: uuid-1, parent: null)

Dashboard (id: uuid-3, parent: null)
├─ Profile (id: uuid-2, parent: uuid-3)  ← Parent changed!
```

**Matrix Display (Auto-Updated on Reload):**
```
⚙️ Settings (Standalone - no badge)

📊 Dashboard (Parent)
└─ Profile (Child - Parent: Dashboard)  ← Moved!
```

---

## 📋 Badge Reference Guide

| Badge | Icon | Meaning | Color | Use Case |
|-------|------|---------|-------|----------|
| **Parent** | 👨‍👩‍👧 | Menu has children | Green | Amber row, top-level with kids |
| **Child** | 🔗 | Menu has parent | Blue | Blue row, sub-menu item |
| **Role Check** | ☑️ | Assigned to role | Purple | Checked checkbox state |
| **Role Uncheck** | ☐ | Not assigned | Gray | Unchecked checkbox state |
| **Parent Indicator** | 👨‍👩‍👧 | Parent assigned | Purple | In checkbox area for checked parent |
| **Child Indicator** | 🔗 | Child assigned | Blue | In checkbox area for checked child |

---

## 🎓 Understanding the Layout

### Column Headers

```
┌─────────────────────────────────────────────────────────────┐
│ Menu / Navigation Hierarchy                                 │
│ [Wider column for menu info, about 320px]                  │
└─────────────────────────────────────────────────────────────┘
```

**Shows:**
- Menu name
- Parent/Child badge
- Menu icon
- Parent reference (if child)
- Route

### Role Headers

```
┌──────────────────┐
│ Super Admin      │
│ 45 menus ↓       │
│ ☑️ / ☐           │
│ [Toggle All]     │
└──────────────────┘
```

**Shows:**
- Role name
- Number of assigned menus
- Toggle all checkbox for non-protected roles
- Highlight color if protected role (purple)

---

## 💡 UI/UX Tips

### For Admins
1. **Amber = Parent** → Think "folder" - can contain items
2. **Blue = Child** → Think "file" - belongs to a folder
3. **Reference Text** → Always shows which folder (parent) a file belongs to
4. **Check Parent** → Automatically includes all children
5. **Uncheck Parent** → Automatically excludes all children

### Color Accessibility
- Not relying on color alone
- Badges provide text labels
- Icons reinforce meaning
- Readable in both light and dark modes
- Distinguishable for color-blind users

### Performance Notes
- Hierarchy calculated on load (not per-render)
- Grid layout is CSS-based (efficient)
- Smooth scrolling for large menus
- Lazy-loads by scope if many menus

---

## 🔧 Troubleshooting Visual Issues

### Problem: Can't see color difference
**Solution:** Check dark mode setting; may need to adjust display settings

### Problem: Indentation looks wrong
**Solution:** Browser zoom might affect spacing; reset to 100%

### Problem: Badges not showing
**Solution:** Check browser supports emoji; use fallback text if needed

### Problem: Parent reference text missing
**Solution:** Ensure menu has `parentMenuId` in database

---

## 📱 Responsive Behavior

### Desktop (1920px+)
- Full grid displayed
- Horizontal scroll for many roles
- All columns visible

### Tablet (768px - 1920px)
- Grid scales proportionally
- Horizontal scroll as needed
- Columns maintain readability

### Mobile (< 768px)
- Grid may truncate
- Horizontal scroll required
- Badges still visible
- Touch-friendly checkboxes

---

## 🎯 Summary of Visual Elements

**Parent Menus:**
```
✅ Amber background (light)
✅ 👨‍👩‍👧 Green badge reading "Parent"
✅ 📁 Folder icon
✅ 4px amber left border
✅ No indentation
```

**Child Menus:**
```
✅ Blue background (light)
✅ 🔗 Blue badge reading "Child"
✅ └─ Indentation arrow
✅ 4px blue left border
✅ 16px+ left margin for depth
✅ "📍 Parent: [Name]" reference
```

**Protected Roles:**
```
✅ Purple column background
✅ Disabled checkboxes
✅ "All menus assigned" indication
✅ No toggle buttons
```

---

This visual guide should help both admins and developers understand exactly how the hierarchical UI works and appears!

**Last Updated:** October 21, 2025
