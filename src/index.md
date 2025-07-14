---
layout: 'layouts/photogallery.njk'
metaDesc: 'A curated gallery of photographs by Nikin Nagewdia.'
pagination:
  data: photogallery
  size: 50
  alias: photogallery
permalink: "/{% if pagination.pageNumber != 0 %}{{ pagination.pageNumber + 1 }}/{% endif %}"
eleventyComputed:
  title: "{% if pagination.pageNumber == 0 %}{{ site.siteName }}{% elif pagination.pageNumber != 0 %}Page {{ pagination.pageNumber + 1 }}{% endif %}"
---