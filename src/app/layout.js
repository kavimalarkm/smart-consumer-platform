import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import KeepAlive from "./components/KeepAlive";

export const metadata = {
  title: "Smart Consumer Intelligence Platform",
  description: "AI-powered product decision system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <KeepAlive />
        {children}
        <Footer />
      </body>
    </html>
  );
}
