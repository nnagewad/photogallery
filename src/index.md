---
layout: 'layouts/photo-feed.njk'
title: 'Nikin’s photofeed'
pagination:
  data: photogallery
  size: 2
  alias: photofeed
permalink: "/{% if pagination.pageNumber != 0 %}{{ pagination.pageNumber + 1 }}/{% endif %}"
---