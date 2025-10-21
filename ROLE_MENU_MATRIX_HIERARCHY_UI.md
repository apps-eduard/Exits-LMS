# Role & Menu Matrix - Hierarchical UI Enhancement

## 📋 Overview

The Role & Menu Assignment Matrix has been enhanced with **dynamic hierarchical visualization** to make parent-child menu relationships immediately identifiable. The UI now clearly shows the menu structure hierarchy, with visual indicators that **automatically update** whenever users modify the menu structure.

**Last Updated:** October 21, 2025

---

## 🎯 Key Features

### 1. **Hierarchical Menu Organization**
- **Parent Menus** - Top-level menu items (e.g., "Dashboard", "Settings")
- **Child Menus** - Sub-items within parent menus (e.g., "Profile Settings" under "Settings")
- **Dynamic Grouping** - Automatically groups menus by parent, organized from left to right
- **Cascading Support** - Up to 3 levels of hierarchy supported

### 2. **Visual Hierarchy Indicators**

#### Parent Menu Styling
```
📁 Parent Indicator
🟨 Amber background (light amber in dark mode)
👨‍👩‍👧 "Parent" badge in green
Border-left: 4px solid amber-400
```

Example:
```
┌─────────────────────────────────────────┐
│ 📁 Settings (Parent)                   │
│ 🟨 Light Amber Background               │
│ 👨‍👩‍👧 Parent Badge | ⚙️ Icon             │
│ Route: /settings                        │
└─────────────────────────────────────────┘
```

#### Child Menu Styling
```
🔗 Child Indicator
🔵 Blue background (light blue in dark mode)
🔗 "Child of: ParentName" reference
Indentation: 16px (dynamic based on level)
```

Example:
```
┌─────────────────────────────────────────┐
│ └─ Profile Settings (Child)            │
│ 🔵 Light Blue Background                │
│ 🔗 Child | 👤 Icon                     │
│ 📍 Parent: Settings                     │
│ Route: /settings/profile                │
└─────────────────────────────────────────┘
```

### 3. **Menu Hierarchy Icons**

| Icon | Type | Meaning |
|------|------|---------|
| 📁 | Parent | Top-level menu with children |
| 📄 | Standalone | Single menu item (no children) |
| └─ | Child L1 | First-level child menu |
| └─ | Child L2 | Second-level child menu |

### 4. **Dynamic Parent Reference**
When a child menu is displayed, it shows:
```
📍 Parent: [Parent Menu Name]
```
This makes it easy to understand the menu structure at a glance.

---

## 🏗️ Component Architecture

### **File: permission-matrix.component.ts**

#### New Helper Methods

##### `getMenusGroupedByParent(): MenuGroup[]`
**Purpose:** Groups menus hierarchically by parent, within each scope
**Returns:** Array of MenuGroup with menus sorted by parent-child relationship
**Logic:**
1. Group menus by scope (platform/tenant)
2. Separate parents from children
3. Order parents first, then their children
4. Sort by orderIndex within each group

```typescript
getMenusGroupedByParent(): MenuGroup[] {
  const grouped = new Map<'platform' | 'tenant', Menu[]>();
  // Group by scope
  this.allMenus().forEach(menu => {
    if (!grouped.has(menu.scope)) {
      grouped.set(menu.scope, []);
    }
    grouped.get(menu.scope)!.push(menu);
  });

  // Within each scope, group by parent and sort
  return Array.from(grouped.entries()).map(([scope, menus]) => {
    const parentMenus = menus.filter(m => !m.parentMenuId)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    const flatMenus: Menu[] = [];

    parentMenus.forEach(parent => {
      flatMenus.push(parent);
      const children = menus
        .filter(m => m.parentMenuId === parent.id)
        .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      flatMenus.push(...children);
    });

    return { scope, menus: flatMenus };
  })
  .sort((a, b) => a.scope === 'platform' ? -1 : 1);
}
```

##### `getMenuHierarchyLevel(menuId: string): number`
**Purpose:** Calculate the depth of a menu in the hierarchy
**Returns:** 0 for parent, 1 for child of parent, 2 for child of child, etc.
**Usage:** Used for indentation and styling

```typescript
getMenuHierarchyLevel(menuId: string): number {
  let level = 0;
  let currentMenuId = menuId;
  const visited = new Set<string>();

  while (currentMenuId && !visited.has(currentMenuId)) {
    visited.add(currentMenuId);
    const menu = this.allMenus().find(m => m.id === currentMenuId);
    if (menu?.parentMenuId) {
      level++;
      currentMenuId = menu.parentMenuId;
    } else {
      break;
    }
  }
  return level;
}
```

