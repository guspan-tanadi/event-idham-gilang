// next.config.js
module.exports = {
  images: {
    domains: ['wallpapers.com', 'res.cloudinary.com', 'example.com', 'developers.elementor.com'], // Add wallpapers.com here
  },
  typescript: {
    /*
    !! WARN !!
    Dangerously allow production builds to successfully complete even if
    your project has type errors.
    !! WARN !!
    */
    ignoreBuildErrors: true
  }
};
