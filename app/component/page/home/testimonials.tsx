const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "New York, NY",
    rating: 5,
    text: "Zafra's Midnight Jasmine is absolutely divine! The scent lasts all day and I constantly receive compliments. The quality is unmatched.",
    avatar: "👩‍🦰"
  },
  {
    id: 2,
    name: "Michael Chen",
    location: "Los Angeles, CA",
    rating: 5,
    text: "I've been collecting perfumes for 20 years, and Zafra's Royal Oud is now my signature scent. The craftsmanship is exceptional.",
    avatar: "👨‍💼"
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    location: "Miami, FL",
    rating: 5,
    text: "The Ocean Breeze fragrance is perfect for Miami's climate. Fresh, sophisticated, and long-lasting. Highly recommend!",
    avatar: "👩‍🎨"
  },
  {
    id: 4,
    name: "David Thompson",
    location: "Chicago, IL",
    rating: 5,
    text: "Citrus Burst is exactly what I was looking for. Bright, energizing, and perfect for summer. Great customer service too!",
    avatar: "👨‍🔬"
  },
  {
    id: 5,
    name: "Lisa Park",
    location: "Seattle, WA",
    rating: 5,
    text: "The packaging is beautiful and the fragrances are incredible. Zafra has become my go-to for all special occasions.",
    avatar: "👩‍💻"
  },
  {
    id: 6,
    name: "James Wilson",
    location: "Austin, TX",
    rating: 5,
    text: "Outstanding quality and unique scents. The attention to detail in both the fragrance and presentation is remarkable.",
    avatar: "👨‍🎵"
  }
];

export default function Testimonials() {
  return (
    <section className="w-full py-20 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            What Our <span className="text-iris">Customers</span> Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have found their perfect scent with Zafra
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-iris/20 group"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-lavender to-periwinkle rounded-full flex items-center justify-center text-2xl mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 group-hover:text-iris transition-colors">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>
              
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
              
              <p className="text-gray-600 leading-relaxed italic">
                "{testimonial.text}"
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center bg-gradient-to-r from-lavender to-periwinkle rounded-full px-8 py-4">
            <div className="flex items-center mr-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-xl">★</span>
              ))}
            </div>
            <div className="text-gray-800">
              <span className="text-2xl font-bold">4.9</span>
              <span className="text-sm ml-2">out of 5 stars</span>
            </div>
          </div>
          <p className="text-gray-600 mt-2">Based on 10,000+ customer reviews</p>
        </div>
      </div>
    </section>
  );
}
