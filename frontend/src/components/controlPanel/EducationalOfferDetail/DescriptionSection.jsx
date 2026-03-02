import React from 'react';

const DescriptionSection = ({ title = "Descripción del programa", content }) => {
    return (
        <section className="job-section-jobdetail">
            <h3 className="section-title-jobdetail">{title}</h3>
            <div className="rich-text-jobdetail" dangerouslySetInnerHTML={{ __html: content }}></div>
        </section>
    );
};

export default DescriptionSection;
