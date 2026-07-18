import { useEffect, useMemo, useState } from 'react';
import {
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminProductOptions,
  fetchAdminProducts,
  updateAdminProduct,
} from '../api/admin';
import AdminSideNav from '../components/AdminSideNav';
import Icon from '../components/Icon';

const PRODUCTS_PER_PAGE = 20;
const fallbackGenres = [
  { id: 1, name: 'Books', subgenres: [{ id: 1, name: 'Fiction' }] },
  { id: 2, name: 'Movies & TV', subgenres: [{ id: 1, name: 'Drama' }] },
  { id: 3, name: 'Games', subgenres: [{ id: 1, name: 'RPG' }] },
];
const emptyForm = {
  name: '', author: '', description: '', genre: '1', subGenre: '1', published: '', price: '', quantity: '', stockItemId: null,
};

function pageNumbers(currentPage, pageCount) {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);
  const pages = new Set([1, pageCount, currentPage - 1, currentPage, currentPage + 1]);
  return [...pages].filter((page) => page > 0 && page <= pageCount).sort((left, right) => left - right);
}

export default function AdminProductManagementPage({ user, navigate }) {
  const [products, setProducts] = useState([]);
  const [genres, setGenres] = useState(fallbackGenres);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(Boolean(user?.isAdmin));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadProducts() {
    setLoading(true);
    try {
      const [productRecords, genreRecords] = await Promise.all([
        fetchAdminProducts(),
        fetchAdminProductOptions(),
      ]);
      setProducts(productRecords);
      if (genreRecords.length) setGenres(genreRecords);
      setError('');
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.isAdmin) loadProducts();
  }, [user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const filteredProducts = useMemo(() => products.filter((product) => (
    !query.trim() || `${product.name || ''} ${product.author || ''}`.toLowerCase().includes(query.trim().toLowerCase())
  )), [products, query]);
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const safePage = Math.min(currentPage, pageCount);
  const pageStart = (safePage - 1) * PRODUCTS_PER_PAGE;
  const visibleProducts = filteredProducts.slice(pageStart, pageStart + PRODUCTS_PER_PAGE);
  const selectedGenre = genres.find((genre) => String(genre.id) === String(form.genre)) || genres[0];
  const selectedSubgenres = selectedGenre?.subgenres || [];

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  function updateGenre(event) {
    const nextGenre = event.target.value;
    const nextOptions = genres.find((genre) => String(genre.id) === nextGenre)?.subgenres || [];
    setForm((current) => ({
      ...current,
      genre: nextGenre,
      subGenre: String(nextOptions[0]?.id || ''),
    }));
  }

  function editProduct(product) {
    setEditingId(product.id);
    setForm({
      name: product.name || '',
      author: product.author || '',
      description: product.description || '',
      genre: String(product.genre || 1),
      subGenre: String(product.subGenre || 1),
      published: product.published ? String(product.published).slice(0, 10) : '',
      price: String(product.price ?? ''),
      quantity: String(product.quantity ?? ''),
      stockItemId: product.stockItemId || null,
    });
    setMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function submitProduct(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      if (editingId) {
        await updateAdminProduct(editingId, form);
        setMessage(`Product ${editingId} updated in StoreDB.`);
      } else {
        const result = await createAdminProduct(form);
        setMessage(`Product ${result.productId} created in StoreDB.`);
      }
      cancelEdit();
      await loadProducts();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(product) {
    if (!window.confirm(`Delete ${product.name}? Products in previous orders cannot be removed.`)) return;
    setMessage('');
    setError('');
    try {
      await deleteAdminProduct(product.id);
      setMessage(`Product ${product.id} deleted.`);
      await loadProducts();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  if (!user?.isAdmin) return <main className="account-workspace page-shell"><div className="empty-state"><Icon name="lock" size={30} /><h3>Admin access required</h3><button className="primary-button" onClick={() => navigate('account')}>Go to Account</button></div></main>;

  return (
    <main className="account-workspace page-shell">
      <section className="account-workspace-heading"><h1>Admin Product Management</h1></section>
      <div className="account-workspace-layout">
        <AdminSideNav active="admin-product-management" navigate={navigate} />
        <section className="account-workspace-main">
          <div className="workspace-section-label">{editingId ? `Edit Product ${editingId}` : 'Add Product'}</div>
          <form className="workspace-panel admin-form" onSubmit={submitProduct}>
            <label><span>Name</span><input value={form.name} onChange={updateField('name')} required /></label>
            <label><span>Author or creator</span><input value={form.author} onChange={updateField('author')} /></label>
            <label className="admin-form-wide"><span>Description</span><textarea value={form.description} onChange={updateField('description')} rows="3" /></label>
            <label>
              <span>Category</span>
              <select value={form.genre} onChange={updateGenre}>
                {genres.map((genre) => <option value={genre.id} key={genre.id}>{genre.name}</option>)}
              </select>
            </label>
            <label>
              <span>Subcategory</span>
              <select value={form.subGenre} onChange={updateField('subGenre')} required>
                {selectedSubgenres.map((subgenre) => <option value={subgenre.id} key={subgenre.id}>{subgenre.name}</option>)}
              </select>
            </label>
            <label><span>Published</span><input type="date" value={form.published} onChange={updateField('published')} /></label>
            <label><span>Price</span><input type="number" min="0" step="0.01" value={form.price} onChange={updateField('price')} required /></label>
            <label><span>Stock quantity</span><input type="number" min="0" step="1" value={form.quantity} onChange={updateField('quantity')} required /></label>
            <div className="admin-form-actions"><button className="primary-button" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}</button>{editingId && <button type="button" onClick={cancelEdit}>Cancel</button>}</div>
          </form>
          {message && <div className="workspace-panel workspace-success">{message}</div>}
          {error && <div className="workspace-panel workspace-error" role="alert">{error}</div>}

          <div className="workspace-section-label">Products</div>
          <div className="workspace-panel admin-list-toolbar">
            <input aria-label="Search admin products" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by product or creator" />
            <span>{filteredProducts.length ? `Showing ${pageStart + 1}-${Math.min(pageStart + PRODUCTS_PER_PAGE, filteredProducts.length)} of ${filteredProducts.length}` : 'No matching products'}{filteredProducts.length !== products.length ? ` (${products.length} total)` : ''}</span>
          </div>
          {loading ? <div className="workspace-panel workspace-message">Loading products...</div> : (
            <>
              <div className="admin-data-table admin-product-table">
                <div className="admin-data-header"><span>ID</span><span>Product</span><span>Price</span><span>Stock</span><span>Actions</span></div>
                {visibleProducts.map((product) => (
                  <article key={product.id}><span>{product.id}</span><span><strong>{product.name}</strong><small>{product.author || 'No creator'}</small></span><span>${Number(product.price || 0).toFixed(2)}</span><span>{product.quantity ?? 0}</span><span className="admin-row-actions"><button onClick={() => editProduct(product)}>Edit</button><button onClick={() => removeProduct(product)}>Delete</button></span></article>
                ))}
              </div>
              {pageCount > 1 && (
                <nav className="workspace-pagination" aria-label="Admin product pages">
                  <button type="button" disabled={safePage === 1} onClick={() => setCurrentPage(safePage - 1)} aria-label="Previous product page"><Icon name="arrow" size={13} /></button>
                  {pageNumbers(safePage, pageCount).map((page, index, pages) => (
                    <span className="admin-page-number" key={page}>
                      {index > 0 && page - pages[index - 1] > 1 && <em>...</em>}
                      <button type="button" className={page === safePage ? 'active' : ''} aria-current={page === safePage ? 'page' : undefined} onClick={() => setCurrentPage(page)}>{page}</button>
                    </span>
                  ))}
                  <button type="button" disabled={safePage === pageCount} onClick={() => setCurrentPage(safePage + 1)} aria-label="Next product page"><Icon name="arrow" size={13} /></button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
