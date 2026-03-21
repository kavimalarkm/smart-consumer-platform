import "./globals.css";

export const metadata = {
  title: "Smart Consumer Intelligence Platform",
  description: "AI-powered product decision system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}