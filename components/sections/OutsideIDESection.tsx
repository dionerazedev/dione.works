import DepthCarousel, { type DepthCarouselItem } from '../DepthCarousel';

const OUTSIDE_IDE_ITEMS: DepthCarouselItem[] = [
  {
    image: '/images/outside-ide/city-architecture.jpg',
    alt: 'Dione standing under a repeating architectural walkway',
    objectPosition: '50% 45%',
  },
  {
    image: '/images/outside-ide/gym-floor.jpg',
    alt: 'Dumbbells arranged on a dark gym floor near a weight bench',
    objectPosition: '50% 58%',
  },
  {
    image: '/images/outside-ide/court-day.jpg',
    alt: 'Dione swinging a paddle during an outdoor court game',
    objectPosition: '50% 42%',
  },
  {
    image: '/images/outside-ide/high-walk.jpg',
    alt: 'Dione standing on a high outdoor walkway above a green landscape',
    objectPosition: '50% 44%',
  },
  {
    image: '/images/outside-ide/garden-dome.jpg',
    alt: 'Dione looking toward a glass dome, indoor trees, and a waterfall',
    objectPosition: '50% 46%',
  },
];

const OUTSIDE_IDE_TAGS = ['Travel', 'Gym', 'Pickleball', 'Architecture'];

export const OutsideIDESection = () => (
  <section id="outside-ide" className="section-shell outside-ide-section" aria-labelledby="outside-ide-heading">
    <div className="outside-ide-layout">
      <div className="outside-ide-copy">
        <h2 id="outside-ide-heading">Outside the IDE</h2>
        <p>
          Away from code, I collect movement, travel, and everyday visual references. Those details give my projects more
          energy, patience, and perspective.
        </p>
        <ul className="outside-ide-tags" aria-label="Outside the IDE interests">
          {OUTSIDE_IDE_TAGS.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>
      </div>
      <div className="outside-ide-carousel" aria-label="Outside the IDE photo stack">
        <DepthCarousel
          items={OUTSIDE_IDE_ITEMS}
          cardWidth={260}
          cardHeight={326}
          depth={175}
          spread={58}
          tilt={16}
          visibleCards={4}
          blur={4}
          autoplay
          loop
        />
      </div>
    </div>
  </section>
);
