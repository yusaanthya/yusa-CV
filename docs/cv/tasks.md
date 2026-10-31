# CV Page — Status

> Original plan: [proposal.md](./proposal.md), created 2026-04-15.
> Audited: 2026-10-31 at `d961784`.

The CV page is implemented. Its source is `content/cv/yusa-liu.md`; the April
copy source `reference/YusaLiu_CV_2026_v2.md` no longer exists. Follow the [CV content decisions](../shared/site-redesign.md#cv-content)
when updating the curated public variant.

## Implemented

- [x] Create the `content/cv/` directory.
- [x] Store the CV content in `content/cv/yusa-liu.md`.
- [x] Read that file directly in the `app/cv/page.tsx` Server Component.
- [x] Reuse `markdownToHtml()` from `lib/markdown.ts`.
- [x] Render HTML with `dangerouslySetInnerHTML` and Typography styling. The
  redesign uses `prose prose-site` instead of the original neutral/invert classes.
- [x] Place `<PrintButton />` above the CV sheet.
- [x] Declare the print-button component with `"use client"`.
- [x] Invoke `window.print()` when the button is clicked.
- [x] Hide the print control with `print:hidden`.
- [x] Hide `header` and `footer` in `@media print` rules in `app/globals.css`.
- [x] Export `/cv` as `out/cv/index.html` (local static export, 2026-10-31).
- [x] Build the static site successfully:
  [Pages run 41187047616](https://github.com/yusaanthya/yusa-CV/actions/runs/41187047616).

## Superseded details

| April task | Current implementation |
| --- | --- |
| Label the action "Download PDF" | `app/cv/print-button.tsx` says "Print or save as PDF", accurately describing the browser print dialog. It does not generate a separate PDF file. |
| Change the "About" link in `header.tsx` | `header.tsx` delegates to `features/ui/components/nav-links.tsx`; its "CV" link points to `/cv`. |

## Remaining checks

- [ ] Check the rendered `/cv` page and print action in a browser.
- [ ] Check print preview for readable typography, margins, and pagination, with
  the header, footer, and print control hidden.
