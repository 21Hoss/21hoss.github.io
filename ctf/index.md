---
permalink: /ctf/
title: Writeups
description: CTF walkthroughs and writeups — bug bounty, wargames, academy labs, and more.
---

# CTF Writeups

Walkthroughs organized by **platform** and **category**. New write-ups land
under `_writeups/<platform>/<category>/` and are published at
`/ctf/<platform>/<category>/<slug>/`.

## Platforms

- [TryHackMe](#tryhackme)
- [CryptoHack](#cryptohack)
- [CyberGame KE](#cybergame)

* * *

{% assign writeups = site.writeups | sort: "date" | reverse %}

## <a id="tryhackme"></a>TryHackMe

<ul>
{% for w in writeups %}{% if w.platform == "TryHackMe" %}
  <li>
    <a href="{{ w.url | relative_url }}">{{ w.title }}</a>
    <small>— {{ w.category }} · {{ w.difficulty }} · {{ w.date | date: "%Y-%m-%d" }}</small>
  </li>
{% endif %}{% endfor %}
</ul>

## <a id="cryptohack"></a>CryptoHack

<ul>
{% for w in writeups %}{% if w.platform == "CryptoHack" %}
  <li>
    <a href="{{ w.url | relative_url }}">{{ w.title }}</a>
    <small>— {{ w.category }} · {{ w.difficulty }} · {{ w.date | date: "%Y-%m-%d" }}</small>
  </li>
{% endif %}{% endfor %}
</ul>

## <a id="cybergame"></a>CyberGame KE

<ul>
{% for w in writeups %}{% if w.platform == "CyberGame" %}
  <li>
    <a href="{{ w.url | relative_url }}">{{ w.title }}</a>
    <small>— {{ w.category }} · {{ w.difficulty }} · {{ w.date | date: "%Y-%m-%d" }}</small>
  </li>
{% endif %}{% endfor %}
</ul>

* * *

To add a new writeup, copy `ctf-template.md` into
`_writeups/<platform>/<category>/<YYYY-MM-DD>-<slug>.md`, fill in the front
matter, and commit.
