const rehypePrism = require("rehype-highlight");
const withMDX = require("@next/mdx")({
  options: {
    remarkPlugins: [],
    rehypePlugins: [rehypePrism],
  },
});
module.exports = withMDX({
  pageExtensions: ["js", "jsx", "tsx", "ts", "mdx"],
  future: {
    webpack5: true,
  },
});
