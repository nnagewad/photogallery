import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

export default async function(eleventyConfig) {
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		// output image formats
		formats: ["avif", "webp"],

		// output image widths
		widths: ["300"],

		// optional, attributes assigned on <img> nodes override these values
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