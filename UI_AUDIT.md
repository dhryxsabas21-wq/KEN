# Portfolio UI/UX audit

The review covers the home page, project details, navigation, contact links, and résumé.
The warm charcoal, cream, copper, serif headings, and interactive 3D treatment are retained.

| Finding | Change |
| --- | --- |
| Body copy was 12.5px mono, with numerous labels below 11px. | Use shared, self-hosted Inter at 16px for prose. Keep mono for short labels at 11px or larger and use sentence case for descriptions and feature lists. |
| Projects appeared after three other sections. | Put selected work directly after the hero and align navigation and section numbering with the reading order. |
| Five small mobile navigation links competed for space. | Keep Work, Services, and About visible on small screens; show the complete navigation on desktop and in the footer. |
| Active-section tracking could miss long sections; combined anchor offsets created excess space. | Track section positions on scroll and resize, clear the active state at contact, and use consistent fixed-header offsets. |
| Several controls were only 32–40px tall. | Give primary actions, navigation, and footer links at least 44px touch height. |
| Oversized floating service numbers competed with headings. | Put smaller numbers in the card header, use readable feature lists, and align the card footers. |
| Service proof links all pointed to the beginning of Work. | Link each service to its matching project. |
| Alternating project images had unequal column widths. | Use equal desktop columns and correct responsive image sizes. |
| Decorative portrait copy overlaid the suit and introduced tiny text. | Remove the extra note and caption beneath the frame; retain the aligned photo, availability tag, depth, and lighting. |
| Technology cards repeated both faces in accessible names and used excess vertical space. | Give each button a concise name and one description, preserve keyboard/tap flipping, and fit both faces in compact cards. |
| Secondary labels needed stronger contrast. | Lighten the muted color; all main text palette colors exceed 4.5:1 on the page surfaces. |
| The Facebook contact card opened search results rather than a profile. | Remove the card until a real profile URL is supplied. Preserve the other configured contact destinations. |
| Email presentation and résumé contact spacing were inconsistent. | Preserve normal email casing, improve mobile résumé contact grouping, and regenerate the single-page PDF. |

## Validation

- Production build and ESLint.
- Chromium layout checks at 1920×1080, 1440×900, 1280×600, 1024×768,
  820×1180, 768×1024, 428×926, 390×844, 375×667, and 320×740.
- Text and card overflow, image loading, 44px controls, anchor destinations and offsets,
  active navigation, heading structure, keyboard skip link, technology buttons, and PDF download.
- Existing pointer, touch, reduced-motion, orientation, idle-animation, and fast-scroll
  regressions in Chromium and WebKit device emulations.
- Visual inspection of desktop and phone sections and the résumé.

Palette contrast is computed against the solid page surfaces; it is not an exhaustive
accessibility certification. Browser device profiles emulate phones and tablets.
Third-party social sites control their own login requirements and availability.

Commands and deployment details are in [README.md](README.md).
