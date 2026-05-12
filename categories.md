---
layout: page
permalink: /categories/
title: "Browse by category"
description: "All CTF write-ups grouped by discipline."
---

{% assign writeups = site.writeups | sort: "date" | reverse %}

{% for cat in site.ctf_categories %}
{% assign in_cat = "" | split: "" %}
{% for w in writeups %}
{% assign w_cat_slug = w.category | default: "uncategorized" | slugify %}
{% if w_cat_slug == cat.slug %}{% assign in_cat = in_cat | push: w %}{% endif %}
{% endfor %}
<section class="taxonomy-section" id="{{ cat.slug }}" markdown="0">
<h2><a href="#{{ cat.slug }}" style="color:var(--cat-{{ cat.slug }})">{{ cat.icon }} {{ cat.name }}</a> <span class="count">{{ in_cat.size }} write-up{% if in_cat.size != 1 %}s{% endif %}</span></h2>
<p class="muted">{{ cat.desc }}</p>
{% if in_cat.size > 0 %}
<div class="grid grid-cards">
{% for w in in_cat %}
{% assign platform_slug = w.platform | default: "misc" | slugify %}
{% include writeup-card.html writeup=w cat_slug=cat.slug platform_slug=platform_slug %}
{% endfor %}
</div>
{% else %}
<p class="muted">Nothing here yet.</p>
{% endif %}
</section>
{% endfor %}
