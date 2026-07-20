import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../../Components/Navbar/Navbar";
import Button from "../../Components/Button/Button";
import usePageTitle from "../../hooks/usePageTitle";
import { useFormStore } from "../../Store/useFormStore";
import { listProjects, deleteProject } from "../../lib/projects";
import "./Projects.css";

function formatDate(iso, locale) {
  return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Projects() {
  const { t, i18n } = useTranslation();
  usePageTitle(t("auth.my_projects"));
  const navigate = useNavigate();
  const restoreFromSnapshot = useFormStore((state) => state.restoreFromSnapshot);

  const [projects, setProjects] = useState(null);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let ignore = false;
    listProjects().then(({ data, error: fetchError }) => {
      if (ignore) return;
      if (fetchError) {
        setError(fetchError.message);
        return;
      }
      setProjects(data);
    });
    return () => {
      ignore = true;
    };
  }, []);

  function handleLoad(project) {
    restoreFromSnapshot(project.payload);
    navigate("/result-3d");
  }

  async function handleDelete(id) {
    setDeletingId(id);
    const { error: deleteError } = await deleteProject(id);
    setDeletingId(null);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setProjects((prev) => prev.filter((project) => project.id !== id));
  }

  return (
    <div className="page">
      <Navbar />
      <main className="projects">
        <div className="projects__header">
          <h1 className="projects__title">{t("auth.my_projects")}</h1>
          <Button onClick={() => navigate("/upload")}>{t("projects.new_btn")}</Button>
        </div>

        {error && <p className="auth-error">{error}</p>}

        {projects === null ? (
          <p className="projects__hint">{t("projects.loading")}</p>
        ) : projects.length === 0 ? (
          <div className="projects__empty">
            <p>{t("projects.empty")}</p>
            <Button onClick={() => navigate("/upload")}>{t("projects.new_btn")}</Button>
          </div>
        ) : (
          <div className="projects__grid">
            {projects.map((project) => {
              const dims = project.payload?.landDimensions;
              const dimsLabel =
                dims?.width && dims?.height
                  ? t("map.dims_label", { width: dims.width, height: dims.height })
                  : null;
              return (
                <div className="project-card" key={project.id}>
                  <p className="project-card__name">{project.name}</p>
                  <p className="project-card__meta">
                    {formatDate(project.updated_at, i18n.language)}
                    {dimsLabel ? ` · ${dimsLabel}` : ""}
                  </p>
                  <div className="project-card__actions">
                    <button type="button" className="project-card__load" onClick={() => handleLoad(project)}>
                      {t("projects.load_btn")}
                    </button>
                    <button
                      type="button"
                      className="project-card__delete"
                      disabled={deletingId === project.id}
                      onClick={() => handleDelete(project.id)}
                    >
                      {t("projects.delete_btn")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
