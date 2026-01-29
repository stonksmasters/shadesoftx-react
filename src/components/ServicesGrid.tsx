import React from 'react';
import type { Service } from '../data/servicesData';
import ServiceCard from './ServiceCard';

type Props = {
  services: Service[];
  onCardClick?: (id: string) => void;
};

export const ServicesGrid: React.FC<Props> = ({ services, onCardClick }) => {
  if (services.length === 0) {
    return <p>No services found for this category.</p>;
  }

  return (
    <div className="services-grid" role="list">
      {services.map((s) => (
        <div key={s.id} role="listitem" className="services-grid__item">
          <ServiceCard service={s} onClick={onCardClick} />
        </div>
      ))}
    </div>
  );
};

export default ServicesGrid;