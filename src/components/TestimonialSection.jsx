import { Star, Quote } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const testimonials = [
  {
    quote: "The quality of the products exceeded my expectations. The customer service was also top-notch!",
    author: "Sarah Johnson",
    title: "Marketing Manager",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    quote: "An absolutely seamless shopping experience. The website is easy to navigate, and my order arrived fast.",
    author: "Michael Chen",
    title: "Lead Developer",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    quote: "Found exactly what I needed at a great price. The quality is fantastic!",
    author: "Jessica Williams",
    title: "Freelance Designer",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg"
  },
  {
    quote: "Fast shipping and excellent packaging. Will definitely order again.",
    author: "David Miller",
    title: "Small Business Owner",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg"
  },
  {
    quote: "The best customer support I've ever experienced. They truly care.",
    author: "Emma Wilson",
    title: "Teacher",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg"
  }
];

export default function TestimonialSection() {
  const scrollerRef = useRef(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    if (scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);
      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });
      setStart(true);
    }
  }, []);

  return (
    <section className="bg-white py-24 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center relative z-20">
        <span className="text-brand-orange font-bold text-xs uppercase tracking-[0.2em] mb-3 block">Community Love</span>
        <h2 className="text-4xl font-black text-gray-900 tracking-tight">
          Trusted by Professionals
        </h2>
      </div>

      <div 
        ref={scrollerRef}
        className={`flex gap-6 w-max ${start ? 'animate-scroll' : ''} hover:pause`}
      >
        {testimonials.map((testimonial, index) => (
          <div 
            key={index} 
            className="w-[350px] md:w-[450px] flex-shrink-0 bg-[#F9FAFB] rounded-[2rem] p-8 md:p-10 relative group border border-gray-100 hover:border-brand-orange/20 transition-colors duration-300"
          >
            <Quote className="absolute top-8 right-8 w-10 h-10 text-gray-200 group-hover:text-brand-orange/20 transition-colors duration-300" />
            
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-brand-orange fill-brand-orange" />
              ))}
            </div>
            
            <p className="text-lg text-gray-700 font-medium leading-relaxed mb-8 relative z-10">
              "{testimonial.quote}"
            </p>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <img src={testimonial.avatar} alt={testimonial.author} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{testimonial.author}</h4>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{testimonial.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .hover\:pause:hover {
          animation-play-state: paused;
        }
        @keyframes scroll {
          to {
            transform: translate(calc(-50% - 12px));
          }
        }
      `}</style>
    </section>
  );
}