<!--
  GANITSUTRAM
  A Living Knowledge Ecosystem for Mathematical Discovery

  Creator:   Jawahar R. Mallah
  Email:     jawahar@aitdl.com
  GitHub:    https://github.com/jawahar-mallah
  Websites:  https://ganitsutram.com
             https://aitdl.com

  Then:  628 CE · Brahmasphutasiddhanta
  Now:   8 March MMXXVI · Vikram Samvat 2082

  Copyright © 2026 Jawahar R. Mallah · AITDL | GANITSUTRAM
-->
## GanitSūtram PWA Implementation
Author: Jawahar R Mallah | AITDL
VS 2082 | 2026-03-07

## Overview
All 6 GanitSūtram websites are installable PWAs.

## Install
Desktop: address bar install icon
Mobile: "Add to Home Screen" banner

## Caching Strategy
| Route type | Strategy | Fallback |
|---|---|---|
| Static Pages & Assets | Cache-First | Cached fallback |
| API Calls (`/api/`) | Network-First | Offline Error JSON |

## Service Worker Lifecycle
Install → Activate → Fetch interception

## Offline Behaviour
Static pages: served from cache
API calls: return offline error JSON

## Manifest per Site
| Site | `name` | `start_url` | Shortcuts Count |
|---|---|---|---|
| Portal | GanitSūtram Portal | `/` | 2 |
| Discoveries | GanitSūtram Discoveries | `/` | 2 |
| Learning | GanitSūtram Learning | `/` | 2 |
| Solver | GanitSūtram Solver | `/` | 2 |
| Knowledge Map | GanitSūtram Knowledge Map | `/` | 0 |
| Research Lab | GanitSūtram Research Lab | `/` | 0 |

## Testing Checklist
- [ ] Lighthouse PWA score > 90 on all sites
- [ ] Installable on Chrome Android
- [ ] Installable on Safari iOS (Add to Home Screen)
- [ ] Offline: static pages load
- [ ] Offline: API shows graceful error
- [ ] SW updates when new version deployed
