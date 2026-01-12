import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "The quality of the products exceeded my expectations. The customer service was also top-notch, helping me with every step. I highly recommend this store to everyone!",
    author: "Sarah Johnson",
    title: "Marketing Manager, TechCorp",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    quote: "An absolutely seamless shopping experience from start to finish. The website is easy to navigate, and my order arrived faster than I expected. Will definitely be a returning customer.",
    author: "Michael Chen",
    title: "Lead Developer, Innovate Solutions",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    quote: "I was looking for a very specific item and found it here at a great price. The quality is fantastic, and the support team was incredibly helpful with my questions.",
    author: "Jessica Williams",
    title: "Freelance Designer",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg"
  }
];

export default function TestimonialSection() {
  return (
    <section className="bg-gray-50  py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900  mb-4">
            What Our <span className="text-primary-700 ">Customers Say</span>
          </h2>
          <p className="text-lg text-gray-600  max-w-2xl mx-auto">
            We pride ourselves on customer satisfaction and quality service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white  rounded-2xl shadow-lg p-8 transform hover:-translate-y-2 transition-transform duration-300">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600  italic mb-6">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <img src={testimonial.avatar} alt={testimonial.author} className="w-12 h-12 rounded-full mr-4 object-cover" />
                <div>
                  <p className="font-semibold text-gray-900 ">{testimonial.author}</p>
                  <p className="text-sm text-gray-500 ">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
