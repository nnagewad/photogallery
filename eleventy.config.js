import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import apiToISO from "./src/_filters/api-to-iso.js";
import apiToSeconds from "./src/_filters/api-to-seconds.js";
import apiToString from "./src/_filters/api-to-string.js";

export default async function(eleventyConfig) {
  // Add filters
  eleventyConfig.addFilter('apiToISO', apiToISO);
  eleventyConfig.addFilter('apiToSeconds', apiToSeconds);
  eleventyConfig.addFilter('apiToString', apiToString);
  
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
