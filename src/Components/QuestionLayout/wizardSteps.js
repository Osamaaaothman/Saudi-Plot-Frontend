import {
  FamilyIcon,
  AccessibilityIcon,
  HospitalityIcon,
  KitchenIcon,
  ServicesIcon,
  ClipboardIcon,
} from "../WizardIcons/WizardIcons";

export const WIZARD_STEPS = [
  { path: "/questions/1", label: "أفراد الأسرة", Icon: FamilyIcon },
  { path: "/questions/2", label: "كبار السن وسهولة الحركة", Icon: AccessibilityIcon },
  { path: "/questions/3", label: "الضيافة والمجالس", Icon: HospitalityIcon },
  { path: "/questions/4", label: "المطبخ", Icon: KitchenIcon },
  { path: "/questions/5", label: "غرف الخدمات", Icon: ServicesIcon },
  { path: "/questions/6", label: "قائمة الفراغات النهائية", Icon: ClipboardIcon },
];
