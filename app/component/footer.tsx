import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-iris mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <h3 className="text-3xl font-bold text-white mb-6">Zafra</h3>
            <p className="text-white/90 mb-8 max-w-md text-lg leading-relaxed">
              Discover the world of luxury fragrances. From exotic florals to woody mysteries, 
              find your perfect signature scent with us.
            </p>
            <div className="flex gap-4">
              <a 
                href="#" 
                className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110"
                aria-label="Facebook"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110"
                aria-label="Instagram"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.781c-.49 0-.98-.49-.98-.98s.49-.98.98-.98.98.49.98.98-.49.98-.98.98z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110"
                aria-label="Twitter"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Quick Links</h4>
            <div className="space-y-4">
              <Link href="/perfumes" className="block text-white/80 hover:text-white transition-colors duration-300 hover:translate-x-1">
                All Perfumes
              </Link>
              <Link href="/about" className="block text-white/80 hover:text-white transition-colors duration-300 hover:translate-x-1">
                About Us
              </Link>
              <Link href="/contact" className="block text-white/80 hover:text-white transition-colors duration-300 hover:translate-x-1">
                Contact
              </Link>
              <Link href="/quiz" className="block text-white/80 hover:text-white transition-colors duration-300 hover:translate-x-1">
                Find My Scent
              </Link>
            </div>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Support</h4>
            <div className="space-y-4">
              <Link href="/shipping" className="block text-white/80 hover:text-white transition-colors duration-300 hover:translate-x-1">
                Shipping Info
              </Link>
              <Link href="/returns" className="block text-white/80 hover:text-white transition-colors duration-300 hover:translate-x-1">
                Returns
              </Link>
              <Link href="/faq" className="block text-white/80 hover:text-white transition-colors duration-300 hover:translate-x-1">
                FAQ
              </Link>
              <Link href="/size-guide" className="block text-white/80 hover:text-white transition-colors duration-300 hover:translate-x-1">
                Size Guide
              </Link>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <span className="text-white/80 text-sm">
                Copyright © 2025 Zafra. All rights reserved.
              </span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-6">
              <Link href="/privacy" className="text-white/80 hover:text-white text-sm transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-white/80 hover:text-white text-sm transition-colors duration-300">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-white/80 hover:text-white text-sm transition-colors duration-300">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}