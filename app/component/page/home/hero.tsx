import Link from "next/link";

export default function Hero() {
    return (
        <div className="w-full min-h-[80vh] bg-gradient-to-br from-lavender via-periwinkle to-white flex flex-col justify-center items-center gap-8 px-8">
            <div className="text-center max-w-4xl">
                <h1 className="text-6xl md:text-8xl font-extrabold mb-4">
                    Discover Your
                    <span className="text-iris block">Signature Scent</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-8 font-light leading-relaxed">
                    Immerse yourself in the world of luxury fragrances. From exotic florals to woody mysteries, 
                    find the perfect perfume that tells your unique story.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link 
                        href="/perfumes" 
                        className="bg-iris text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition-all duration-300 shadow-lg"
                    >
                        Explore Collection
                    </Link>
                    <Link 
                        href="/quiz" 
                        className="border-2 border-iris text-iris px-8 py-4 rounded-full text-lg font-semibold hover:bg-iris hover:text-white transition-all duration-300"
                    >
                        Find My Scent
                    </Link>
                </div>
            </div>
            
            {/* Floating perfume bottle icons */}
            <div className="absolute top-20 left-10 opacity-20">
                <div className="w-16 h-24 bg-gradient-to-b from-iris to-periwinkle rounded-t-full rounded-b-lg transform rotate-12"></div>
            </div>
            <div className="absolute top-32 right-16 opacity-15">
                <div className="w-12 h-20 bg-gradient-to-b from-periwinkle to-lavender rounded-t-full rounded-b-lg transform -rotate-12"></div>
            </div>
            <div className="absolute bottom-20 left-20 opacity-10">
                <div className="w-14 h-22 bg-gradient-to-b from-lavender to-iris rounded-t-full rounded-b-lg transform rotate-6"></div>
            </div>
        </div>
    );
}