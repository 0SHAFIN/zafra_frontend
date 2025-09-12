
import "./globals.css";
import LayoutWrapper from "./component/layoutwrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  return (
    <html lang="en">
      <body>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
      </body>
    </html>
  );
}
