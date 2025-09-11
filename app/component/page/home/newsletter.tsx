export default function Newsletter() {
  return (
    <section className="w-full py-20 bg-gradient-to-r from-iris to-periwinkle">
      <div className="max-w-4xl mx-auto px-8 text-center">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-iris to-periwinkle rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-3xl">📧</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Stay in the <span className="text-iris">Loop</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Be the first to discover new fragrances, exclusive offers, and perfume tips from our experts. 
              Join our community of fragrance enthusiasts!
            </p>
          </div>

          <form className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-iris focus:border-transparent text-gray-800 placeholder-gray-500"
                required
              />
              <button
                type="submit"
                className="bg-iris text-white px-8 py-4 rounded-full font-semibold hover:bg-opacity-90 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Subscribe
              </button>
            </div>
          </form>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-lavender rounded-full flex items-center justify-center mb-3">
                <span className="text-xl">🎁</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Exclusive Offers</h4>
              <p className="text-sm text-gray-600">Special discounts for subscribers only</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-lavender rounded-full flex items-center justify-center mb-3">
                <span className="text-xl">🆕</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">New Releases</h4>
              <p className="text-sm text-gray-600">Be first to try our latest fragrances</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-lavender rounded-full flex items-center justify-center mb-3">
                <span className="text-xl">💡</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Expert Tips</h4>
              <p className="text-sm text-gray-600">Perfume application and care guides</p>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}
