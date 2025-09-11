export default function AboutSection() {
  return (
    <section className="w-full py-20 bg-gradient-to-br from-lavender to-periwinkle">
      <div className="max-w-6xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Crafting <span className="text-iris">Timeless</span> Fragrances
            </h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              At Zafra, we believe that every scent tells a story. Our master perfumers have spent decades 
              perfecting the art of fragrance creation, blending rare ingredients from around the world to 
              create unforgettable olfactory experiences.
            </p>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              From the bustling markets of Marrakech to the lavender fields of Provence, we source only 
              the finest ingredients to ensure each bottle contains a masterpiece of scent artistry.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-iris mb-2">500+</div>
                <div className="text-sm text-gray-600">Unique Fragrances</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-iris mb-2">50+</div>
                <div className="text-sm text-gray-600">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-iris mb-2">1M+</div>
                <div className="text-sm text-gray-600">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-iris mb-2">100%</div>
                <div className="text-sm text-gray-600">Natural Ingredients</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-iris to-periwinkle rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl">🌸</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Our Process</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-iris text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Sourcing</h4>
                    <p className="text-sm text-gray-600">We carefully select premium ingredients from trusted suppliers worldwide</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-iris text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Blending</h4>
                    <p className="text-sm text-gray-600">Master perfumers create unique compositions using traditional techniques</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-iris text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Aging</h4>
                    <p className="text-sm text-gray-600">Each fragrance is aged to perfection for optimal scent development</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-iris text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Quality Control</h4>
                    <p className="text-sm text-gray-600">Rigorous testing ensures every bottle meets our high standards</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-periwinkle to-lavender rounded-full opacity-30"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-iris to-periwinkle rounded-full opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
