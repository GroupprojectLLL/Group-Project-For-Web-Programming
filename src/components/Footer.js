import Logo from './Logo';

export default function Footer({ navigate }) {
  return (
    <footer>
      <div className="footer-main page-shell">
        <div className="footer-brand"><Logo onClick={() => navigate('home')} /><p>Thoughtful digital entertainment, curated for curious people.</p></div>
        <div><strong>Discover</strong><button onClick={() => navigate('listing', 'Games')}>Games</button><button onClick={() => navigate('listing', 'Books')}>Books</button><button onClick={() => navigate('listing', 'Movies & TV')}>Movies & TV</button></div>
        <div><strong className="footer-brand-name">ZeHaoShanGou</strong><button onClick={() => navigate('about')}>About us</button><button onClick={() => navigate('gift-cards')}>Gift cards</button><button onClick={() => navigate('careers')}>Careers</button></div>
        <div><strong>Help</strong><button onClick={() => navigate('support')}>Support</button><button onClick={() => navigate('refunds')}>Refunds</button><button onClick={() => navigate('contact')}>Contact</button></div>
      </div>
      <div className="footer-bottom page-shell">
        <span>Copyright 2026 ZeHaoShanGou. Built for better downtime.</span>
        <span className="footer-policy-links"><button onClick={() => navigate('terms')}>Terms</button><button onClick={() => navigate('privacy')}>Privacy</button><button onClick={() => navigate('cookies')}>Cookies</button></span>
      </div>
    </footer>
  );
}