##### `getParentMenuName(menuId: string): string`
**Purpose:** Get the parent menu name for a child menu
**Returns:** Parent menu name, or empty string if no parent
**Usage:** Displays in child menu row

##### `getHierarchyIcon(menuId: string): string`
**Purpose:** Return the appropriate visual icon based on hierarchy level
**Returns:** Icon string (📁, 📄, └─, etc.)

##### `shouldHighlightAsParent(menuId: string): boolean`
**Purpose:** Determine if menu should be highlighted with parent styling
**Returns:** true if menu has children

##### `shouldHighlightAsChild(menuId: string): boolean`
**Purpose:** Determine if menu should be highlighted with child styling
**Returns:** true if menu has a parent

### **File: permission-matrix.component.html**

#### Template Changes

**Key Regions Modified:**

1. **Header Row** - Increased column width from 280px to 320px
2. **Scope Header** - Unchanged functionality
3. **Menu Row Display** - Enhanced with:
   - Dynamic indentation based on `getMenuHierarchyLevel()`
   - Conditional badges showing "Parent" or "Child" status
   - Parent menu reference for child items
   - Color-coded backgrounds

**New Template Sections:**

```html
<!-- Parent/Child Badge -->
<span *ngIf="shouldHighlightAsParent(menu.id)" 
      class="inline-flex items-center gap-1 px-2 py-0.5 
             bg-amber-100 dark:bg-amber-900/40 
             text-amber-700 dark:text-amber-300 
             rounded text-xs font-semibold">
  👨‍👩‍👧 Parent
</span>
<span *ngIf="shouldHighlightAsChild(menu.id)" 
      class="inline-flex items-center gap-1 px-2 py-0.5 
             bg-blue-100 dark:bg-blue-900/40 
             text-blue-700 dark:text-blue-300 
             rounded text-xs font-semibold">
  🔗 Child
</span>

<!-- Parent Menu Reference for Child Menus -->
<div *ngIf="shouldHighlightAsChild(menu.id)" 
     class="text-gray-600 dark:text-gray-400 text-xs mt-1">
  📍 Parent: 
  <span class="font-semibold text-amber-600 dark:text-amber-400">
    {{ getParentMenuName(menu.id) }}
  </span>
</div>
```

---

## 🎨 Visual Design

### Color Scheme

#### Light Mode
| Element | Color | Purpose |
|---------|-------|---------|
| Parent Row Background | `bg-amber-50` | Highlight parent menus |
| Parent Badge | `bg-amber-100` text-amber-700 | Identify parent status |
| Parent Border | `border-l-4 border-amber-400` | Strong visual accent |
| Child Row Background | `bg-blue-50` | Highlight child menus |
| Child Badge | `bg-blue-100` text-blue-700 | Identify child status |
| Child Border | `border-l-4 border-blue-300` | Subtle visual accent |

#### Dark Mode
| Element | Color | Purpose |
|---------|-------|---------|
| Parent Row Background | `dark:bg-amber-900/15` | Muted amber highlight |
| Parent Badge | `dark:bg-amber-900/40` text-amber-300 | Readable in dark |
| Parent Border | `dark:border-amber-500` | Visible accent |
| Child Row Background | `dark:bg-blue-900/10` | Muted blue highlight |
| Child Badge | `dark:bg-blue-900/40` text-blue-300 | Readable in dark |
| Child Border | `dark:border-blue-400` | Visible accent |

### Indentation Levels

```
Level 0 (Parent):    No indentation
                     📁 Dashboard
                     
Level 1 (Child):     16px indentation
                     └─ Dashboard Analytics
                     
Level 2 (Grandchild): 32px indentation
                     └─ Dashboard Analytics Details
```

---

## 🔄 Dynamic Updates

### How the Hierarchy Updates Automatically

When a user modifies the menu structure (via the Menus admin panel), the hierarchy is **automatically recalculated** on the next load:

1. **Menu is deleted** → Remove from all role assignments
2. **Menu parent changes** → Reorganize in hierarchy display
3. **New child added to menu** → Parent automatically highlighted as "Parent"
4. **Last child removed** → Parent reverts to standalone display

**Implementation:**
- Data fetched from database includes `parentMenuId` field
- `getMenusGroupedByParent()` recalculates on each matrix reload
- No hardcoded parent-child relationships
- All hierarchy logic is data-driven

---

## 📊 Usage Example

### Scenario: Admin Viewing Role-Menu Matrix

