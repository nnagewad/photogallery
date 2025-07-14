---
layout: 'layouts/photo.njk'
metaDesc: 'Detailed information about this photograph.'
pagination:
  data: photogallery
  size: 1
  alias: photo
  addAllPagesToCollections: true
tags: posts
permalink: photo/{{ photo.title | slugify }}/index.html
eleventyComputed:
  title: '{{ photo.title | updateApostrophe }}'
  dateTaken: '{{ photo.dateTaken }}'
  opengraph: '{{ photo.opengraph }}'
  alt: '{{ photo.alt }}'
---