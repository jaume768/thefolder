import React from 'react';

const HeaderSection = ({ banner, programName, studyType, institutionName }) => {
    return (
        <div className="job-offer-header-jobdetail">
            {banner && (
                <div className="job-offer-banner-jobdetail">
                    <img
                        src={banner || '/multimedia/education-default.png'}
                        alt={programName}
                        className="banner-image-jobdetail"
                    />
                </div>
            )}
            <div className="job-offer-title-section-jobdetail">
                <div className="job-offer-title-row-jobdetail">
                    <h1 className="job-offer-position-jobdetail">{programName}</h1>
                </div>
                {institutionName && (
                    <div className="job-offer-company-name-jobdetail">{institutionName}</div>
                )}
                <div className="job-offer-company-name-jobdetail">{studyType}</div>
            </div>
        </div>
    );
};

export default HeaderSection;
