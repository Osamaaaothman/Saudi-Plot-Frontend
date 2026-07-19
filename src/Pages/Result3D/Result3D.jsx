import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import usePageTitle from '../../hooks/usePageTitle';
import './Result3D.css';

const Result3D = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState('3D');

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

        {/* Green Banner */}
        <div className="house-plan-banner">
          <span className="banner-icon">✓</span>
          <span>{t("result3d.banner")}</span>
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
              <button 
                className={`toggle-btn ${viewMode === '3D' ? 'toggle-btn-active' : ''}`}
                onClick={() => setViewMode('3D')}
              >
                {t("result3d.toggle_3d")}
              </button>
            </div>

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

            {/* Bottom Note */}
            <div className="view-footer">
              <span>{t("result3d.footer")}</span>
            </div>
          </div>

          {/* RIGHT COLUMN (visually): Sidebar - placed FIRST in DOM */}
          <div className="house-plan-sidebar">

            {/* Summary Card */}
            <div className="summary-card">
              <h3 className="summary-title">{t("result3d.summary_title")}</h3>

              <div className="summary-list">
                <div className="summary-item">
                  <span className="summary-label">{t("result3d.summary_total")}</span>
                  <span className="summary-value">2,892 م²</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">{t("result3d.summary_streets")}</span>
                  <span className="summary-value">3 جهات – غربي شمالي شرقي</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">{t("result3d.summary_dims")}</span>
                  <span className="summary-value">4 نوم – 3 دور – مساحة</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">{t("result3d.summary_kitchen")}</span>
                  <span className="summary-value">مطبخ مفتوح مستقل</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">{t("result3d.summary_design")}</span>
                  <span className="summary-value">دور أرضي</span>
                </div>
              </div>
            </div>

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
                <button className="format-btn">DWG</button>
                <button className="format-btn">DXF</button>
                <button className="format-btn">SVG</button>
              </div>
            </div>

            {/* Price */}
            <div className="price-section">
              <p className="price-label">{t("result3d.price_label")}</p>
              <p className="price-value">18,000 ر.س</p>
            </div>

            {/* Additional Buttons */}
            <div className="extra-buttons">
              <button className="extra-btn">EPC 240 / RCA</button>
              <button className="extra-btn">ألوان الواجهة (CFD/CFM)</button>
            </div>

            {/* Footer Note */}
            <p className="footer-note">
              {t("result3d.footer_note")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result3D;