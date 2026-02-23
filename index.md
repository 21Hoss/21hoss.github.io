# Welcome to My Personal Website!

Hi,

My name is *Kelvin Muhoro* and I'm a Cybersecurity engineer based out of Kenya who is building and writing online.
I hope you find something here worth your time.

# The projects I'm actively working on

This is where I keep track of my active endeavors. Nothing fancy, just a list with a quick overview and a link to learn more.

## Current Focus

I do lots of stuff, but my primary work right now is identifying and exploiting vulnerabilities in web applications to better understand and defend against real-world threats. 

I'm also grinding a massive streak on TryHackMe to sharpen my practical skills, actively blogging about security concepts, CTF strategies, and ethical hacking insights, and gearing up for the CyberGame KE—a 10-week Kenyan cybersecurity challenge starting March 1, 2026, where I'll tackle incident handling, malware analysis, cryptography, forensics, web exploitation, OSINT and more. 

After it wraps on May 9, I'll publish comprehensive writeups to share lessons learned and inspire the community. In the meanwhile, check out my latest posts.

### Last Update: February 20, 2026 (GMT+3)

* * *
- Writeups
    - [Writeup 1](https://21hoss.github.io/), February 20, 2026
    - [Writeup 2](https://21hoss.github.io/), February 20, 2026

* * *
## My Research

- Research 1:
  - Authentication & Session Management Vulnerabilities
    1. Broken authentication flows (credential stuffing, weak password policies, account enumeration)
    2. Session token entropy and predictability
    3. JWT (JSON Web Token) misconfigurations — algorithm confusion attacks (e.g., RS256 → HS256), weak secrets, missing expiry validation
    4. Multi-factor authentication bypass techniques
    5. Password reset flow weaknesses (token reuse, no expiry, host header injection)
    6. OAuth 2.0 implementation flaws (open redirect, CSRF on authorization endpoint, token leakage)

Methodology: Follow OWASP Testing Guide (OTG-AUTHN) and the OWASP Authentication Cheat Sheet. Document each test case, expected vs. actual behavior, and business impact.

- Research 2:
  - Business Logic & API Abuse Vulnerabilities
    1. Race conditions
    2. Insecure Direct Object References (IDOR)
    3. API rate limiting failures
    4. Parameter tampering

Methodology: Map all API endpoints through proxied traffic, then systematically test each for logic flaws using both authenticated and unauthenticated sessions. Focus on multi-step workflows.

* * *
- Blog Posts
    - [Blog Post 1](https://21hoss.github.io/), February 20, 2026
    - [Blog Post 2](https://21hoss.github.io/), February 20, 2026
