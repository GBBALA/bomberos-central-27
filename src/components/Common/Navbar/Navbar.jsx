import { Link } from 'react-router-dom';
export default function Navbar() {
  return (
    <nav style={{ padding: '1rem', background: '#ccc' }}>
      <Link to="/">Inicio</Link> | <Link to="/inscripcion">Unite</Link> | <Link to="/admin/dashboard">Admin</Link>
    </nav>
  );
}