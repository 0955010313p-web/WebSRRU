# SRRU Style Guide

Brand palette (primary):
- `--srru-green`: #1F8A4C
- `--srru-purple`: #6B3FA0
- `--srru-yellow`: #F6C84C

Neutral & surface:
- background: #FFFFFF
- surface: #F8FAFC
- muted: #6B7280

Typography:
- Heading font: Inter / Geist (variable) or `Sarabun` for Thai
- Body font: Noto Sans / Roboto / system UI
- Base font-size (mobile): 16px

Spacing & layout:
- Use 8px spacing scale (4,8,12,16,24,32)
- Max content width: 1024–1280px for desktop, full width on mobile

Micro-interactions:
- Buttons: 160ms scale and subtle shadow
- Cards: lift on hover (180ms)
- Inputs: glow on focus using `--srru-green`

Accessibility:
- Ensure contrast AA for text on background
- Touch targets >= 44px

Usage:
- Primary CTA: `background: var(--srru-green); color: white`.
- Secondary: `border: 1px solid var(--srru-purple)`
