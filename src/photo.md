---
layout: 'layouts/photo.njk'
pagination:
  data: photogallery
  size: 1
  alias: photo
  addAllPagesToCollections: true
tags: posts
permalink: post/{{ photo.title | slugify }}/index.html
eleventyComputed:
  title: '{{ photo.title | updateApostrophe }}'
  dateTaken: '{{ photo.dateTaken }}'
---