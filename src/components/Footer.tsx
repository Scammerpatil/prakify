export default function Footer() {
  return (
    <footer className="footer footer-center py-2 bg-base-300 text-base-content">
      <div>
        <p className="font-bold">
          Parkify © {new Date().getFullYear()} - All rights reserved.
        </p>
        <p className="text-sm opacity-70">Built with ❤️ by the Parkify Team.</p>
      </div>
    </footer>
  );
}
