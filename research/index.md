---
layout: page
permalink: /research/
title: "Research"
description: "Current applied-security research focus areas and methodology."
---

This page tracks the **applied security research** I'm actively working on
outside of CTFs. Everything below is offensive, with defensive takeaways.

## 1 — Authentication & session management

Vulnerability classes I'm currently dissecting:

1. Broken authentication flows — credential stuffing, weak password
   policies, account enumeration.
2. Session token entropy and predictability.
3. JWT misconfigurations — algorithm confusion attacks (e.g. **RS256** →
   **HS256**), weak secrets, missing expiry validation.
4. Multi-factor authentication bypass techniques.
5. Password reset flow weaknesses — token reuse, no expiry, host header
   injection.
6. OAuth 2.0 implementation flaws — open redirect, CSRF on the authorization
   endpoint, token leakage.

> [!NOTE] **Methodology** — follow the OWASP Testing Guide (OTG-AUTHN) and
> the OWASP Authentication Cheat Sheet. Document each test case, expected
> vs. actual behaviour, and business impact.

## 2 — Business logic & API abuse

1. Race conditions.
2. Insecure Direct Object References (IDOR).
3. API rate-limiting failures.
4. Parameter tampering.

> [!NOTE] **Methodology** — map every API endpoint through proxied traffic,
> then systematically test each for logic flaws using both authenticated and
> unauthenticated sessions. Focus on multi-step workflows.

---

Notes and detailed findings will land as blog posts or write-ups; this page
is the index of *what* I'm looking at, not the findings themselves.
