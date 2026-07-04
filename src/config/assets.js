const publicAsset = (path) => `${process.env.PUBLIC_URL || ''}${path}`;
export const heroArt = publicAsset('/covers/hero-orbit.svg');
export const accountVisualArt = publicAsset('/covers/account-visual.svg');
export const coverArtByKey = {
  nebula: publicAsset('/covers/nebula.svg'),
  quiet: publicAsset('/covers/quiet.svg'),
  apex: publicAsset('/covers/apex.svg'),
  signal: publicAsset('/covers/signal.svg'),
  solaris: publicAsset('/covers/solaris.svg'),
  calm: publicAsset('/covers/calm.svg'),
  night: publicAsset('/covers/night.svg'),
  parallel: publicAsset('/covers/parallel.svg'),
  weekend: publicAsset('/covers/weekend.svg'),
  neon: publicAsset('/covers/neon.svg'),
  worlds: publicAsset('/covers/worlds.svg'),
  habit: publicAsset('/covers/habit.svg'),
};
