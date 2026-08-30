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
          label: "Topics Library",
          description: "Lorem ipsum lorem ipsum lorem ip.",
          href: "/bahan-ajar/topics-library",
          icon: "cloud",
        },
        {
          label: "Edu Kits & Sticky Annotation",
          description: "Lorem ipsum lorem ipsum lorem ip.",
          href: "#edu-kits",
          icon: "folder",
        },
        {
          label: "Materi Saya",
          description: "Lorem ipsum lorem ipsum lorem ip.",
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
          description: "Lorem ipsum lorem ipsum lorem ip.",
          href: "/editor/buat-project",
          icon: "plus",
        },
        {
          label: "HDRI Background",
          description: "Lorem ipsum lorem ipsum lorem ip.",
          href: "/editor",
          icon: "background",
        },
        {
          label: "Objek 3D Saya",
          description: "Lorem ipsum lorem ipsum lorem ip.",
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
          description: "Lorem ipsum lorem ipsum lorem ip.",
          href: "#kelas-saya",
          icon: "class",
        },
        {
          label: "Buat Kelas Baru",
          description: "Lorem ipsum lorem ipsum lorem ip.",
          href: "#buat-kelas",
          icon: "new-class",
        },
        {
          label: "Gabung ke Kelas",
          description: "Lorem ipsum lorem ipsum lorem ip.",
          href: "#gabung-kelas",
          icon: "join",
        },
      ],
    },
  },
  {
    label: "Inspirasi",
    href: "#inspirasi",
    dropdown: {
      align: "right",
      items: [
        {
          label: "Galeri Showcase",
          description: "Lorem ipsum lorem ipsum lorem ip.",
          href: "#galeri",
          icon: "gallery",
        },
        {
          label: "Template Populer",
          description: "Lorem ipsum lorem ipsum lorem ip.",
          href: "#template",
          icon: "template",
        },
        {
          label: "Tutorial & Tips",
          description: "Lorem ipsum lorem ipsum lorem ip.",
          href: "#tutorial",
          icon: "idea",
        },
      ],
    },
  },
];
