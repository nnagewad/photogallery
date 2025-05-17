---
layout: 'layouts/photo.njk'
pagination:
  data: photogallery
  size: 1
  alias: photo
  addAllPagesToCollections: true
permalink: photo/{{ photo.filename | slugify }}/index.html
eleventyComputed:
  title: '{{ photo.title }}'
  image: '{{ photo.image }}'
  altText: '{{ photo.altText }}'
---