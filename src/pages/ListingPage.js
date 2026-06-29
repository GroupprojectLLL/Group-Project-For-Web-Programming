import { useMemo, useState } from 'react';
import Icon from '../components/Icon';
import ProductCard from '../components/ProductCard';

export default function ListingPage({ category, subCategory, search, viewProduct, addToCart, navigate, products }) {
  const [sort, setSort] = useState('Popular');

  const visibleProducts = useMemo(() => {
    let result = products.filter((product) =>
      (category === 'All products' || product.category === category) &&
      (subCategory === 'All subcategories' || product.subCategory === subCategory || product.type === subCategory) &&
      (!search || product.title.toLowerCase().includes(search.toLowerCase()))
    );
    if (sort === 'Price: Low') result = [...result].sort((a, b) => a.price - b.price);
    if (sort === 'Rating') result = [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [category, products, search, sort, subCategory]);

  const listingTitle = search ? `Results for "${search}"` : subCategory !== 'All subcategories' ? subCategory : category;
  const listingDescription = subCategory !== 'All subcategories' && category !== 'All products'
    ? `${visibleProducts.length} ${subCategory} titles in ${category}.`
    : `${visibleProducts.length} hand-picked titles ready to download.`;

  return (
    <main className="listing-page page-shell">
      <div className="listing-title">
        <div><span className="eyebrow">The digital shelf</span><h1>{listingTitle}</h1><p>{listingDescription}</p></div>
        <div className="listing-controls">
          <label className="sort-select">Sort by:<select value={sort} onChange={(event) => setSort(event.target.value)}><option>Popular</option><option>Rating</option><option>Price: Low</option></select><Icon name="chevron" size={14} /></label>
          <button className="view-mode"><Icon name="grid" size={18} /></button>
        </div>
      </div>
      <div className="listing-layout">
        <section>
          {visibleProducts.length ? (
            <div className="listing-grid">
              {visibleProducts.map((product) => <ProductCard product={product} onView={viewProduct} onAdd={addToCart} layout="row" key={product.id} />)}
            </div>
          ) : (
            <div className="empty-state"><Icon name="search" size={30} /><h3>No titles found</h3><p>Try clearing a filter or searching for something else.</p></div>
          )}
          <div className="pagination">
            <button disabled><Icon name="arrow" size={16} /></button>
            <button className="active">1</button>
            <button onClick={() => navigate('listing-page-2')}>2</button>
            <button onClick={() => navigate('listing-page-3')}>3</button>
            <span>...</span>
            <button onClick={() => navigate('listing-page-8')}>8</button>
            <button onClick={() => navigate('listing-page-2')}><Icon name="arrow" size={16} /></button>
          </div>
        </section>
      </div>
    </main>
  );
}
