---
layout: 'layouts/photogallery.njk'
pagination:
  data: photosByCountry
  size: 1
  alias: country
permalink: "/country/{{ country | slugify }}/"
eleventyComputed:
  title: "Country: {{ country }}"
  metaDesc: "Photographs taken in {{ country }}."
---