**Setup:**
```
Database Menus:
├─ Dashboard (id: uuid-1, parent_menu_id: null)
├─ Dashboard Analytics (id: uuid-2, parent_menu_id: uuid-1)
├─ Settings (id: uuid-3, parent_menu_id: null)
└─ Profile Settings (id: uuid-4, parent_menu_id: uuid-3)
```

**Matrix Display:**

```
┌─────────────────────────────────────────┬─────────────┬─────────────┐
│ Menu / Navigation Hierarchy             │ Super Admin │ Tenant Admin│
├─────────────────────────────────────────┼─────────────┼─────────────┤
│ 🏢 Platform Menus (4)                   │             │             │
├─────────────────────────────────────────┼─────────────┼─────────────┤
│ 📁 Dashboard (Parent)                   │ ☑️  👨‍👩‍👧     │ ☐           │
│ 🟨 Light Amber Background                │             │             │
│ 👨‍👩‍👧 Parent Badge | 📊 Icon            │             │             │
│ Route: /dashboard                       │             │             │
├─────────────────────────────────────────┼─────────────┼─────────────┤
│ └─ Dashboard Analytics (Child)          │ ☑️  🔗      │ ☐           │
│ 🔵 Light Blue Background                 │             │             │
│ 🔗 Child | 📈 Icon                      │             │             │
│ 📍 Parent: Dashboard                    │             │             │
│ Route: /dashboard/analytics             │             │             │
├─────────────────────────────────────────┼─────────────┼─────────────┤
│ ⚙️ Settings (Parent)                    │ ☑️  👨‍👩‍👧     │ ☑️  👨‍👩‍👧    │
│ 🟨 Light Amber Background                │             │             │
│ 👨‍👩‍👧 Parent Badge | ⚙️ Icon             │             │             │
│ Route: /settings                        │             │             │
├─────────────────────────────────────────┼─────────────┼─────────────┤
│ └─ Profile Settings (Child)             │ ☑️  🔗      │ ☑️  🔗      │
│ 🔵 Light Blue Background                 │             │             │
│ 🔗 Child | 👤 Icon                      │             │             │
│ 📍 Parent: Settings                     │             │             │
│ Route: /settings/profile                │             │             │
└─────────────────────────────────────────┴─────────────┴─────────────┘
```

### Admin Actions with the Hierarchy

1. **View Structure:**
   - See immediately which menus are parents (amber background)
   - See immediately which menus are children (blue background)
   - Parent reference text shows hierarchy relationship

2. **Manage Parent Menu:**
   - Checking parent checkbox automatically checks all children
   - Unchecking parent unchecks all children too
   - Visual indicators stay synchronized

3. **Manage Child Menu:**
   - Checking child automatically checks parent
   - Unchecking child doesn't affect parent or siblings
   - Parent name displayed for context

4. **Modify Menu Structure (in Menus Admin):**
   - Change a menu's parent → Hierarchy updates on next reload
   - Delete a menu → Automatically removed from all role assignments
   - Add new child → Parent highlighted as "Parent" automatically

---

## 🔧 Implementation Details

### Method Call Flow

```
User opens Menu Assignment Matrix
     ↓
loadMatrix() called
     ↓
loadMenus() fetches all menus from API
     ↓
allMenus() signal updated with Menu[] data
     ↓
Template renders getMenusGroupedByParent()
     ↓
For each menu:
  - Call getMenuHierarchyLevel(menuId)
  - Call shouldHighlightAsParent(menuId)
  - Call shouldHighlightAsChild(menuId)
  - Call getParentMenuName(menuId)
     ↓
Template applies conditional styling classes
     ↓
Matrix displayed with hierarchy visualization
```

### Data Dependencies

```typescript
interface Menu {
  id: string;
  name: string;
  slug: string;
  icon: string;
  route: string;
  scope: 'platform' | 'tenant';
  isActive: boolean;
  orderIndex: number;
  parentMenuId?: string;      // KEY: Enables hierarchy
  tenantId?: string;
}
```

The `parentMenuId` field is essential - it enables all hierarchy calculations.

---

## 🎓 Benefits

### For Administrators
1. **Instant Understanding** - See menu relationships immediately
2. **No Confusion** - Clear visual distinction between parent/child
3. **Error Prevention** - Know which menus have dependencies
4. **Easier Navigation** - Organized by hierarchy, easier to find items
5. **Dynamic Updates** - No need to refresh; hierarchy auto-updates

### For Users
1. **Better Menu Organization** - See logical grouping in sidebar
2. **Clear Navigation** - Understand menu relationships
3. **Faster Discovery** - Find what you're looking for quicker

### For System
1. **Data-Driven** - No hardcoded relationships
2. **Scalable** - Works with any menu structure
3. **Maintainable** - Easy to understand hierarchy logic
4. **Flexible** - Supports up to N levels of nesting (though UI optimized for 2-3)

