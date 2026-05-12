---
layout: page
permalink: /ctf/
title: "CTF Write-ups"
description: "Reproducible walkthroughs across forensics, pwn, reversing, crypto, web, OSINT, malware, and IR."
---

{% assign writeups = site.writeups | sort: "date" | reverse %}
{% assign published = writeups | where_exp: "w", "w.published != false" %}

<section class="filters" data-filter-target="#writeup-grid" markdown="0">
<strong>category:</strong>
<a href="#" class="filter-chip is-active" data-group="category" data-value="*">all</a>
{% for c in site.ctf_categories %}<a href="#" class="filter-chip" data-group="category" data-cat="{{ c.slug }}" data-value="{{ c.slug }}">{{ c.name | downcase }}</a>
{% endfor %}
</section>

<section class="filters" data-filter-target="#writeup-grid" markdown="0">
<strong>platform:</strong>
<a href="#" class="filter-chip is-active" data-group="platform" data-value="*">all</a>
{% for p in site.ctf_platforms %}<a href="#" class="filter-chip" data-group="platform" data-value="{{ p.slug }}">{{ p.name | downcase }}</a>
{% endfor %}
</section>

<div id="writeup-grid" class="grid grid-cards" markdown="0">
{% if published.size > 0 %}
{% for w in published %}
{% assign cat_slug = w.category | default: "uncategorized" | slugify %}
{% assign platform_slug = w.platform | default: "misc" | slugify %}
{% include writeup-card.html writeup=w cat_slug=cat_slug platform_slug=platform_slug %}
{% endfor %}
<p class="empty" style="display:none">No write-ups match those filters yet.</p>
{% else %}
<p class="empty">No write-ups yet — soon.</p>
{% endif %}
</div>

---

> [!NOTE] To add a new write-up, copy `ctf-template.md` into
> `_writeups/<platform>/<category>/<YYYY-MM-DD>-<slug>.md`, fill in the front
> matter, and commit. The card grid above will pick it up automatically.
