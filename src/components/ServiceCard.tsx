import React from 'react';
import type { Service } from '../data/servicesData';

type Props = {
  service: Service;
  onClick?: (id: string) => void;
};

export const ServiceCard: React.FC<Props> = ({ service, onClick }) => {
  const handleClick = () => onClick && onClick(service.id);

  return (
    <article
      className="service-card"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
      aria-label={`Open ${service.title}`}
    >
      <h3 className="service-card__title">{service.title}</h3>
      <p className="service-card__desc">{service.description}</p>
      <div className="service-card__cta">
        <a href={service.link ?? '#'} onClick={(e) => { /* allow navigation or open modal */ }}>
          Learn more
        </a>
      </div>
    </article>
  );
};

export default ServiceCard;