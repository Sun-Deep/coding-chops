// Lets Node load the reels' TypeScript modules from scripts: a relative
// import with no extension ("./simulation") resolves to the .ts file, the
// way the Remotion bundler resolves it.
//
// Use: node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs <script>

export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (error) {
    if (specifier.startsWith(".") && !/\.[cm]?[jt]sx?$/.test(specifier))
      return next(`${specifier}.ts`, context);
    throw error;
  }
}
