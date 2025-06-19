---
layout: 'layouts/photogallery.njk'
pagination:
  data: photogallery
  size: 5
  alias: photofeed
permalink: "/{% if pagination.pageNumber != 0 %}{{ pagination.pageNumber + 1 }}/{% endif %}"
eleventyComputed:
  title: "{% if pagination.pageNumber == 0 %}{{ site.siteName }}{% elif pagination.pageNumber != 0 %}Page {{ pagination.pageNumber + 1 }}{% endif %}"
---