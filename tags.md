---
layout: page
permalink: /tags/
title: "Browse by tag"
description: "Every tag attached to a write-up on this site."
---

{% assign all_writeups = site.writeups | sort: "date" | reverse %}

{% assign raw_tags = "" | split: "" %}
{% for w in all_writeups %}{% if w.tags %}{% for t in w.tags %}{% assign raw_tags = raw_tags | push: t %}{% endfor %}{% endif %}{% endfor %}
{% assign unique_tags = raw_tags | uniq | sort %}

{% if unique_tags.size == 0 %}
<p class="muted">No tags yet.</p>
{% else %}
<p class="muted">{{ unique_tags.size }} tag{% if unique_tags.size != 1 %}s{% endif %} across {{ all_writeups.size }} write-up{% if all_writeups.size != 1 %}s{% endif %}.</p>

<div class="tag-cloud" markdown="0">
{% for t in unique_tags %}<a class="filter-chip" href="#{{ t | slugify }}">#{{ t }}</a>
{% endfor %}
</div>

{% for t in unique_tags %}
{% assign tagged = all_writeups | where_exp: "w", "w.tags contains t" %}
<section class="taxonomy-section" id="{{ t | slugify }}" markdown="0">
<h2><a href="#{{ t | slugify }}">#{{ t }}</a> <span class="count">{{ tagged.size }}</span></h2>
<div class="grid grid-cards">
{% for w in tagged %}
{% assign cat_slug = w.category | default: "uncategorized" | slugify %}
{% assign platform_slug = w.platform | default: "misc" | slugify %}
{% include writeup-card.html writeup=w cat_slug=cat_slug platform_slug=platform_slug %}
{% endfor %}
</div>
</section>
{% endfor %}
{% endif %}
