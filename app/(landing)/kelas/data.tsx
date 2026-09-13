export type KelasItem = {
  id: string;
  name: string;
  /** Warna sampul kartu, hex */
  color: string;
  /** Tampilkan pola dekoratif (doodle) di kartu, seperti kartu "Teknologi" */
  decorated?: boolean;
};

// Palet warna sampul yang bisa dipilih saat membuat kelas baru
export const CLASS_COLORS = [
  "#ec4899", // pink
  "#7f1d3f", // maroon
  "#0f766e", // teal
  "#21a447", // hijau brand
  "#1d4ed8", // biru
  "#b45309", // amber tua
];

export const INITIAL_CLASSES: KelasItem[] = [
  {
    id: "kelas-pertanian-cerdas",
    name: "Kelas Pertanian Cerdas",
    color: "#ec4899",
  },
  {
    id: "teknologi",
    name: "Teknologi",
    color: "#7f1d3f",
    decorated: true,
  },
];