const fallbackNavigationMenus = [
  { label: 'Books', items: ['Fiction', 'Mystery', 'Design', 'Wellbeing'] },
  { label: 'Games', items: ['Adventure', 'Action', 'Racing', 'Puzzle', 'Simulation'] },
  { label: 'Movies & TV', items: ['Documentary', 'Thriller', 'Animation'] },
];

const categoryOrder = ['Books', 'Games', 'Movies & TV'];

export function buildNavigationMenus(products) {
  return categoryOrder.map((categoryName) => {
    const fallbackMenu = fallbackNavigationMenus.find((menu) => menu.label === categoryName);
    const items = [...new Set(
      products
        .filter((product) => product.category === categoryName)
        .map((product) => product.subCategory || product.type)
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));

    return {
      label: categoryName,
      items: items.length ? items : fallbackMenu?.items || [],
    };
  });
}
