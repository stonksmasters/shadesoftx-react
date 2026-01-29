import React, { useMemo, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SERVICES, type ServiceCategory } from '../data/servicesData';
import ServicesGrid from '../components/ServicesGrid';

export const ServicesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // default to residential if no param present
  const initialParam = (searchParams.get('category') as ServiceCategory) ?? 'residential';
  const [selected, setSelected] = useState<ServiceCategory>(initialParam);

  // keep local state in sync if user loads /services?category=commercial directly or uses back/forward
  useEffect(() => {
    const q = (searchParams.get('category') as ServiceCategory) ?? 'residential';
    if (q !== selected) setSelected(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // when selected changes (via UI), update URL param so links are shareable
  useEffect(() => {
    if ((searchParams.get('category') ?? '') !== selected) {
      setSearchParams({ category: selected });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const filtered = useMemo(
    () => SERVICES.filter((s) => s.category === selected || s.category === 'both'),
    [selected],
  );

  const handleCardClick = (id: string) => {
    const svc = SERVICES.find((s) => s.id === id);
    if (svc?.link) {
      window.location.href = svc.link;
    } else {
      console.log('open', id);
    }
  };

  return (
    <main className="services-page container">
      <header className="page-intro">
        <h1>{selected === 'residential' ? 'Residential Home Solutions' : 'Commercial Window & Patio Solutions'}</h1>
        <p>
          {selected === 'residential'
            ? 'From energy-saving film to premium windows, select a category to begin.'
            : 'Improve energy efficiency, tenant comfort, and facility security with professional-grade installations.'}
        </p>
      </header>

      <div className="services-toggle" role="tablist" aria-label="Select service category">
        <button
          aria-pressed={selected === 'residential'}
          className={selected === 'residential' ? 'active' : ''}
          onClick={() => setSelected('residential')}
        >
          Residential
        </button>
        <button
          aria-pressed={selected === 'commercial'}
          className={selected === 'commercial' ? 'active' : ''}
          onClick={() => setSelected('commercial')}
        >
          Commercial
        </button>
      </div>

      <section className="category-block">
        <h2 className="category-title">{selected === 'residential' ? 'Services' : 'Commercial Services'}</h2>
        <ServicesGrid services={filtered} onCardClick={handleCardClick} />
      </section>
    </main>
  );
};

export default ServicesPage;