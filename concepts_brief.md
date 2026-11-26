# URL Create and Edit: Settings Cards

* **Author:** gameupyourlife
* **Date:** 2026-11-26

## Overview

The URL detail page uses separate chart cards and tinted icons on its stat cards. Create and Edit use one large form card with expandable groups. Give those screens the same visual structure as the detail page: focused cards with visible settings, clear headings, and tinted icons. Users should be able to find any setting without opening its section first.

## Analysis

The seven Goldfish reviews found no blocker. The main trade-off is a longer page on mobile. Put the destination and short link first in visual and keyboard order, label optional settings, and stack the same cards in one column on narrow screens. Keep one clearly labeled primary action. Check how far a destination-only create has to scroll before deciding whether the footer needs a different placement; don't add a second save button by default.

Cards separate the settings visually, not how they're saved. Both routes already render `UrlCreationCard`. Keep one form, one validation schema, and one submission. Current inline errors depend on which fields the user has visited. Check that submitting without visiting every field reveals the first error and makes it easy to reach. If needed, show the existing error and focus the field without changing what counts as valid.

Country Redirects needs enough room for multiple rules. Keep the builder visible and mount it only once across screen sizes. Keep Raw JSON behind its existing toggle: it is an alternate editor for the same data, not another settings group. Verify that a destination-only edit preserves redirect order, the default rule, and unrelated metadata. Track any existing serialization bug separately rather than silently changing it in this refactor.

## Goals vs. Non-Goals

* **In scope:** Borrow the detail page's chart grid spacing and stat-card icon accents. Show all existing settings groups without expanders, use headings that work without color, and keep one page-level submit in both modes.
* **Out of scope:** New URL settings, per-card saves, changes to validation rules or saved data, new telemetry, database migrations, and changes to the detail page or its analytics.

## Alternatives Weighed

* **Restyle the existing expanders.** This keeps the page shorter but still hides settings and their errors.
* **Save each card separately.** This brings the save button closer but creates partial saves and makes users track which changes are already applied.
* **Reuse the analytics chart components.** This would tie the form to analytics. Use existing card primitives and borrow the visual treatment instead.

## Key Decisions & Staging for Next Steps

1. Use the same card order in both modes: Destination & Short Link (including the preview), Title & Description, Access & Limits, Campaign Tracking (UTM), and Country Redirects & Metadata. Give the last card the full grid width. Match reading and keyboard order to the visual order.
2. Keep the existing save behavior: an empty slug generates one on Create and keeps the current one on Edit. Create still resets and shows the new link after success; Edit still returns to URL Details. Preserve Reset, Cancel, existing feedback, and input on failure. Rule and JSON controls must not submit the form.
3. Before release, check keyboard order, long link previews, narrow screens, untouched invalid fields, a rejected save that retains input, a minimal Create, and an Edit with prefilled settings and metadata. Keep the existing success event unchanged. The change can be reverted without data rollback.
