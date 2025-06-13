export default function Footer() {
  return (
    <footer className="footer">
      <h2 style={{ marginBottom: 0 }}>Our Team</h2>
      <div className="team-list">
        <div className="team-member">
          <a className="member-name" href="mailto:parvezshaik9885@gmail.com" style={{ fontWeight: 600, color: 'var(--accent)', fontSize: '1.1rem', marginBottom: 4, display: 'inline-block', textDecoration: 'none' }}>Parvez Shaik</a>
          <div className="member-role" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 400, marginTop: 2 }}>Software Developer</div>
          <a className="member-role" href="https://parvez-shaik.vercel.app/" style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 400, marginTop: 2 }}> Resume</a>
        </div>
        <div className="team-member">
          <a className="member-name" href="mailto:fardeenmunni@gmail.com" style={{ fontWeight: 600, color: 'var(--accent)', fontSize: '1.1rem', marginBottom: 4, display: 'inline-block', textDecoration: 'none' }}>Fardeen Shaik</a>
          <div className="member-role" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 400, marginTop: 2 }}>Software Developer</div>
          <a className="member-role" href="#" style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 400, marginTop: 2 }}> Resume</a>
        </div>
      </div>
      <div style={{ marginTop: 32, fontSize: '0.95rem', color: '#6e6e73' }}>
        &copy; {new Date().getFullYear()} Chotu. All rights reserved.
      </div>
    </footer>
  );
}