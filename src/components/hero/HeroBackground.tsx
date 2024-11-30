import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const backgrounds = [
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80',
    description: 'Aerial view of waves crashing'
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1505144808419-1957a94ca61e?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80',
    description: 'Palm trees swaying in breeze'
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80',
    description: 'Pristine beach sunset'
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80',
    description: 'Tropical paradise view'
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80',
    description: 'Ocean sunset panorama'
  },
  {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80',
    description: 'Secluded beach cove'
  }
];

export default function HeroBackground() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Set initial background based on day of week
  useEffect(() => {
    const dayOfWeek = new Date().getDay();
    setCurrentIndex(dayOfWeek % backgrounds.length);
  }, []);

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % backgrounds.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + backgrounds.length) % backgrounds.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToIndex = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const current = backgrounds[currentIndex];

  return (
    <div className="relative h-[500px] overflow-hidden">
      {/* Background Content */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <img
          src={current.url}
          alt={current.description}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Navigation Controls */}
      <div className="absolute inset-0 flex items-center justify-between p-4">
        <button
          onClick={goToPrevious}
          disabled={isTransitioning}
          className="rounded-full bg-black/20 p-2 text-white backdrop-blur-sm transition hover:bg-black/30 disabled:opacity-50"
          aria-label="Previous background"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={goToNext}
          disabled={isTransitioning}
          className="rounded-full bg-black/20 p-2 text-white backdrop-blur-sm transition hover:bg-black/30 disabled:opacity-50"
          aria-label="Next background"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Background Indicators */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
        {backgrounds.map((_, index) => (
          <button
            key={index}
            onClick={() => goToIndex(index)}
            disabled={isTransitioning}
            className={`h-2 w-2 rounded-full transition ${
              index === currentIndex
                ? 'bg-white'
                : 'bg-white/50 hover:bg-white/75'
            } disabled:cursor-not-allowed`}
            aria-label={`Go to background ${index + 1}`}
          >
            <span className="sr-only">Go to background {index + 1}</span>
          </button>
        ))}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
    </div>
  );
}