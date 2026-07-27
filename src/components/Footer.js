import Logo from './Logo';

export default function Footer({ navigate }) {
  return (
    <footer>
      <div className="footer-main page-shell">
        <div className="footer-brand"><Logo onClick={() => navigate('home')} /><p>Thoughtful digital entertainment, curated for curious people.</p></div>
        <div><strong>Discover</strong><button onClick={() => navigate('listing', 'Games')}>Games</button><button onClick={() => navigate('listing', 'Books')}>Books</button><button onClick={() => navigate('listing', 'Movies & TV')}>Movies & TV</button></div>
      </div>
      <div className="footer-bottom page-shell">
        <span>Copyright 2026 ZeHaoShanGou. Built for better downtime.</span>
      </div>
    </footer>
  );
}
