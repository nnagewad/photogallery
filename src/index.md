---
layout: 'layouts/feed.njk'
pagination:
  data: photogallery
  size: 5
  alias: photofeed
permalink: "/{% if pagination.pageNumber != 0 %}{{ pagination.pageNumber + 1 }}/{% endif %}"
eleventyComputed:
  canonicalUrl: "https://yourdomain.com/{% if pagination.pageNumber != 0 %}{{ pagination.pageNumber + 1 }}/{% endif %}"
---