// portfolioTemplates/Classic/components/OffersTab.jsx
import React from "react";
import UserCompanyOffersSection from "../../../../../components/controlPanel/userProfile/UserCompanyOffersSection";
import UserEducationalOffersSection from "../../../../../components/controlPanel/userProfile/UserEducationalOffersSection";

export default function OffersTab({ isCompany, isEducationalInstitution, companyOffers }) {
  return (
    <div className="user-extern-offers-content">
      {isCompany ? (
        <UserCompanyOffersSection offers={companyOffers} />
      ) : isEducationalInstitution ? (
        <UserEducationalOffersSection offers={companyOffers} />
      ) : null}
    </div>
  );
}
