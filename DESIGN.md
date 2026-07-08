# Grob Design System

## Color Tokens

| Token    | Hex       | Usage                                |
|----------|-----------|--------------------------------------|
| `bg`     | `#0B0E14` | Page background (charcoal-navy)      |
| `surface`| `#12151D` | Cards, sidebars, inputs              |
| `border` | `#212633` | Dividers, outlines                   |
| `text`   | `#E7E9EE` | Primary body text                    |
| `muted`  | `#8B92A4` | Secondary / helper text              |
| `accent` | `#6E5BFF` | Primary interactive color (violet)   |
| `success`| `#3DDC97` | Deploy success states only (mint)    |
| `signal` | `#FFB020` | Warnings, build-in-progress (amber)  |

### Light mode (future)

When light mode is added, these map to:

| Token    | Hex       |
|----------|-----------|
| `bg`     | `#F8F9FC` |
| `surface`| `#FFFFFF` |
| `border` | `#E2E5EC` |
| `text`   | `#1A1D26` |
| `muted`  | `#8B92A4` |

## Typography

| Role        | Font             | Weights              |
|-------------|------------------|----------------------|
| Display     | Space Grotesk    | 500, 700             |
| Body        | Inter            | 400, 500, 600        |
| Code        | JetBrains Mono   | 400, 500             |

## Spacing

Use Tailwind's default spacing scale. Common gaps:
- Section padding: `p-6` (24px)
- Card padding: `p-4` (16px)
- Stack gaps between cards: `space-y-3` (12px)
- Grid gap: `gap-4` (16px)

## Component Patterns

### Cards / Surfaces
- Background: `surface` (#12151D)
- Border: 1px `border` (#212633)
- Border radius: `rounded-xl` (12px)
- Hover: 0.5 opacity white overlay via `hover:bg-white/[0.03]`

### Buttons
Primary (accent):
- Background: `accent` (#6E5BFF)
- Text: white
- Hover: brighten 10%
- Radius: `rounded-lg` (8px)
- Padding: `px-4 py-2`

Secondary:
- Border: 1px `border`
- Text: `text`
- Hover: `surface` background

### Inputs
- Background: transparent
- Border: 1px `border`
- Focus: ring 2px `accent`
- Text: `text`
- Placeholder: `muted`

### Status Dots
- Success: `success` (#3DDC97) — only for deploy success
- Building: `signal` (#FFB020) — amber pulse animation
- Failed: red (#EF4444)
- Pending: `muted` (#8B92A4)

### Navigation
- Sidebar bg: `surface` (#12151D)
- Active item: `accent` with 10% opacity (`accent/10`)
- Active text: `accent`
- Inactive text: `muted`
- Border right: `border`

## Dark Mode Only

This app is dark-mode-only for now. All tokens above assume `prefers-color-scheme: dark`.

## Icons

Use [Lucide](https://lucide.dev) icons via `lucide-react`.

## Animation

- Transitions: `transition-colors duration-150`
- Fade in: `animate-in fade-in duration-200`
- Hover card lift: `hover:-translate-y-0.5 transition-transform`
