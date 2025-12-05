import path from "node:path";
import fs from "node:fs";
import { execSync } from 'node:child_process';
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import pluginRss from "@11ty/eleventy-plugin-rss";
import { minify } from 'terser';
import htmlmin from 'html-minifier-terser';
import apiToISO from "./src/_filters/api-to-iso.js";
import apiToDate from "./src/_filters/api-to-date.js";
import apiToTime from "./src/_filters/api-to-time.js";
import updateApostrophe from "./src/_filters/update-apostrophe.js";

// Basic slugify function to match Nunjucks/11ty's expected behavior
const slugify = (str) => {
    return String(str)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s-]+/g, '-');
};

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
    eleventyConfig.addFilter('slugify', slugify); // Add slugify as an accessible filter

    // --- Dynamic Back-to-List Mapping (NEW) ---
    // Builds per-photo -> contact sheet page mapping; keep pageSize aligned with src/index.md pagination.
    eleventyConfig.addGlobalData("photoToListMap", () => {
        const map = {};
        const dataPath = path.join("src", "_data", "photogallery.json");

        let photogallery;
        try {
            photogallery = JSON.parse(fs.readFileSync(dataPath, "utf8"));
        } catch (err) {
            console.warn("⚠️ Unable to load photogallery data for photoToListMap:", err.message);
            return map;
        }

        const pageSize = 20; // Matches pagination.size in src/index.md

        photogallery.forEach((photo, index) => {
            if (!photo.title) return;

            const postUrlSlug = slugify(photo.title);
            const pageNumber = Math.floor(index / pageSize);
            const listPageUrl = pageNumber === 0 ? "/" : `/${pageNumber + 1}/`;

            map[`/photo/${postUrlSlug}/`] = listPageUrl;
        });

        return map;
    });
    // --- End Dynamic Mapping ---

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
    eleventyConfig.on("eleventy.after", async () => {
        if (process.env.ELEVENTY_RUN_MODE === "build") {
            const cacheDir = ".cache/@11ty/img/";
            const outputDir = path.join(outputDirectory, "img");

            try {
                await fs.promises.access(cacheDir);
                await fs.promises.cp(cacheDir, outputDir, {
                    recursive: true
                });
                console.log("📸 Copied processed images from cache to output directory");
            } catch (err) {
                if (err.code === 'ENOENT') {
                    console.log("ℹ️ No cached images found to copy");
                } else {
                    console.error(`❌ Failed to copy processed images from "${cacheDir}" to "${outputDir}":`, err);
                }
            }
        }
    });

    // Pagefind indexing after build
    eleventyConfig.on('eleventy.after', () => {
        execSync(`npx pagefind --site _site --glob "**/*.html"`, { encoding: 'utf-8' });
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
