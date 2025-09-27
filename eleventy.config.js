import path from "node:path";
import fs from "node:fs";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import pluginRss from "@11ty/eleventy-plugin-rss";
import { minify } from 'terser';
import htmlmin from 'html-minifier-terser';
import apiToISO from "./src/_filters/api-to-iso.js";
import apiToDate from "./src/_filters/api-to-date.js";
import apiToTime from "./src/_filters/api-to-time.js";
import updateApostrophe from "./src/_filters/update-apostrophe.js";

export default async function(eleventyConfig) {
  // Configuration
  eleventyConfig.setUseGitIgnore(false);
  
  eleventyConfig.setServerOptions({
    watch: ['./_site/css/**/*.css'],
  });

  // Plugins (add early so they can be configured)
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    urlPath: "/img/",
    outputDir: ".cache/@11ty/img/",
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

  // Passthrough copies
  eleventyConfig.addPassthroughCopy("src/img/photos");
  eleventyConfig.addPassthroughCopy("src/img/favicon");
  eleventyConfig.addPassthroughCopy("src/img/open-graph");

  // Filters
  eleventyConfig.addFilter('apiToISO', apiToISO);
  eleventyConfig.addFilter('apiToDate', apiToDate);
  eleventyConfig.addFilter('apiToTime', apiToTime);
  eleventyConfig.addFilter('updateApostrophe', updateApostrophe);

  // Async filters
  eleventyConfig.addNunjucksAsyncFilter('jsmin', async function (
    code,
    callback
  ) {
    try {
      const minified = await minify(code);
      callback(null, minified.code);
    } catch (err) {
      console.error('Terser error: ', err);
      callback(null, code);
    }
  });

  // Transforms (apply last)
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

  // Store output directory for use in event handlers
  const outputDirectory = "_site";

  // Copy processed images from cache to final output after build
  eleventyConfig.on("eleventy.after", () => {
    if (process.env.ELEVENTY_RUN_MODE === "build") {
      const cacheDir = ".cache/@11ty/img/";
      const outputDir = path.join(outputDirectory, "img");
      
      if (fs.existsSync(cacheDir)) {
        try {
          fs.cpSync(cacheDir, outputDir, {
            recursive: true
          });
          console.log("📸 Copied processed images from cache to output directory");
        } catch (err) {
          console.error(`❌ Failed to copy processed images from "${cacheDir}" to "${outputDir}":`, err);
        }
      }
    }
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
