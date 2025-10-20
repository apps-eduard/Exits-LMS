# Design System - Visual Reference Guide

## Form Input Components

### Standard Input Field
```
┌─────────────────────────────────────┐
│ Label *                             │  ← text-sm font-medium text-gray-300
│                                     │
│ [___________________________]        │  ← bg-gray-800, border-gray-700, py-2.5
│                                     │     Focus: border-purple-500, ring-1
│ Helper or error text                │  ← text-xs text-gray-400 or text-red-400
└─────────────────────────────────────┘
```

### Section Container
```
┌─ Section with border ───────────────────────────────────────────┐
│                                                                  │
│ 🔴 Section Title                                                │  ← text-lg font-semibold
│                                                                  │
│ ┌──────────────────────┐  ┌──────────────────────┐             │
│ │ Label 1 *           │  │ Label 2 *           │             │  ← 2-column grid
│ │ [________________]   │  │ [________________]   │             │     gap-4
│ │                     │  │                     │             │
│ └──────────────────────┘  └──────────────────────┘             │
│                                                                  │
│ ┌──────────────────────┐  ┌──────────────────────┐             │
│ │ Label 3             │  │ Label 4             │             │
│ │ [________________]   │  │ [________________]   │             │
│ │                     │  │                     │             │
│ └──────────────────────┘  └──────────────────────┘             │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
  bg-gray-800/50, border-gray-700, rounded-lg, p-6
```

## Color Reference

### Backgrounds
```
Input:        bg-gray-800     #1f2937
Section:      bg-gray-800/50  #1f2937/50%
Disabled:     bg-gray-900     #111827
Page BG:      bg-gray-50      #f9fafb (light mode)
              dark:bg-gray-900 #111827 (dark mode)
```

### Borders
```
Normal:       border-gray-700  #374151
Focus:        border-purple-500 #a855f7
Error:        border-red-500   #ef4444
Success:      border-green-500 #22c55e
```

### Text Colors
```
Label:        text-gray-300    #d1d5db
Placeholder:  text-gray-500    #6b7280
Primary:      text-white       #ffffff
Secondary:    text-gray-400    #9ca3af
Error:        text-red-400     #f87171
Success:      text-green-400   #4ade80
Helper:       text-gray-500    #6b7280
```

### Focus & Hover States
```
Focus Border: border-purple-500
Focus Ring:   ring-1 ring-purple-500/50
Hover:        hover:bg-purple-700 (buttons)
              hover:text-gray-300 (text buttons)
Disabled:     disabled:bg-gray-600 disabled:cursor-not-allowed
```

## Typography Reference

### Headers
```
Page Title:     text-3xl font-bold text-white
Section Title:  text-lg font-semibold text-white
Tab Label:      text-sm font-medium
Label:          text-sm font-medium text-gray-300
```

### Text
```
Input Text:     text-white
Placeholder:    text-gray-500 text-sm
Helper Text:    text-xs text-gray-400
Error Message:  text-xs text-red-400
```

## Spacing Reference

### Vertical Spacing
```
Section to Section:        mb-6 or mb-8
Label to Input:            mb-2
Input to Error/Helper:     mt-1
Button spacing:            pt-4 or pt-6
```

### Horizontal Spacing
```
Section Padding:           p-4 or p-6
Input Padding:             px-4 py-2.5
Button Padding:            px-6 py-2.5
Grid Gap:                  gap-4
Button Gap:                gap-3
```

## Button Styles Reference

### Primary Button
```
┌─────────────────────┐
│ 💾 Update Profile   │  ← px-6 py-2.5
│                     │    bg-purple-600 hover:bg-purple-700
│                     │    text-white font-medium rounded-lg
└─────────────────────┘
```

### Secondary Button
```
┌─────────────────────┐
│     Cancel          │  ← px-6 py-2.5
│                     │    bg-gray-700 hover:bg-gray-600
│                     │    text-white font-medium rounded-lg
└─────────────────────┘
```

### Danger Button
```
┌──────────────────────────┐
│ 🔐 Change Password       │  ← px-6 py-2.5
│                          │    bg-red-600 hover:bg-red-700
│                          │    text-white font-medium rounded-lg
└──────────────────────────┘
```

## Tab Navigation Reference

