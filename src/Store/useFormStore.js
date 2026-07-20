import { create } from "zustand";
import deedTemplate from "../../objects/format.json";

// Maps the UI answer values onto the backend JSON shape (objects/format.json).
const GUEST_RECEPTION = {
  independent: { type: "majlis_separate", label: "مجلس رجال بمدخل مستقل" },
  split: { type: "majlis_two", label: "مجلسان — رجال ونساء" },
  "living-room": { type: "living_room", label: "تكفي الصالة" },
};

const KITCHEN = {
  "مفتوح على الصالة": { type: "open", label: "مفتوح على الصالة" },
  مغلق: { type: "closed", label: "مغلق" },
  "مغلق + مطبخ تحضيري": { type: "closed_with_pantry", label: "مغلق + مطبخ تحضيري" },
};

// Q5 service chips -> additional_rooms flags.
const SERVICE_FLAGS = {
  "غسيل وكيّ": "laundry_room",
  "غرفة عاملة منزلية بحمّام": "maid_room",
  "غرفة سائق بحمّام": "driver_room",
  "مدخل خدمة مستقل": "maid_entrance",
  مستودع: "storage_room",
};

function countRange(total) {
  if (total <= 4) return "2-4";
  if (total <= 7) return "5-7";
  if (total <= 10) return "8-10";
  return "10+";
}

export const useFormStore = create((set, get) => ({
  // Static deed data (mock; replaced by backend OCR later).
  deed: deedTemplate,

  // Raw JSON extracted by Gemini from the uploaded deed image.
  extractedDeedRaw: null,
  setExtractedDeedRaw: (data) => set({ extractedDeedRaw: data }),

  // Plot dimensions in metres. Always required before leaving the deed step —
  // the deed doesn't always carry explicit width/height, so the user must
  // confirm/enter both (see ConfirmData + ExtractionFailed).
  landDimensions: { width: "", height: "" },
  setLandDimensions: (landDimensions) => set({ landDimensions }),

  // GPS coordinates extracted from QR codes. Required before proceeding.
  landCoordinates: { lat: "", lng: "" },
  setLandCoordinates: (landCoordinates) => set({ landCoordinates }),

  // Plot orientation in degrees (0 = north-up), set via the rotation handle
  // on the map picker. Purely visual — lets the drawn rectangle match the
  // plot's real-world orientation instead of always being axis-aligned.
  landRotation: 0,
  setLandRotation: (landRotation) => set({ landRotation }),

  // 2D floor plan image (generated externally, uploaded to Cloudinary — see
  // src/lib/cloudinary.js). Null until one has been generated/uploaded, in
  // which case the Result page shows this image instead of the placeholder
  // room-block grid.
  planImageUrl: null,
  setPlanImageUrl: (planImageUrl) => set({ planImageUrl }),

  // Collected answers (UI-friendly form).
  familyMembers: { adults: 4, children: 3 },
  hasElderly: true,
  guestReceptionId: "independent",
  kitchenType: "مغلق + مطبخ تحضيري",
  services: ["غرفة عاملة منزلية بحمّام", "غرفة سائق بحمّام"],
  roomCatalog: {
    master: 1,
    bedroom: 3,
    bathroom: 2,
    closet: 1,
    living: 1,
    kitchen: 1,
    prepKitchen: 1,
    majlis: 1,
    dining: 1,
    guestBath: 1,
    driver: 1,
    laundry: 1,
    storage: 0,
  },

  setFamilyMembers: (familyMembers) => set({ familyMembers }),
  setHasElderly: (hasElderly) => set({ hasElderly }),
  setGuestReceptionId: (guestReceptionId) => set({ guestReceptionId }),
  setKitchenType: (kitchenType) => set({ kitchenType }),
  setServices: (services) => set({ services }),
  setRoomCount: (id, count) =>
    set((state) => ({ roomCatalog: { ...state.roomCatalog, [id]: count } })),

  // Snapshot of everything needed to resume a session later — saved as-is
  // into the `projects.payload` jsonb column (see src/Pages/Projects).
  snapshotForSave: () => {
    const state = get();
    return {
      extractedDeedRaw: state.extractedDeedRaw,
      landDimensions: state.landDimensions,
      landCoordinates: state.landCoordinates,
      landRotation: state.landRotation,
      planImageUrl: state.planImageUrl,
      familyMembers: state.familyMembers,
      hasElderly: state.hasElderly,
      guestReceptionId: state.guestReceptionId,
      kitchenType: state.kitchenType,
      services: state.services,
      roomCatalog: state.roomCatalog,
    };
  },

  // Inverse of snapshotForSave — restores a saved project back into the
  // live form store so the wizard/result pages pick it back up.
  restoreFromSnapshot: (snapshot) => set({ ...snapshot }),

  // Assemble the full payload in the backend JSON shape.
  buildPayload: () => {
    const state = get();
    const { adults, children } = state.familyMembers;
    const total = adults + children;

    const additionalRooms = {
      laundry_room: false,
      maid_room: false,
      maid_entrance: false,
      storage_room: false,
      driver_room: false,
    };
    state.services.forEach((service) => {
      const flag = SERVICE_FLAGS[service];
      if (flag) additionalRooms[flag] = true;
    });

    return {
      ...state.deed,
      land_dimensions: {
        width_m: Number(state.landDimensions.width) || null,
        height_m: Number(state.landDimensions.height) || null,
      },
      family_preferences: {
        family_members: {
          count_range: countRange(total),
          estimated_count: total,
        },
        elderly_or_accessibility: { has_elderly: state.hasElderly },
        bedrooms: { count: state.roomCatalog.bedroom + state.roomCatalog.master },
        master_bedrooms: { count: state.roomCatalog.master },
        guest_reception: GUEST_RECEPTION[state.guestReceptionId],
        kitchen: KITCHEN[state.kitchenType],
        additional_rooms: additionalRooms,
        room_catalog: state.roomCatalog,
      },
    };
  },
}));
