import { API_ROOT } from '../api/products';

export default function DataSourceNotice({ status, error }) {
  if (status === 'live') return null;

  return (
    <div className={`data-source-note data-source-${status} page-shell`}>
      {status === 'loading' ? (
        <span>Connecting to StoreDB Product API...</span>
      ) : (
        <span>Using demo products because the StoreDB Product API is unavailable. Expected API: {API_ROOT}/Product</span>
      )}
      {error && <small>{error}</small>}
    </div>
  );
}
