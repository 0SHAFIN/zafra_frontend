
import "./globals.css";
import { CartProvider } from "./context/cart-context";
import Navbar from "./component/navbar";
import Footer from "./component/footer";

import LayoutWrapper from "./component/layoutwrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  return (
    <html lang="en">
      <body>
        <CartProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </CartProvider>
      </body>
    </html>
  );
}
