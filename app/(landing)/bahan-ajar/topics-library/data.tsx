export type LibraryTab = "alat-peraga" | "slide";

export type Subject = {
  name: string;
  icon: string;
};

export type Recommendation = {
  id: number;
  title: string;
  image: string;
  embedUrl: string | null;
  grade: string;
};

export type TabContent = {
  /** Label yang tampil di pill/tag hero */
  tagLabel: string;
  /** Tailwind gradient classes untuk background hero */
  heroBg: string;
  heroHeadline: {
    prefix: string;
    highlight: string;
    suffix: string;
  };
  heroIllustration: string;
  subjects: Subject[];
};

// Grade/kelas sama untuk kedua tab, jadi tidak perlu diduplikasi
export const GRADES = [
  "Prasekolah",
  "TK A",
  "TK B",
  "SD",
  "Kelas 1",
  "Kelas 2",
  "Kelas 3",
  "Kelas 4",
  "Kelas 5",
  "Kelas 6",
  "Kelas 7",
  "Kelas 8",
  "Kelas 9",
  "Kelas 10",
  "Kelas 11",
  "Kelas 12",
];

// Urutan tab di hero (kiri ke kanan)
export const TAB_ORDER: LibraryTab[] = ["alat-peraga", "slide"];

export const TAB_CONTENT: Record<LibraryTab, TabContent> = {
  "alat-peraga": {
    tagLabel: "Aset Belajar",
    heroBg: "from-[#bfe9fb] to-[#eaf7fd]",
    heroHeadline: {
      prefix: "Jadikan aktivitas belajar lebih seru dengan ",
      highlight: "Aset Belajar 3D",
      suffix: " dan Augmented Reality",
    },
    // TODO: ganti dengan gambar asli di /public/images/topics/hero-alat-peraga.png
    heroIllustration: "https://picsum.photos/seed/alat-peraga/960/600",
    subjects: [
      { name: "Literasi", icon: "📖" },
      { name: "Sains", icon: "🧬" },
      { name: "Matematika", icon: "√" },
      { name: "Sosial", icon: "🧑‍🤝‍🧑" },
      { name: "Olah Raga & Seni", icon: "🏃" },
      { name: "Pendidikan Pancasila", icon: "🦅" },
      { name: "Kejuruan", icon: "🛠️" },
      { name: "Umum", icon: "⊞" },
    ],
  },
  slide: {
    tagLabel: "Slide Interaktif",
    heroBg: "from-[#fbe7ab] to-[#fdf3d6]",
    heroHeadline: {
      prefix: "Hemat waktu dengan ",
      highlight: "Slide Learning",
      suffix: " Interaktif siap pakai",
    },
    // TODO: ganti dengan gambar asli di /public/images/topics/hero-slide.png
    heroIllustration: "https://picsum.photos/seed/slide-learning/960/600",
    subjects: [
      { name: "Literasi", icon: "📖" },
      { name: "Sains", icon: "🧬" },
      { name: "Matematika", icon: "√" },
      { name: "Pendidikan Pancasila", icon: "🦅" },
      { name: "Umum", icon: "⊞" },
    ],
  },
};