### Tab Structure
```
┌─────────────────────────────────────────────────────────┐
│ 👤 Profile Information | 🔐 Change Password             │
│ ├─ Active border       │ ├─ Inactive border             │
│ └─ text-purple-400     │ └─ text-gray-400               │
└─────────────────────────────────────────────────────────┘
                         px-4 py-3 text-sm font-medium
                         border-b-2 transition-colors
```

## Message Display Reference

### Success Message
```
┌─────────────────────────────────────────────┐
│ ✓ Profile updated successfully!             │  ← text-sm
│                                             │    bg-green-900/30
│                                             │    border-green-700
│                                             │    text-green-400
└─────────────────────────────────────────────┘
                p-4 rounded-lg
```

### Error Message
```
┌─────────────────────────────────────────────┐
│ ✗ Failed to update profile                  │  ← text-sm
│                                             │    bg-red-900/30
│                                             │    border-red-700
│                                             │    text-red-400
└─────────────────────────────────────────────┘
                p-4 rounded-lg
```

### Info Message
```
┌─────────────────────────────────────────────┐
│ ℹ️ After changing your password...         │  ← text-sm
│                                             │    bg-blue-900/20
│                                             │    border-blue-700
│                                             │    text-blue-300
└─────────────────────────────────────────────┘
                p-4 rounded-lg
```

## Responsive Breakpoints

### Mobile (< 768px)
```
Grid Columns:     1 (single column)
Padding:          p-4
Label Size:       text-sm
Input Size:       py-2.5
Full-width inputs
```

### Tablet (768px - 1024px)
```
Grid Columns:     md:grid-cols-2 (2 columns at tablet+)
Padding:          p-4 lg:p-6
Responsive layout
```

### Desktop (> 1024px)
```
Grid Columns:     md:grid-cols-2 (2 columns)
Padding:          p-6
Max Width:        max-w-5xl
Full spacing
```

## Focus State Example

### Before Focus
```
Input with gray border
text: white, placeholder: gray-500
```

### After Focus (On Tab/Click)
```
Input with purple border + ring
┌─────────────────────────────────────────┐
│ [_____________________________] ← border-purple-500
│                                         │   ring-1 ring-purple-500/50
└─────────────────────────────────────────┘
Cursor active, ready for input
```

## Validation States

### Valid Input
```
┌────────────────────────┐
│ [____john doe________] │  ← border-gray-700 (normal)
│                        │
└────────────────────────┘
```

### Invalid Input (Touched & Error)
```
┌────────────────────────────────────────┐
│ [_________________________]             │  ← border-gray-700
│ ✗ First name is required              │    text-red-400 text-xs
└────────────────────────────────────────┘
```

### Disabled Input
```
┌────────────────────────┐
│ [john@example.com    ] │  ← bg-gray-900
│ Email cannot be changed│    text-gray-400
│ cursor-not-allowed     │
└────────────────────────┘
```

## Implementation Checklist

When building a new form:

- [ ] Wrap related fields in sections
- [ ] Add section borders (bg-gray-800/50 border-gray-700)
- [ ] Use 2-column grid (grid-cols-1 md:grid-cols-2 gap-4)
- [ ] Apply consistent label styling
- [ ] Use standard input class
- [ ] Add focus states (border-purple-500, ring-1)
- [ ] Add error display below inputs
- [ ] Use correct button styles
- [ ] Add action buttons (Cancel, Save)
- [ ] Add success/error messages
- [ ] Test responsive design
- [ ] Test validation
- [ ] Test accessibility (keyboard nav, focus visible)

## Quick Copy-Paste Templates

### Section Container Template
```html
<div class="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
  <h3 class="text-lg font-semibold text-white mb-4">Section Title</h3>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Input fields here -->
  </div>
</div>
```

### Input Field Template
```html
<div>
  <label class="block text-sm font-medium text-gray-300 mb-2">Label *</label>
  <input
    type="text"
    class="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-colors"
    placeholder="Placeholder text"
  />
</div>
```

### Button Group Template
```html
<div class="flex justify-end gap-3 pt-4">
  <button type="button" class="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors">
    Cancel
  </button>
  <button type="submit" class="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors">
    Save Changes
  </button>
</div>
```

---

**Date:** October 20, 2025
**Version:** 1.0
**Status:** Active & in use
