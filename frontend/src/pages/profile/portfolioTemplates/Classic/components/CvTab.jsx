// portfolioTemplates/Classic/components/CvTab.jsx
import React from "react";
import UserBiographySection from "../../../../../components/controlPanel/userProfile/UserBiographySection";
import UserProfessionalExperienceSection from "../../../../../components/controlPanel/userProfile/UserProfessionalExperienceSection";
import UserSkillsSection from "../../../../../components/controlPanel/userProfile/UserSkillsSection";
import UserSoftwareSection from "../../../../../components/controlPanel/userProfile/UserSoftwareSection";
import UserEducationSection from "../../../../../components/controlPanel/userProfile/UserEducationSection";
import UserPressPublicationsSection from "../../../../../components/controlPanel/userProfile/UserPressPublicationsSection";
import UserAwardsSection from "../../../../../components/controlPanel/userProfile/UserAwardsSection";
import UserLanguagesSection from "../../../../../components/controlPanel/userProfile/UserLanguagesSection";
import UserSocialSection from "../../../../../components/controlPanel/userProfile/UserSocialSection";
import UserCompanyTagsSection from "../../../../../components/controlPanel/userProfile/UserCompanyTagsSection";
import UserMilestoneSection from "../../../../../components/controlPanel/userProfile/UserMilestoneSection";
import UserDownloadableFilesSection from "../../../../../components/controlPanel/userProfile/UserDownloadableFilesSection";

export default function CvTab({ profile, username, isCompany, isEducationalInstitution }) {
  const languages = profile?.languages || profile?.profile?.languages || [];

  return (
    <div className="resume-two-col">
      <div className="resume-main">
        {isCompany ? (
          <div className="user-extern-company-profile">
            <UserCompanyTagsSection companyTags={profile?.companyTags} offersPractices={profile?.offersPractices} />
            <UserBiographySection biography={profile?.biography} />
            <UserMilestoneSection professionalMilestones={profile?.professionalMilestones} />
            <UserSocialSection social={profile?.social} />
            <UserLanguagesSection languages={languages} />
          </div>
        ) : isEducationalInstitution ? (
          <div className="user-extern-institution-profile">
            <UserBiographySection biography={profile?.biography} />
            <UserSkillsSection skills={profile?.skills} />
            <UserSocialSection social={profile?.social} />
            <UserLanguagesSection languages={languages} />
          </div>
        ) : (
          <div className="user-extern-creative-profile">
            <UserBiographySection biography={profile?.biography} />
            <UserProfessionalExperienceSection professionalFormation={profile?.professionalFormation} />
            <UserEducationSection education={profile?.education} />
            <UserPressPublicationsSection pressPublications={profile?.pressPublications} />
            <UserAwardsSection awards={profile?.awards} />
            <UserSkillsSection skills={profile?.skills} />
            <UserSoftwareSection software={profile?.software} />
            <UserLanguagesSection languages={languages} />
          </div>
        )}
      </div>

      <div className="resume-aside">
        <UserDownloadableFilesSection
          cvUrl={profile?.cvUrl}
          portfolioUrl={profile?.portfolioUrl}
          userId={profile?._id}
          username={username}
        />
      </div>
    </div>
  );
}
