---
layout: page
permalink: /blog/
title: "Blog"
description: "Shorter posts on tooling, technique, and security thinking."
---

{% assign posts = site.posts %}

{% if posts.size == 0 %}
  <p class="muted">No posts yet. Long-form lives under <a href="{{ '/ctf/' | relative_url }}">write-ups</a> for the moment.</p>
{% else %}
  <ul class="post-list">
    {% for post in posts %}
      <li class="card">
        <h3 class="card-title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
        {% if post.description %}<p class="card-excerpt">{{ post.description }}</p>{% endif %}
        <footer class="card-footer">
          <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%b %-d, %Y" }}</time>
          {% if post.tags and post.tags.size > 0 %}
            <ul class="tag-list">
              {% for t in post.tags limit: 4 %}{% assign tslug = t | slugify %}<li><a href="{{ '/tags/' | append: '#' | append: tslug | relative_url }}">#{{ t }}</a></li>{% endfor %}
            </ul>
          {% endif %}
        </footer>
      </li>
    {% endfor %}
  </ul>
{% endif %}
