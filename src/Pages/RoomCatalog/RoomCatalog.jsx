import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../../Components/Navbar/Navbar";
import Button from "../../Components/Button/Button";
import Stepper from "../../Components/Stepper/Stepper";
import { useFormStore } from "../../Store/useFormStore";
import { useSlideDirection } from "../../Components/QuestionLayout/SlideDirectionContext";
import { slideVariants, slideTransition } from "../../Components/QuestionLayout/slideVariants";
import "./RoomCatalog.css";

const CATEGORIES = [
  {
    title: "غرف النوم والحمامات",
    rooms: [
      { id: "master", label: "غرفة نوم رئيسية – ماستر" },
      { id: "bedroom", label: "غرفة نوم" },
      { id: "bathroom", label: "حمام" },
      { id: "closet", label: "غرفة ملابس", auto: true },
    ],
  },
  {
    title: "المعيشة",
    rooms: [
      { id: "living", label: "صالة للعيشة" },
      { id: "kitchen", label: "مطبخ رئيسي" },
      { id: "prepKitchen", label: "مطبخ تحضيري", auto: true },
    ],
  },
  {
    title: "الضيافة",
    rooms: [
      { id: "majlis", label: "مجلس رجال" },
      { id: "dining", label: "مقطع طعام", auto: true },
      { id: "guestBath", label: "حمام ومغاسل ضيوف", auto: true },
    ],
  },
  {
    title: "الخدمات",
    rooms: [
      { id: "driver", label: "غرفة سائق بحمّام" },
      { id: "laundry", label: "غسيل وكيّ" },
      { id: "storage", label: "مستودع" },
    ],
  },
];

const SUMMARY_TAGS = [
  { label: "رئيسية · 28م²", color: "pink" },
  { label: "نوم 2 · 16م²", color: "green" },
  { label: "نوم 3 · 16م²", color: "green" },
  { label: "نوم 4 · 14م²", color: "green" },
  { label: "حمام رئيسي · 8م²", color: "purple" },
  { label: "حمام · 6م²", color: "purple" },
  { label: "ملابس · 6م²", color: "pink" },
  { label: "صالة · 38م²", color: "gray" },
  { label: "مطبخ · 20م²", color: "yellow" },
  { label: "تحضيري · 8م²", color: "yellow" },
  { label: "مجلس · 30م²", color: "blue" },
  { label: "مقطع طعام · 16م²", color: "blue" },
  { label: "حمام ضيوف · 5م²", color: "purple" },
  { label: "غسيل · 8م²", color: "gray" },
];

export default function RoomCatalog() {
  const navigate = useNavigate();
  const counts = useFormStore((state) => state.roomCatalog);
  const setRoomCount = useFormStore((state) => state.setRoomCount);

  const totalRooms = Object.values(counts).reduce((sum, value) => sum + value, 0);
  const direction = useSlideDirection();

  return (
    <motion.div
      className="page page--carousel"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slideTransition}
    >
      <Navbar />
      <main className="room-catalog">
        <h1 className="room-catalog__title">
          فراغات بيتك — عبّأناها من إجاباتك، عدّل ما تشاء
        </h1>
        <p className="room-catalog__subtitle">
          كل تغيير ينعكس فورًا على الحجم — وسنراقب لك المساحة مقابل أرضك
        </p>

        <div className="room-catalog__layout">
          <section className="room-catalog__catalog">
            <h2 className="room-catalog__section-title">كتالوج الفراغات</h2>
            {CATEGORIES.map((category) => (
              <div className="room-catalog__group" key={category.title}>
                <p className="room-catalog__group-title">{category.title}</p>
                {category.rooms.map((room) => (
                  <Stepper
                    key={room.id}
                    label={room.label}
                    value={counts[room.id]}
                    onChange={(value) => setRoomCount(room.id, value)}
                    badge={room.auto ? "تلقائي" : undefined}
                  />
                ))}
              </div>
            ))}
          </section>

          <aside className="room-catalog__summary">
            <div className="room-catalog__summary-header">
              <h2 className="room-catalog__section-title">فراغات بيتك</h2>
              <span className="room-catalog__count">{totalRooms} فراغًا</span>
            </div>

            <div className="room-catalog__tags">
              {SUMMARY_TAGS.map((tag) => (
                <span key={tag.label} className={`room-catalog__tag room-catalog__tag--${tag.color}`}>
                  {tag.label}
                </span>
              ))}
            </div>

            <p className="room-catalog__banner">
              231م² من 60% مساحة البناء المسموحة — يناسب أرضك (2,892م²) بارتياح ✓
            </p>

            <Button fullWidth onClick={() => navigate("/generating")}>
              ابدأ تصميم مخططي ←
            </Button>
          </aside>
        </div>
      </main>
    </motion.div>
  );
}
