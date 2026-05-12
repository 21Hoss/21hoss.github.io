---
# ─── Required ────────────────────────────────────────────────────────────────
title:      "Challenge Name"             # Display title of the writeup
platform:   "TryHackMe"                  # TryHackMe | CryptoHack | CyberGame | HackTheBox | ...
category:   "Forensics"                  # Forensics | Pwn | Crypto | Web | OSINT | Reversing | Malware | Incident-Handling
difficulty: "Easy"                       # Easy | Medium | Hard | Insane
date:       2026-05-12                   # YYYY-MM-DD (publication date)
author:     "Kelvin Muhoro"

# ─── Optional ────────────────────────────────────────────────────────────────
points:     100                          # Challenge point value (if any)
room_url:   "https://example.com/room"   # Link to the original challenge / room
tags:       [pcap, wireshark, zip-crack] # Free-form tags for search / filtering
ctf:        "CyberGame KE 2026"          # Event / season name, if applicable
status:     "solved"                     # solved | unsolved | partial
published:  true                         # Set to false to keep as a draft
---

> **TL;DR** — One-sentence summary of what the box / challenge was about and
> how you popped it. (e.g. "Recovered a flag from a PCAP by extracting a
> password-protected ZIP and cracking it with rockyou.")

## Challenge Description

Paste the original challenge prompt here, verbatim. Include any provided
files, hints, or scoring rules.

```
<challenge prompt>
```

**Provided files:**
- `capture.pcapng` — network capture
- `notes.txt` — operator notes

---

## Reconnaissance

What did you see first? File types, ports, surface area. Keep this short and
factual — save the storytelling for the exploitation section.

```bash
file capture.pcapng
nmap -sC -sV -p- 10.10.10.10
```

## Enumeration

Deeper investigation. List the artefacts, endpoints, or strings that pointed
you toward the vulnerability.

- Finding 1: ...
- Finding 2: ...

## Exploitation

The actual path to the flag. Show commands, payloads, and intermediate
output. Annotate *why* each step works — future-you will thank you.

```bash
# Step 1 — extract the ZIP from the capture
tshark -r capture.pcapng --export-objects http,./out
```

```python
# Step 2 — crack the archive
import zipfile
# ...
```

### Gotchas

Anything that wasted time and that someone else should be warned about.

## Flag

```
flag{example_flag_redacted_for_blog}
```

> Redact real flags if the challenge is still live.

## Lessons Learned

- Technique / tool you'd reach for faster next time.
- Concept you needed to read up on.
- Defensive takeaway — how would a blue-teamer catch this?

## References

- [Tool docs](https://example.com)
- [Related writeup](https://example.com)
- [Background reading](https://example.com)
