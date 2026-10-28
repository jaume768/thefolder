// pages/proyectos/ProjectEditorPage.jsx
// /myprofile/projects/:id/edit — editor de proyecto a página completa dentro del
// panel (enlaces directos). Desde "Tus proyectos" el mismo editor se abre
// como modal; todo el contenido y la lógica viven en ProjectEditor.jsx.
import React from 'react';
import { useParams } from 'react-router-dom';
import ProjectEditor from '../../components/controlPanel/proyectos/ProjectEditor';

export default function ProjectEditorPage() {
  const { id } = useParams();
  return <ProjectEditor key={id} id={id} variant="page" />;
}
