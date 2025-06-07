---
layout: 'layouts/photo.njk'
pagination:
  data: photogallery
  size: 1
  alias: photo
  addAllPagesToCollections: true
tags: posts
permalink: photo/{{ photo.title | slugify }}/index.html
eleventyComputed:
  title: '{{ photo.title | updateApostrophe }}'
  image: '{{ photo.image }}'
---