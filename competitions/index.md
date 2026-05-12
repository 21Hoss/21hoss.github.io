---
layout: page
permalink: /competitions/
title: "Competitions"
description: "Active and archived CTF events I've played, with linked write-ups."
---

{% assign events = site.competitions | sort: "start_date" | reverse %}

{% assign active   = events | where: "status", "active" %}
{% assign upcoming = events | where: "status", "upcoming" %}
{% assign archived = events | where: "status", "archived" %}

{% if active.size > 0 %}
<section class="taxonomy-section" markdown="0">
<h2>Active <span class="count">{{ active.size }}</span></h2>
<div class="grid grid-cards">
{% for e in active %}{% include competition-card.html event=e %}{% endfor %}
</div>
</section>
{% endif %}

{% if upcoming.size > 0 %}
<section class="taxonomy-section" markdown="0">
<h2>Upcoming <span class="count">{{ upcoming.size }}</span></h2>
<div class="grid grid-cards">
{% for e in upcoming %}{% include competition-card.html event=e %}{% endfor %}
</div>
</section>
{% endif %}

{% if archived.size > 0 %}
<section class="taxonomy-section" markdown="0">
<h2>Archived <span class="count">{{ archived.size }}</span></h2>
<div class="grid grid-cards">
{% for e in archived %}{% include competition-card.html event=e %}{% endfor %}
</div>
</section>
{% endif %}

{% if events.size == 0 %}
<p class="muted">No competitions tracked yet.</p>
{% endif %}
