export type LibraryTab = "alat-peraga" | "slide";

export type Subject = {
  name: string;
  icon: string;
};

export type Recommendation = {
  id: number;
  title: string;
  image: string;
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
  recommendations: Recommendation[];
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
    heroIllustration: "/images/topics/hero-alat-peraga.png",
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
    recommendations: [
      {
        id: 101,
        title: "Rumah Adat Nusantara",
        image: "/images/topics/ap-1.jpg",
        grade: "SD",
      },
      {
        id: 102,
        title: "Ngarai Sianok",
        image: "/images/topics/ap-2.jpg",
        grade: "SMP",
      },
      {
        id: 103,
        title: "Robot Sains Sederhana",
        image: "/images/topics/ap-3.jpg",
        grade: "6",
      },
      {
        id: 104,
        title: "Candi Prambanan",
        image: "/images/topics/ap-4.jpg",
        grade: "5",
      },
      {
        id: 105,
        title: "Monumen Nasional",
        image: "/images/topics/ap-5.jpg",
        grade: "4",
      },
      {
        id: 106,
        title: "Kisah Perang Badar",
        image: "/images/topics/ap-6.jpg",
        grade: "SMP",
      },
      {
        id: 107,
        title: "Kemudi & Sistem Kendaraan",
        image: "/images/topics/ap-7.jpg",
        grade: "7",
      },
      {
        id: 108,
        title: "Ekosistem Gurun",
        image: "/images/topics/ap-8.jpg",
        grade: "6",
      },
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
    heroIllustration: "/images/topics/hero-slide.png",
    subjects: [
      { name: "Literasi", icon: "📖" },
      { name: "Sains", icon: "🧬" },
      { name: "Matematika", icon: "√" },
      { name: "Pendidikan Pancasila", icon: "🦅" },
      { name: "Umum", icon: "⊞" },
    ],
    recommendations: [
      {
        id: 1,
        title: "Dampak Pembakaran pada Hidrokarbon",
        image: "/images/topics/topic-1.jpg",
        grade: "11",
      },
      {
        id: 2,
        title: "Isomer pada Hidrokarbon",
        image: "/images/topics/topic-2.jpg",
        grade: "11",
      },
      {
        id: 3,
        title: "Alkena dan Alkuna",
        image: "/images/topics/topic-3.jpg",
        grade: "11",
      },
      {
        id: 4,
        title: "Sifat Fisis dan Kimia Hidrokarbon",
        image: "/images/topics/topic-4.jpg",
        grade: "11",
      },
      {
        id: 5,
        title: "Alkana",
        image: "/images/topics/topic-5.jpg",
        grade: "11",
      },
      {
        id: 6,
        title: "Kekhasan Atom Karbon",
        image: "/images/topics/topic-6.jpg",
        grade: "11",
      },
      {
        id: 7,
        title: "Persen Hasil dan Kemurnian",
        image: "/images/topics/topic-7.jpg",
        grade: "11",
      },
      {
        id: 8,
        title: "Pereaksi Pembatas",
        image: "/images/topics/topic-8.jpg",
        grade: "11",
      },
      {
        id: 9,
        title: "3.4 Iritabilitas pada Tumbuhan",
        image: "/images/topics/topic-9.jpg",
        grade: "11",
      },
      {
        id: 10,
        title: "3.3 Reproduksi pada Tumbuhan",
        image: "/images/topics/topic-10.jpg",
        grade: "11",
      },
    ],
  },
};
