# CV Page — Status and Remaining Checks

> Original plan: [proposal.md](./proposal.md), created 2026-04-15.
> Audited: 2026-10-31 against `d961784d5c73accbf0f022a109b8b97ee740f7d1`.

The CV page is implemented. Its current source is `content/cv/yusa-liu.md`;
`reference/YusaLiu_CV_2026_v2.md` is not present in the current tree and is not a
current copy source. Follow the [CV content decisions](../shared/site-redesign.md#cv-content)
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
- [x] Build the static site successfully at the audited revision:
  [Pages run 41187047616](https://github.com/yusaanthya/yusa-CV/actions/runs/41187047616).

## Superseded details

| April task | Current implementation |
| --- | --- |
| Label the action "Download PDF" | `app/cv/print-button.tsx` says "Print or save as PDF", accurately describing the browser print dialog. It does not generate a separate PDF file. |
| Change the "About" link in `header.tsx` | `header.tsx` delegates to `features/ui/components/nav-links.tsx`; its "CV" link points to `/cv`. |

## Remaining verification

- [ ] Inspect print preview for readable typography, margins, and pagination;
  confirm the header, footer, and print control are absent.
- [ ] Inspect the exported output for `/cv`. The route source and successful CI
  build are verified; this audit did not inspect the build artifact or route log.
- [ ] Check the rendered CV and print action in a browser.

The current CV already contains the ZONE WALLET role and its October 31 refresh.
This status update adds no career claims and does not certify a one-page resume
or a visually verified print layout.
