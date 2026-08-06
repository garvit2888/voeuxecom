import React from 'react';

export const WarrantyPolicyPage = () => {
  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-12 sm:py-16 max-w-3xl space-y-10 text-gray-900 text-left">
        
        {/* Document Header */}
        <div className="border-b border-gray-200 pb-6 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            REPAIRS / REPLACEMENT & WARRANTY POLICY
          </h1>
          <p className="text-gray-500 text-xs font-medium">
            VOEUX® Electronics • Official Coverage, Returns & Replacement Guidelines
          </p>
        </div>

        {/* 1. Return Policy */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            1. RETURN POLICY
          </h2>
          <p className="text-xs text-gray-700 leading-relaxed">
            We encourage all our customers to review product details carefully before making a purchase. As part of our commitment to quality assurance, returns are not accepted once a product is delivered and unboxed.
          </p>
        </section>

        {/* 2. Replacement Policy */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            2. REPLACEMENT POLICY
          </h2>
          
          <ul className="space-y-2.5 text-xs text-gray-700 leading-relaxed list-disc list-inside pl-1">
            <li>
              If your product has a technical issue, you can request a replacement within 7 days of delivery.
            </li>
            <li>
              The product will be physically checked. If a genuine technical issue is found, we will issue a fresh replacement. If no issue is found, the same unit will be returned.
            </li>
            <li>
              Replacement can be requested if the customer establishes that the product delivered was physically damaged within 24 hours of receipt (supported by unboxing video).
            </li>
            <li>
              If a ticket is raised post 7 days of delivery and within the warranty period, product is replaced with an equivalent condition product, post testing.
            </li>
          </ul>
        </section>

        {/* 3. Warranty Coverage & Exclusions */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            3. WARRANTY COVERAGE & EXCLUSIONS
          </h2>

          <p className="text-xs font-bold text-gray-900">
            1 Year Domestic Warranty on Manufacturing Defects
          </p>

          <div className="space-y-4 text-xs text-gray-700 leading-relaxed pt-1">
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 text-xs">Covered In Warranty:</h3>
              <p>Manufacturing defects in the hardware components and internal electronics under normal usage.</p>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 text-xs">NOT Covered In Warranty:</h3>
              <p>Physical damage, water/liquid damage, burnt units, burnt ICs/boards, unauthorized modifications, accessories, or issues arising from improper vehicle installation.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
