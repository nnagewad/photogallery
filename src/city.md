---
layout: 'layouts/photogallery.njk'
pagination:
  data: photosByCity
  size: 1
  alias: city
permalink: "/city/{{ city | slugify }}/"
eleventyComputed:
  title: "City: {{ city }}"
  metaDesc: "Photographs taken in {{ city }}."
---
