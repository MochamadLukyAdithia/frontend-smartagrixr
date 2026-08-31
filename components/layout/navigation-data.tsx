export type MenuIcon =
  | "cloud"
  | "folder"
  | "book"
  | "plus"
  | "background"
  | "cube"
  | "gallery"
  | "template"
  | "idea"
  | "class"
  | "new-class"
  | "join";

export interface DropdownItem {
  label: string;
  description: string;
  href: string;
  icon: MenuIcon;
}

export interface NavigationItem {
  label: string;
  href: string;
  dropdown?: {
    items: DropdownItem[];
    hasPreview?: boolean;
    align?: "left" | "right";
  };
}

export const navigationItems: NavigationItem[] = [
  {
    label: "Beranda",
    href: "/",
  },
  {
    label: "Bahan Ajar",
    href: "#bahan-ajar",
    dropdown: {
      hasPreview: true,
      align: "left",
      items: [
        {
          label: "Topik",
          description: "Belajar lebih menarik dengan slide interaktif",
          href: "/bahan-ajar/topics-library",
          icon: "cloud",
        },
        {
          label: "Asset Belajar",
          description: "Buat aset belajar 3d dan Ar kamu sendiri",
          href: "#materi-saya",
          icon: "book",
        },
      ],
    },
  },
  {
    label: "Editor",
    href: "/editor",
    dropdown: {
      hasPreview: true,
      align: "left",
      items: [
        {
          label: "Buat Project Baru",
          description: "Buat project SmartAgriXrmu sendiri",
          href: "/editor",
          icon: "plus",
        },
        {
          label: "Marker Kustom",
          description: "Buat marker kustom untuk project kamu",
          href: "/editor",
          icon: "background",
        },
        {
          label: "Objek 3D Saya",
          description: "Lihat semua objek 3D yang sudah kamu buat",
          href: "/editor",
          icon: "cube",
        },
      ],
    },
  },
  {
    label: "Kelas",
    href: "#kelas",
    dropdown: {
      align: "left",
      items: [
        {
          label: "Kelas Saya",
          description: "Lihat dan kelola daftar kelas",
          href: "#kelas-saya",
          icon: "class",
        },
        {
          label: "Buat Kelas Baru",
          description: "Buka ruang kelas baru dan undang siswa untuk belajar bersama",
          href: "#buat-kelas",
          icon: "new-class",
        },
        {
          label: "Gabung ke Kelas",
          description: "Gabung ke kelas yang sudah ada",
          href: "#gabung-kelas",
          icon: "join",
        },
      ],
    },
  },
  {
    label: "Tutorial",
    href: "#inspirasi",
   
  },
];
