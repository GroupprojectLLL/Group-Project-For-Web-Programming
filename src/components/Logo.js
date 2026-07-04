import zhsgLogo from '../assets/zhsg-logo.png';

export default function Logo({ onClick }) {
  return (
    <button className="logo" onClick={onClick} aria-label="Go to home">
      <img className="logo-mark" src={zhsgLogo} alt="" />
      <span>ZeHao<span className="logo-accent">ShanGou</span></span>
    </button>
  );
}
