---
layout: 'layouts/photogallery.njk'
pagination:
  data: photosByTag
  size: 1
  alias: tag
permalink: "/tag/{{ tag | slugify }}/"
eleventyComputed:
  title: "Tagged: {{ tag }}"
  metaDesc: "Photographs tagged with {{ tag }}."
---
