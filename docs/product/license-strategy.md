# License Strategy Proposal

This document proposes licensing options for KIIAREN's open-core model. This is not legal advice - consult legal counsel before making licensing decisions.

## Current State

KIIAREN is currently licensed under MIT.

## Problem Statement

MIT license:
- Allows unlimited commercial use without contribution back
- Does not prevent cloud providers from offering KIIAREN-as-a-service
- Does not prevent proprietary forks that compete with managed offering

For an open-core business model to be sustainable, licensing must balance:
1. Community accessibility and contribution
2. Commercial viability of managed offering
3. Protection against exploitation

## Option A: AGPL v3

Switch the entire codebase to AGPL v3.

**What it does:**
- Requires derivative works to be open source
- Network use (SaaS) triggers copyleft
- Cloud providers cannot offer closed KIIAREN-as-a-service

**Implications:**
- Companies using KIIAREN internally must open source modifications
- Integrations may trigger copyleft (legal ambiguity)
- Some enterprises have blanket AGPL policies (won't use)
- Contributors must agree to AGPL

**Example projects using AGPL:**
- MongoDB (before SSPL)
- Mattermost
- Nextcloud
- Gitea

**Recommendation:** Moderate fit. Provides protection but may limit enterprise adoption.

## Option B: Dual License (AGPL + Commercial)

Offer AGPL for open source use, commercial license for proprietary use.

**Structure:**
- Default: AGPL v3 (copyleft, free)
- Commercial: Proprietary license (paid, permissive)

**What it does:**
- Community gets AGPL - full source, must contribute back
- Enterprises buy commercial license - no copyleft obligation
- KIIAREN retains exclusive commercial licensing rights

**Requirements:**
- CLA (Contributor License Agreement) from all contributors
- Clear copyright assignment or license grant
- Separate commercial license terms

**Implications:**
- Requires CLA infrastructure and enforcement
- Some contributors refuse CLAs on principle
- More administrative overhead
- Clear revenue path

**Example projects using dual license:**
- MySQL (GPL + Commercial)
- Qt (LGPL + Commercial)
- Sidekiq (LGPL + Commercial)

**Recommendation:** Strong fit for open-core. Requires CLA.

## Option C: Source Available (BSL/SSPL-like)

Custom license that allows use but restricts competition.

**Structure:**
- Source visible and usable
- Cannot offer as competing service
- Converts to open source after time period (optional)

**What it does:**
- Prevents cloud competition directly
- Allows inspection and self-hosting
- Not OSI-approved (not "open source")

**Implications:**
- Cannot claim "open source" status
- Some communities reject source-available licenses
- Clear protection against cloud competition
- Simpler than dual licensing

**Example projects using source-available:**
- MongoDB (SSPL)
- Elastic (SSPL/ELv2)
- HashiCorp (BSL)
- MariaDB (BSL)

**Recommendation:** Strongest protection, but community perception cost.

## Option D: MIT + Managed-Only Code Separation

Keep MIT for OSS core, separate license for managed-only code.

**Structure:**
- `packages/core`, `apps/web`, `convex/` - MIT
- Managed-only services (KMS, search, etc.) - Proprietary

**What it does:**
- Core remains freely usable
- Value-add features are proprietary
- No copyleft concerns

**Implications:**
- Requires strict code separation
- Managed features cannot be contributed by community
- Simpler licensing story
- Weaker protection for core

**Example projects using this model:**
- GitLab (MIT core + proprietary EE)
- Supabase (Apache 2.0 + proprietary)
- n8n (fair-code + proprietary cloud)

**Recommendation:** Simplest option if feature separation is clean.

## Recommendation

For KIIAREN's current state and goals, recommend **Option D: MIT + Managed-Only Separation**.

**Rationale:**
1. Architecture already separates OSS from managed features
2. Extension hooks provide clean integration points
3. Managed-only features (KMS, search, AI) are genuinely infrastructure-dependent
4. No CLA friction for contributors
5. MIT is well-understood and enterprise-friendly
6. Community can fully self-host core features

**Implementation:**
- Keep current MIT license for `packages/core`, `apps/web`, `convex/`
- Managed-only implementations (not shipped in OSS) are proprietary
- Document clearly in EDITIONING.md (already done)

**If stronger protection needed later:**
- Can migrate to Option B (dual license) with CLA
- This is a policy decision, not a technical one
- Give community advance notice

## License Header Template

For MIT-licensed files:

```
/**
 * KIIAREN
 *
 * Copyright (c) [YEAR] [COPYRIGHT HOLDER]
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
```

## Next Steps

1. Confirm licensing strategy with legal counsel
2. Update LICENSE file if changing from MIT
3. Add license headers to source files
4. Update CONTRIBUTING.md with license/CLA requirements
5. Communicate changes to community

---

*This document is a proposal for discussion. It does not constitute legal advice or a binding commitment.*
