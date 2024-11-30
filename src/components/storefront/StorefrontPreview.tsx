import React from 'react';
import { CheckCircle } from 'lucide-react';

interface StorefrontPreviewProps {
  config: any;
  memberships: any[];
  businessName?: string;
  logoUrl?: string;
}

export default function StorefrontPreview({ 
  config, 
  memberships,
  businessName,
  logoUrl
}: StorefrontPreviewProps) {
  const headlineStyles = {
    fontFamily: 'Tahoma, Arial, sans-serif',
    fontWeight: 800,
    fontSize: '1.5rem',
    letterSpacing: '-0.02em',
    lineHeight: 1.2
  };

  const membershipNameStyles = {
    fontFamily: 'Tahoma, Arial, sans-serif',
    fontWeight: 700,
    fontSize: '1.25rem',
    letterSpacing: '-0.01em'
  };

  const getTextColor = (bgColor: string) => {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? 'text-gray-900' : 'text-white';
  };

  const formatPrice = (membership: any) => {
    const parts = [];
    
    if (membership.monthlyPrice) {
      parts.push(`$${membership.monthlyPrice}/mo`);
    }
    
    if (membership.yearlyPrice?.firstYear) {
      parts.push(`$${membership.yearlyPrice.firstYear}/yr`);
    }

    if (parts.length === 0) {
      return 'Contact for pricing';
    }

    return parts.join(' or ');
  };

  const sortedMemberships = [...memberships]
    .filter(m => config.cards[m.id]?.visibilityType !== 'hidden')
    .sort((a, b) => 
      (config.cards[a.id]?.displayOrder || 0) - (config.cards[b.id]?.displayOrder || 0)
    );

  return (
    <div 
      className="min-h-screen w-full"
      style={{ backgroundColor: config.backgroundColor }}
    >
      <div className="max-w-md mx-auto px-4 py-12">
        {logoUrl && (
          <div className="flex justify-center mb-8">
            <img 
              src={logoUrl} 
              alt={businessName || 'Business Logo'} 
              className="h-12 w-auto"
            />
          </div>
        )}

        <div className="text-center mb-12">
          <h1 
            className={`${getTextColor(config.backgroundColor)}`}
            style={headlineStyles}
          >
            {config.headerText}
          </h1>
        </div>

        <div className="space-y-6">
          {sortedMemberships.map((membership) => {
            const cardConfig = config.cards[membership.id];
            const cardTextColor = getTextColor(cardConfig.backgroundColor || '#ffffff');
            
            return (
              <div
                key={membership.id}
                className={`rounded-lg p-6 relative ${
                  cardConfig.isFeatured ? 'ring-2 ring-black' : ''
                }`}
                style={{ backgroundColor: cardConfig.backgroundColor || '#ffffff' }}
              >
                {cardConfig.isFeatured && (
                  <div className="absolute top-0 right-0 -translate-y-1/2 px-4 py-1 bg-black text-white text-sm font-medium rounded-full">
                    Most Popular
                  </div>
                )}

                <div 
                  className="mb-4" 
                  style={{ 
                    ...membershipNameStyles,
                    color: cardTextColor 
                  }}
                >
                  {cardConfig.salesCopy?.title || membership.name}
                </div>

                {cardConfig.salesCopy?.description && (
                  <p className={`mb-6 ${cardTextColor} opacity-80`}>
                    {cardConfig.salesCopy.description}
                  </p>
                )}

                <div className="text-2xl font-bold mb-6" style={{ color: cardTextColor }}>
                  {formatPrice(membership)}
                </div>

                <div className="space-y-3 mb-8">
                  {cardConfig.salesCopy?.benefits?.map((benefit: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-black" />
                      <span style={{ color: cardTextColor }}>{benefit}</span>
                    </div>
                  ))}
                </div>

                <button
                  className="w-full py-3 px-4 rounded-lg text-white font-medium transition-opacity hover:opacity-90"
                  style={{ backgroundColor: cardConfig.buttonColor || '#000000' }}
                >
                  {cardConfig.salesCopy?.callToAction || 'Get Started'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}