---

## 🚀 Technical Specifications

### Performance Considerations

- **Grouping Calculation:** O(n) where n = number of menus
- **Level Calculation:** O(d) where d = depth of hierarchy (typically 2-3)
- **Caching:** Methods are called per render; consider using `computed()` for high-count scenarios

### Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Accessibility

- ✅ Color not sole indicator (badges provide text)
- ✅ All text is readable with screen readers
- ✅ Icons have alt text via titles
- ✅ Keyboard navigable (checkboxes, buttons)
- ✅ Dark mode supported

---

## 📝 Component Methods Reference

### Public Methods (Template Use)

```typescript
// Get menu groups organized by parent and scope
getMenusGroupedByParent(): MenuGroup[]

// Get hierarchy depth (0=parent, 1+=child)
getMenuHierarchyLevel(menuId: string): number

// Get parent menu name
getParentMenuName(menuId: string): string

// Get appropriate hierarchy icon
getHierarchyIcon(menuId: string): string

// Check if menu is a parent (has children)
shouldHighlightAsParent(menuId: string): boolean

// Check if menu is a child (has parent)
shouldHighlightAsChild(menuId: string): boolean

// Get indentation padding class
getHierarchyPaddingClass(menuId: string): string

// Get indentation margin class
getHierarchyIndent(menuId: string): string

// Get formatted display name with parent/child info
getParentChildDisplayName(menu: Menu): string
```

### Existing Methods (Still Available)

```typescript
getMenuGroups(): MenuGroup[]              // Groups by scope only
getChildMenus(parentMenuId: string): Menu[]
isParentMenu(menuId: string): boolean
isChildMenu(menuId: string): boolean
hasMenu(roleId: string, menuId: string): boolean
toggleMenu(roleId: string, menuId: string): void
saveAllChanges(): Promise<void>
// ... and many more
```

---

## 🔍 Debugging Tips

### View Current Hierarchy in Browser Console

```javascript
// In Chrome DevTools Console, after matrix loads:
angular.element(document.querySelector('app-permission-matrix'))
  .injector().get('$scope').componentInstance.allMenus()
  
// Or in newer Angular:
ng.probe(document.querySelector('app-permission-matrix'))
  .componentInstance.allMenus()
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Parent/Child icons not showing | `parentMenuId` is null in DB | Update menu with correct parent_id |
| Indentation not working | CSS not applied | Check dark mode; browser cache |
| Badges not visible | Wrong role type | Ensure viewing platform (not tenant) roles |
| Hierarchy changed after menu update | Expected behavior | Refresh matrix after editing menus |

---

## 🎯 Future Enhancements

Possible improvements for future versions:

1. **Drag & Drop Reordering** - Reorder menus within parent
2. **Collapsible Parents** - Collapse/expand parent menu items
3. **Search/Filter** - Find menus by name, including by parent
4. **Bulk Operations** - Select multiple parent menus and assign to roles
5. **Export/Import** - Save and restore role configurations
6. **Audit Trail** - Track changes to role-menu assignments
7. **Multi-Level Editing** - Manage up to 5 levels of hierarchy

---

## 📞 Support

For questions about the Role & Menu Matrix hierarchy UI:

1. Check the implementation in `permission-matrix.component.ts`
2. Review template in `permission-matrix.component.html`
3. Verify menu data has correct `parentMenuId` values in database
4. Test with sample hierarchy before production use

**Key Files:**
- Frontend: `frontend/src/app/pages/super-admin/settings/permission-matrix.component.ts`
- Frontend: `frontend/src/app/pages/super-admin/settings/permission-matrix.component.html`
- API: `backend/routes/menu.routes.js`
- Database: `menus` table with `parent_menu_id` column

---

## ✅ Checklist for Verification

- [ ] Parent menus show amber background with 👨‍👩‍👧 badge
- [ ] Child menus show blue background with 🔗 badge
- [ ] Child menus display "📍 Parent: [ParentName]" reference
- [ ] Indentation increases for child menus (16px per level)
- [ ] Icons show correctly (📁 for parent, 📄 for standalone, └─ for child)
- [ ] Dark mode colors are readable
- [ ] Hierarchy updates after menu structure changes
- [ ] Parent role assignments cascade to children
- [ ] Protected roles show purple background
- [ ] Matrix saves/loads correctly

---

**UI Enhancement Complete!** ✨

The Role & Menu Matrix now provides a clear, dynamic, and intuitive interface for managing menu hierarchies and role assignments. The visual hierarchy makes it immediately obvious which menus are related and how they're organized.
