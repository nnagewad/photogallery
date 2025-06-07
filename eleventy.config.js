import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import apiToISO from "./src/_filters/api-to-iso.js";
import apiToDate from "./src/_filters/api-to-date.js";
import apiToTime from "./src/_filters/api-to-time.js";
import updateApostrophe from "./src/_filters/update-apostrophe.js";
import htmlmin from 'html-minifier-terser';

export default async function(eleventyConfig) {
  // Watch SCSS files for changes
  eleventyConfig.setServerOptions({
    watch: ['./_site/css/**/*.css'],
  });

  // Add filters
  eleventyConfig.addFilter('apiToISO', apiToISO);
  eleventyConfig.addFilter('apiToDate', apiToDate);
  eleventyConfig.addFilter('apiToTime', apiToTime);
  eleventyConfig.addFilter('updateApostrophe', updateApostrophe);

  // Minify HTML output
  eleventyConfig.addTransform('htmlmin', function(content, outputPath) {
    if( outputPath && outputPath.endsWith('.html') ) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
      return minified;
    }
    return content;
  });
  
  // 11ty Image plugin
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["avif", "webp"],
    widths: ["auto"],
    htmlOptions: {
      imgAttributes: {
        loading: "lazy",
        decoding: "async",
      },
      pictureAttributes: {}
    },
  });

  return {
    markdownTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dir: {
      input: 'src',
      includes: '_includes'
    }
  };
}
