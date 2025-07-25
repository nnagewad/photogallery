import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import apiToISO from "./src/_filters/api-to-iso.js";
import apiToDate from "./src/_filters/api-to-date.js";
import apiToTime from "./src/_filters/api-to-time.js";
import updateApostrophe from "./src/_filters/update-apostrophe.js";
import { minify } from 'terser';
import htmlmin from 'html-minifier-terser';
import pluginRss from "@11ty/eleventy-plugin-rss";

export default async function(eleventyConfig) {
  // Tell 11ty to use the .eleventyignore and ignore our .gitignore file
  eleventyConfig.setUseGitIgnore(false);
  
  // Watch SCSS files for changes
  eleventyConfig.setServerOptions({
    watch: ['./_site/css/**/*.css'],
  });

  // Passthrough
  // Passthrough copy of images for RSS feed
  eleventyConfig.addPassthroughCopy("src/img/photos");
  // Passthrough favicons
  eleventyConfig.addPassthroughCopy("src/img/favicon");
  // Passthrough open-graph images
  eleventyConfig.addPassthroughCopy("src/img/open-graph");

  // Add filters
  eleventyConfig.addFilter('apiToISO', apiToISO);
  eleventyConfig.addFilter('apiToDate', apiToDate);
  eleventyConfig.addFilter('apiToTime', apiToTime);
  eleventyConfig.addFilter('updateApostrophe', updateApostrophe);

  // Inline JS
  eleventyConfig.addNunjucksAsyncFilter('jsmin', async function (
    code,
    callback
  ) {
    try {
      const minified = await minify(code);
      callback(null, minified.code);
    } catch (err) {
      console.error('Terser error: ', err);
      // Fail gracefully.
      callback(null, code);
    }
  });

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

  // 11ty RSS plugin
  eleventyConfig.addPlugin(pluginRss);

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
