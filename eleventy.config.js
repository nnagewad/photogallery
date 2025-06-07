import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import apiToISO from "./src/_filters/api-to-iso.js";
import apiToDate from "./src/_filters/api-to-date.js";
import apiToTime from "./src/_filters/api-to-time.js";
import updateApostrophe from "./src/_filters/update-apostrophe.js";

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
  
  // 11ty Image plugin
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["avif", "webp"],
    widths: ["300"],
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
