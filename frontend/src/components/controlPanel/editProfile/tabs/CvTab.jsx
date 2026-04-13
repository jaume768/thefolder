import React from "react";

import BiographySection from "./cv/BiographySection";
import ExperienceSection from "./cv/ExperienceSection";
import EducationSection from "./cv/EducationSection";
import PressPublicationsSection from "./cv/PressPublicationsSection";
import AwardsSection from "./cv/AwardsSection";
import SoftwareSection from "./cv/SoftwareSection";
import SoftSkillsSection from "./cv/SoftSkillsSection";
import LanguagesSection from "./cv/LanguagesSection";
import AvailabilitySection from "./cv/AvailabilitySection";

export default function CvTab({
  draft,
  setDraftField,

  MAX_BIO,
  MAX_EXP_DESC,

  // EXPERIENCE
  experiences,
  expFormOpen,
  expEditingIndex,
  expDraft,
  logoFileRef,
  MONTHS_ES,
  years,
  openEditExperienceForm,
  confirmDeleteExperience,
  openNewExperienceForm,
  cancelExperienceForm,
  saveExperience,
  saveExperienceAsDraft,
  updateExperienceField,
  uploadExperienceLogo,

  // EDUCATION
  educations,
  eduFormOpen,
  eduEditingIndex,
  eduDraft,
  eduLogoFileRef,
  openEditEducationForm,
  confirmDeleteEducation,
  openNewEducationForm,
  cancelEducationForm,
  saveEducation,
  saveEducationAsDraft,
  updateEducationField,
  uploadInstitutionLogo,

  // PRESS PUBLICATIONS
  pressPublications,
  pressFormOpen,
  pressEditingIndex,
  pressDraft,
  pressLogoFileRef,
  MAX_PRESS_DESC,
  openEditPressForm,
  confirmDeletePress,
  openNewPressForm,
  cancelPressForm,
  savePress,
  savePressAsDraft,
  updatePressField,
  uploadPressLogo,

  // AWARDS
  awards,
  awardFormOpen,
  awardEditingIndex,
  awardDraft,
  MAX_AWARD_DESC,
  openEditAwardForm,
  confirmDeleteAward,
  openNewAwardForm,
  cancelAwardForm,
  saveAward,
  saveAwardAsDraft,
  updateAwardField,

  // SOFTWARE
  softwareTags,
  softwareInput,
  setSoftwareInput,
  handleSoftwareKeyDown,
  removeSoftwareTag,
  popularSoftwareFiltered,
  addPopularSoftware,

  // SOFTSKILLS
  softSkillsTags,
  softSkillsInput,
  setSoftSkillsInput,
  handleSoftSkillsKeyDown,
  removeSoftSkillTag,

  // LANGUAGES
  languagesRows,
  addLanguageRow,
  updateLanguageField,
  removeLanguageRow,
  setLanguageLevel,

  // AVAILABILITY
  toggleDraftBool,
  setJobSearchActive,
}) {
  return (
    <div>
      <div className="ux-card-main">
        <h2 className="ux-card-title-h2">Curriculum Vitae</h2>
        <p className="ux-card-subtitle">
          Tu trayectoria profesional.<br />
          Añade tu experiencia, formación, habilidades e idiomas.
        </p>
      </div>

      <section id="card-cv">
        <div className="ux-editprofile-section">
          {/* 1) Biografía personal */}
          <BiographySection draft={draft} setDraftField={setDraftField} MAX_BIO={MAX_BIO} />

          {/* 2) Experiencia laboral */}
          <ExperienceSection
            experiences={experiences}
            expFormOpen={expFormOpen}
            expEditingIndex={expEditingIndex}
            expDraft={expDraft}
            logoFileRef={logoFileRef}
            MONTHS_ES={MONTHS_ES}
            years={years}
            MAX_EXP_DESC={MAX_EXP_DESC}
            openEditExperienceForm={openEditExperienceForm}
            confirmDeleteExperience={confirmDeleteExperience}
            openNewExperienceForm={openNewExperienceForm}
            cancelExperienceForm={cancelExperienceForm}
            saveExperience={saveExperience}
            saveExperienceAsDraft={saveExperienceAsDraft}
            updateExperienceField={updateExperienceField}
            uploadExperienceLogo={uploadExperienceLogo}
          />

          {/* 3) Formación educativa */}
          <EducationSection
            educations={educations}
            eduFormOpen={eduFormOpen}
            eduEditingIndex={eduEditingIndex}
            eduDraft={eduDraft}
            eduLogoFileRef={eduLogoFileRef}
            MONTHS_ES={MONTHS_ES}
            years={years}
            openEditEducationForm={openEditEducationForm}
            confirmDeleteEducation={confirmDeleteEducation}
            openNewEducationForm={openNewEducationForm}
            cancelEducationForm={cancelEducationForm}
            saveEducation={saveEducation}
            saveEducationAsDraft={saveEducationAsDraft}
            updateEducationField={updateEducationField}
            uploadInstitutionLogo={uploadInstitutionLogo}
          />

          {/* 4) Publicaciones en medios */}
          <PressPublicationsSection
            pressPublications={pressPublications}
            pressFormOpen={pressFormOpen}
            pressEditingIndex={pressEditingIndex}
            pressDraft={pressDraft}
            pressLogoFileRef={pressLogoFileRef}
            MONTHS_ES={MONTHS_ES}
            years={years}
            MAX_PRESS_DESC={MAX_PRESS_DESC}
            openEditPressForm={openEditPressForm}
            confirmDeletePress={confirmDeletePress}
            openNewPressForm={openNewPressForm}
            cancelPressForm={cancelPressForm}
            savePress={savePress}
            savePressAsDraft={savePressAsDraft}
            updatePressField={updatePressField}
            uploadPressLogo={uploadPressLogo}
          />

          {/* 5) Reconocimientos y premios */}
          <AwardsSection
            awards={awards}
            awardFormOpen={awardFormOpen}
            awardEditingIndex={awardEditingIndex}
            awardDraft={awardDraft}
            MONTHS_ES={MONTHS_ES}
            years={years}
            MAX_AWARD_DESC={MAX_AWARD_DESC}
            openEditAwardForm={openEditAwardForm}
            confirmDeleteAward={confirmDeleteAward}
            openNewAwardForm={openNewAwardForm}
            cancelAwardForm={cancelAwardForm}
            saveAward={saveAward}
            saveAwardAsDraft={saveAwardAsDraft}
            updateAwardField={updateAwardField}
          />

          {/* 7) Hardskills / Software */}
          <SoftwareSection
            softwareTags={softwareTags}
            softwareInput={softwareInput}
            setSoftwareInput={setSoftwareInput}
            handleSoftwareKeyDown={handleSoftwareKeyDown}
            removeSoftwareTag={removeSoftwareTag}
            popularSoftwareFiltered={popularSoftwareFiltered}
            addPopularSoftware={addPopularSoftware}
          />

          {/* 5) Softskills / Habilidades */}
          <SoftSkillsSection
            softSkillsTags={softSkillsTags}
            softSkillsInput={softSkillsInput}
            setSoftSkillsInput={setSoftSkillsInput}
            handleSoftSkillsKeyDown={handleSoftSkillsKeyDown}
            removeSoftSkillTag={removeSoftSkillTag}
          />

          {/* 6) Idiomas */}
          <LanguagesSection
            languagesRows={languagesRows}
            addLanguageRow={addLanguageRow}
            updateLanguageField={updateLanguageField}
            removeLanguageRow={removeLanguageRow}
            setLanguageLevel={setLanguageLevel}
          />

          {/* 7) Disponibilidad laboral */}
          <AvailabilitySection
            jobSearchActive={!!draft?.jobSearchActive}
            contract={draft?.contract}
            locationType={draft?.locationType}
            toggleDraftBool={toggleDraftBool}
            setJobSearchActive={setJobSearchActive}
          />
        </div>
      </section>
    </div>
  );
}