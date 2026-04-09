import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const featuredCategories = [
  {
    title: 'Birthday Planning',
    image:
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Wedding Decor',
    image:
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Kids Celebration',
    image:
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Surprise Proposal',
    image:
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
  },
];

const newsItems = [
  {
    date: '14 MAY',
    title: 'New Premium Decor Packages',
    description:
      'Elegant decoration themes and curated setups are now available for birthdays, engagements, and private events.',
  },
  {
    date: '12 MAY',
    title: 'Top Vendors Joined Us',
    description:
      'We added trusted photographers, caterers, decorators, and planners to help deliver better event experiences.',
  },
];

export default function Home() {
  return (
    <div className="bg-[#f8f4f2] text-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="grid min-h-[85vh] lg:grid-cols-2">
          <div className="flex items-center px-6 py-16 sm:px-10 lg:px-16 xl:px-24">
            <div className="max-w-xl">
               <h1 className="text-4xl font-semibold leading-tight text-[#4b2e35] sm:text-5xl lg:text-6xl">
                Create unforgettable
                <span className="block text-[#b76e79]">surprise events</span>
              </h1>

              <p className="mt-6 text-lg leading-8 text-gray-600">
                From birthdays to proposals, we help you plan beautiful events
                with trusted vendors, premium decor, and memorable experiences
                that actually feel special.
              </p>

             
              <div className="mt-10 grid grid-cols-3 gap-6 border-t border-[#e7d7da] pt-8">
                <div>
                  <h3 className="text-2xl font-semibold text-[#4b2e35]">500+</h3>
                  <p className="text-sm text-gray-600">Events Managed</p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-[#4b2e35]">150+</h3>
                  <p className="text-sm text-gray-600">Trusted Vendors</p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-[#4b2e35]">4.9/5</h3>
                  <p className="text-sm text-gray-600">Client Rating</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative min-h-[400px] lg:min-h-full">
            <img
              src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=80"
              alt="Luxury event decoration"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#4b2e35]/10 to-[#4b2e35]/30" />

            <div className="absolute bottom-8 left-8 right-8 rounded-2xl bg-white/90 p-6 shadow-xl backdrop-blur">
              <p className="text-sm uppercase tracking-[0.25em] text-[#b76e79]">
                Best ideas for your next celebration
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#4b2e35]">
                Stylish setups. Trusted people. Smooth bookings.
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Plan premium events without wasting time chasing random vendors
                or badly organized services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="px-6 py-16 sm:px-10 lg:px-16 xl:px-24">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-[#b76e79]">
            Featured Services
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-[#4b2e35] sm:text-4xl">
            Event categories people love
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Pick from curated event styles and services designed for memorable
            celebrations, not boring generic packages.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {featuredCategories.map((item) => (
            <div
              key={item.title}
              className="group overflow-hidden rounded-2xl bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-72 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-semibold text-white">
                    {item.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Welcome Section */}
      <section className="bg-white px-6 py-20 sm:px-10 lg:px-16 xl:px-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-[#b76e79]">
            Welcome
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-[#4b2e35] sm:text-4xl">
            We turn ideas into beautifully managed events
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Good events are not just about decoration. They need planning,
            coordination, reliable vendors, and a clear experience from booking
            to execution. That is exactly what we help you do.
          </p>
        </div>
      </section>

      {/* Bottom Grid */}
      <section className="px-6 py-16 sm:px-10 lg:px-16 xl:px-24">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* About */}
          <div className="rounded-2xl bg-white p-8 shadow-md">
            <p className="text-sm uppercase tracking-[0.25em] text-[#b76e79]">
              About Us
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-[#4b2e35]">
              Personalized planning with premium execution
            </h3>
            <img
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1000&q=80"
              alt="Happy clients"
              className="mt-6 h-52 w-full rounded-xl object-cover"
            />
            <p className="mt-6 leading-7 text-gray-600">
              We help clients discover reliable event services without the usual
              mess, delays, or average-quality experiences.
            </p>
          </div>

          {/* Offer */}
          <div className="rounded-2xl bg-[#b76e79] p-8 text-white shadow-md">
            <p className="text-sm uppercase tracking-[0.25em] text-white/80">
              Hot Offer
            </p>
            <h3 className="mt-3 text-3xl font-semibold">Save your money</h3>
            <p className="mt-6 leading-7 text-white/90">
              Book selected event packages this month and get special pricing on
              decor, photography, entertainment, and venue coordination.
            </p>
          </div>

          {/* News */}
          <div className="rounded-2xl bg-white p-8 shadow-md">
            <p className="text-sm uppercase tracking-[0.25em] text-[#7bb7bf]">
              Our News
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-[#4b2e35]">
              Latest updates
            </h3>

            <div className="mt-8 space-y-8">
              {newsItems.map((item) => (
                <div key={item.date} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7bb7bf]">
                    {item.date}
                  </p>
                  <h4 className="mt-2 text-lg font-semibold text-[#4b2e35]">
                    {item.title}
                  </h4>
                  <p className="mt-2 leading-7 text-gray-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20 sm:px-10 lg:px-16 xl:px-24">
        <div className="rounded-3xl bg-[#4b2e35] px-8 py-14 text-center text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-[#e2b7bf]">
            Start Today
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Ready to plan something worth remembering?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            Stop settling for average event pages. Build a premium experience
            that actually makes people want to book.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button
                size="lg"
                className="w-full bg-[#b76e79] text-white hover:bg-[#9f5b65] sm:w-auto"
              >
                Get Started
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-white text-white hover:bg-white/10 sm:w-auto"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}