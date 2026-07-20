import { lazy, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import usePageTitle from '../../hooks/usePageTitle';
import { useFormStore } from '../../Store/useFormStore';
import './Result3D.css';

// MapLibre GL is a heavy dependency (~1MB) — only fetch it once someone
// actually opens the map tab, instead of bundling it into every page load.
const PlotMapView = lazy(() => import('../../Components/PlotMapView/PlotMapView'));

const Result3D = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState('3D');
  const landCoordinates = useFormStore((state) => state.landCoordinates);
  const landDimensions = useFormStore((state) => state.landDimensions);
  const landRotation = useFormStore((state) => state.landRotation);

  return (
    <div className="house-plan-wrapper" dir="rtl">
      <div className="house-plan-container">

        {/* Header */}
        <div className="house-plan-header">
          <h2 className="house-plan-title">{t("result3d.title")}</h2>
          <p className="house-plan-subtitle">
            {t("result3d.subtitle")}
          </p>
        </div>

        {/* Main Layout */}
        <div className="house-plan-layout">

          {/* LEFT COLUMN (visually): 3D View Area - placed SECOND in DOM */}
          <div className="house-plan-view">
            {/* View Toggle - at top of view area */}
            <div className="view-toggle">
              <button
                className={`toggle-btn ${viewMode === '2D' ? 'toggle-btn-active' : ''}`}
                onClick={() => setViewMode('2D')}
              >
                {t("result3d.toggle_2d")}
              </button>
              <button className="toggle-btn toggle-btn--disabled" disabled>
                {t("result3d.toggle_3d")} <span className="toggle-btn-badge">{t("result3d.soon")}</span>
              </button>
              <button
                className={`toggle-btn ${viewMode === 'MAP' ? 'toggle-btn-active' : ''}`}
                onClick={() => setViewMode('MAP')}
              >
                {t("result3d.toggle_map")}
              </button>
            </div>

            {viewMode === 'MAP' ? (
              <div className="view-container view-container-map">
                <Suspense fallback={null}>
                  <PlotMapView
                    lat={landCoordinates?.lat ? Number(landCoordinates.lat) : null}
                    lng={landCoordinates?.lng ? Number(landCoordinates.lng) : null}
                    widthM={Number(landDimensions?.width)}
                    heightM={Number(landDimensions?.height)}
                    rotationDeg={landRotation || 0}
                  />
                </Suspense>
              </div>
            ) : (
              <div className="view-container">
                {/* 3D House Illustration */}
                <div className="house-3d">
                  <svg viewBox="0 0 400 300" className="house-svg">
                    {/* Main house block - back */}
                    <path
                      d="M120 200 L280 200 L280 280 L120 280 Z"
                      fill="#C5D5E5"
                      stroke="#7BA4C4"
                      strokeWidth="1"
                    />
                    {/* Main house block - left side */}
                    <path
                      d="M80 160 L120 200 L120 280 L80 240 Z"
                      fill="#A8BED4"
                      stroke="#7BA4C4"
                      strokeWidth="1"
                    />
                    {/* Main house block - top */}
                    <path
                      d="M80 160 L200 100 L320 160 L280 200 L120 200 Z"
                      fill="#D4E1ED"
                      stroke="#7BA4C4"
                      strokeWidth="1.5"
                    />
                    {/* Main house right side */}
                    <path
                      d="M200 100 L320 160 L320 240 L280 200 L280 280 L200 220 Z"
                      fill="#B8CCE0"
                      stroke="#7BA4C4"
                      strokeWidth="1"
                    />
                    {/* Entrance cutout */}
                    <path
                      d="M140 240 L180 240 L180 280 L140 280 Z"
                      fill="#E8EEF4"
                      stroke="#7BA4C4"
                      strokeWidth="1"
                    />
                    {/* Entrance inner */}
                    <path
                      d="M140 240 L160 230 L160 270 L140 280 Z"
                      fill="#9BB8D0"
                      stroke="#7BA4C4"
                      strokeWidth="1"
                    />
                  </svg>
                </div>

                {/* Labels */}
                <div className="house-label house-label-main">كافة الأدوية الرئيسية</div>
                <div className="house-label house-label-entrance">إيجابي – مدخل مستقل</div>

                {/* Zoom Controls */}
                <div className="zoom-controls">
                  <button className="zoom-btn">+</button>
                  <button className="zoom-btn">−</button>
                </div>
              </div>
            )}

            {/* Bottom Note */}
            <div className="view-footer">
              <span>{t("result3d.footer")}</span>
            </div>
          </div>

          {/* RIGHT COLUMN (visually): Sidebar - placed FIRST in DOM */}
          <div className="house-plan-sidebar">

            {/* Action Buttons */}
            <button className="action-btn action-btn-primary">
              {t("result3d.btn_pdf")}
            </button>

            <button className="action-btn action-btn-outline">
              {t("result3d.btn_share")}
            </button>

            {/* File Formats */}
            <div className="file-formats">
              <p className="file-formats-title">{t("result3d.files_title")}</p>
              <div className="file-formats-buttons">
                <button className="format-btn format-btn--disabled" disabled>
                  DWG <span className="format-btn-badge">{t("result3d.soon")}</span>
                </button>
                <button className="format-btn format-btn--disabled" disabled>
                  DXF <span className="format-btn-badge">{t("result3d.soon")}</span>
                </button>
                <button className="format-btn">SVG</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result3D;