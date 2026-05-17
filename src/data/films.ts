export interface FilmEntry {
  id: string;
  name: string;
  brand: string;
  iso: number;
  process: "C-41" | "ECN-2" | "B&W" | "E-6" | "기타";
  formats: Array<"135" | "120" | "4x5" | "8x10">;
  aliases?: string[];
  discontinued?: boolean;
}

// ── 추가 방법 ────────────────────────────────────────────────────────────────
// aliases 배열에 한국어 검색어(별명, 속칭 등)를 자유롭게 추가해주세요.
// 예: "울맥", "골드", "트라이엑스" 등
// ─────────────────────────────────────────────────────────────────────────────

export const FILMS: FilmEntry[] = [
  // ── Kodak 컬러 ──────────────────────────────────────────────────────────────
  {
    id: "kodak-portra-160",
    name: "Kodak Portra 160",
    brand: "Kodak",
    iso: 160,
    process: "C-41",
    formats: ["135", "120"],
    aliases: ["포르트라160", "포르160", "portra160"],
  },
  {
    id: "kodak-portra-400",
    name: "Kodak Portra 400",
    brand: "Kodak",
    iso: 400,
    process: "C-41",
    formats: ["135", "120"],
    aliases: ["포르트라400", "포르트라", "포르400", "portra400", "portra"],
  },
  {
    id: "kodak-portra-800",
    name: "Kodak Portra 800",
    brand: "Kodak",
    iso: 800,
    process: "C-41",
    formats: ["135", "120"],
    aliases: ["포르트라800", "포르800", "portra800"],
  },
  {
    id: "kodak-gold-100",
    name: "Kodak Gold 100",
    brand: "Kodak",
    iso: 100,
    process: "C-41",
    formats: ["135"],
    aliases: ["골드100", "gold100"],
    discontinued: true,
  },
  {
    id: "kodak-gold-200",
    name: "Kodak Gold 200",
    brand: "Kodak",
    iso: 200,
    process: "C-41",
    formats: ["135"],
    aliases: ["골드", "골드200", "코닥골드", "gold200"],
  },
  {
    id: "kodak-ultramax-400",
    name: "Kodak Ultramax 400",
    brand: "Kodak",
    iso: 400,
    process: "C-41",
    formats: ["135"],
    aliases: ["울맥", "울트라맥스", "울맥400", "ultramax", "ultramax400"],
  },
  {
    id: "kodak-colorplus-200",
    name: "Kodak ColorPlus 200",
    brand: "Kodak",
    iso: 200,
    process: "C-41",
    formats: ["135"],
    aliases: ["칼플", "컬러플러스", "colorplus"],
  },
  {
    id: "kodak-ektar-100",
    name: "Kodak Ektar 100",
    brand: "Kodak",
    iso: 100,
    process: "C-41",
    formats: ["135", "120"],
    aliases: ["엑타100", "엑타", "ektar"],
  },
  // ── Kodak 흑백 ──────────────────────────────────────────────────────────────
  {
    id: "kodak-tmax-100",
    name: "Kodak T-Max 100",
    brand: "Kodak",
    iso: 100,
    process: "B&W",
    formats: ["135", "120"],
    aliases: ["티맥스100", "tmax100"],
  },
  {
    id: "kodak-tmax-400",
    name: "Kodak T-Max 400",
    brand: "Kodak",
    iso: 400,
    process: "B&W",
    formats: ["135", "120"],
    aliases: ["티맥스400", "티맥스", "tmax400", "tmax"],
  },
  {
    id: "kodak-tmax-3200",
    name: "Kodak T-Max P3200",
    brand: "Kodak",
    iso: 3200,
    process: "B&W",
    formats: ["135"],
    aliases: ["티맥스3200", "P3200"],
  },
  {
    id: "kodak-tri-x-400",
    name: "Kodak Tri-X 400",
    brand: "Kodak",
    iso: 400,
    process: "B&W",
    formats: ["135", "120"],
    aliases: ["트라이엑스", "트라이X", "trix", "tri-x"],
  },
  // ── Kodak 시네마 (ECN-2) ─────────────────────────────────────────────────────
  {
    id: "kodak-vision3-50d",
    name: "Kodak Vision3 50D",
    brand: "Kodak",
    iso: 50,
    process: "ECN-2",
    formats: ["135"],
    aliases: ["비전3 50D", "vision3-50d", "50D"],
  },
  {
    id: "kodak-vision3-250d",
    name: "Kodak Vision3 250D",
    brand: "Kodak",
    iso: 250,
    process: "ECN-2",
    formats: ["135"],
    aliases: ["비전3 250D", "250D"],
  },
  {
    id: "kodak-vision3-500t",
    name: "Kodak Vision3 500T",
    brand: "Kodak",
    iso: 500,
    process: "ECN-2",
    formats: ["135"],
    aliases: ["비전3 500T", "500T"],
  },
  // ── Kodak 슬라이드 ──────────────────────────────────────────────────────────
  {
    id: "kodak-ektachrome-e100",
    name: "Kodak Ektachrome E100",
    brand: "Kodak",
    iso: 100,
    process: "E-6",
    formats: ["135", "120"],
    aliases: ["엑타크롬", "E100"],
  },

  // ── Fujifilm 컬러 ────────────────────────────────────────────────────────────
  {
    id: "fuji-superia-100",
    name: "Fujifilm Superia 100",
    brand: "Fujifilm",
    iso: 100,
    process: "C-41",
    formats: ["135"],
    aliases: ["수페리아100", "슈퍼리아100"],
    discontinued: true,
  },
  {
    id: "fuji-superia-200",
    name: "Fujifilm Superia 200",
    brand: "Fujifilm",
    iso: 200,
    process: "C-41",
    formats: ["135"],
    aliases: ["수페리아200", "슈퍼리아200", "수페리아", "슈퍼리아"],
  },
  {
    id: "fuji-superia-400",
    name: "Fujifilm Superia 400",
    brand: "Fujifilm",
    iso: 400,
    process: "C-41",
    formats: ["135"],
    aliases: ["수페리아400", "슈퍼리아400"],
  },
  {
    id: "fuji-superia-x-tra-400",
    name: "Fujifilm Superia X-TRA 400",
    brand: "Fujifilm",
    iso: 400,
    process: "C-41",
    formats: ["135"],
    aliases: ["수페리아엑스트라", "xtra400"],
  },
  {
    id: "fuji-pro-400h",
    name: "Fujifilm Pro 400H",
    brand: "Fujifilm",
    iso: 400,
    process: "C-41",
    formats: ["135", "120"],
    aliases: ["프로400H", "pro400h"],
    discontinued: true,
  },
  {
    id: "fuji-200",
    name: "Fujifilm 200",
    brand: "Fujifilm",
    iso: 200,
    process: "C-41",
    formats: ["135"],
    aliases: ["후지200"],
  },
  // ── Fujifilm 흑백 ────────────────────────────────────────────────────────────
  {
    id: "fuji-neopan-acros-ii",
    name: "Fujifilm Neopan Acros II 100",
    brand: "Fujifilm",
    iso: 100,
    process: "B&W",
    formats: ["135", "120"],
    aliases: ["아크로스", "아크로스II", "네오판", "acros", "acros2"],
  },
  // ── Fujifilm 슬라이드 ────────────────────────────────────────────────────────
  {
    id: "fuji-velvia-50",
    name: "Fujifilm Velvia 50",
    brand: "Fujifilm",
    iso: 50,
    process: "E-6",
    formats: ["135", "120"],
    aliases: ["벨비아50", "벨비아", "velvia50", "velvia"],
  },
  {
    id: "fuji-velvia-100",
    name: "Fujifilm Velvia 100",
    brand: "Fujifilm",
    iso: 100,
    process: "E-6",
    formats: ["135", "120"],
    aliases: ["벨비아100", "velvia100"],
  },
  {
    id: "fuji-provia-100f",
    name: "Fujifilm Provia 100F",
    brand: "Fujifilm",
    iso: 100,
    process: "E-6",
    formats: ["135", "120"],
    aliases: ["프로비아", "provia", "provia100f"],
  },
  {
    id: "fuji-astia-100f",
    name: "Fujifilm Astia 100F",
    brand: "Fujifilm",
    iso: 100,
    process: "E-6",
    formats: ["135"],
    aliases: ["아스티아"],
    discontinued: true,
  },

  // ── Ilford 흑백 ──────────────────────────────────────────────────────────────
  {
    id: "ilford-pan-f-50",
    name: "Ilford Pan F Plus 50",
    brand: "Ilford",
    iso: 50,
    process: "B&W",
    formats: ["135", "120"],
    aliases: ["팬F", "panf", "pan-f"],
  },
  {
    id: "ilford-fp4-125",
    name: "Ilford FP4 Plus 125",
    brand: "Ilford",
    iso: 125,
    process: "B&W",
    formats: ["135", "120"],
    aliases: ["FP4", "fp4"],
  },
  {
    id: "ilford-hp5-400",
    name: "Ilford HP5 Plus 400",
    brand: "Ilford",
    iso: 400,
    process: "B&W",
    formats: ["135", "120"],
    aliases: ["HP5", "hp5", "아일포드HP5", "아일포드"],
  },
  {
    id: "ilford-delta-100",
    name: "Ilford Delta 100",
    brand: "Ilford",
    iso: 100,
    process: "B&W",
    formats: ["135", "120"],
    aliases: ["델타100"],
  },
  {
    id: "ilford-delta-400",
    name: "Ilford Delta 400",
    brand: "Ilford",
    iso: 400,
    process: "B&W",
    formats: ["135", "120"],
    aliases: ["델타400"],
  },
  {
    id: "ilford-delta-3200",
    name: "Ilford Delta 3200",
    brand: "Ilford",
    iso: 3200,
    process: "B&W",
    formats: ["135", "120"],
    aliases: ["델타3200"],
  },
  {
    id: "ilford-sfx-200",
    name: "Ilford SFX 200",
    brand: "Ilford",
    iso: 200,
    process: "B&W",
    formats: ["135"],
    aliases: ["SFX", "sfx200"],
  },
  {
    id: "ilford-xp2-400",
    name: "Ilford XP2 Super 400",
    brand: "Ilford",
    iso: 400,
    process: "C-41",
    formats: ["135"],
    aliases: ["XP2", "xp2"],
  },

  // ── CineStill (C-41) ─────────────────────────────────────────────────────────
  {
    id: "cinestill-50d",
    name: "CineStill 50D",
    brand: "CineStill",
    iso: 50,
    process: "C-41",
    formats: ["135", "120"],
    aliases: ["씨네스틸50D", "씨네스틸50"],
  },
  {
    id: "cinestill-400d",
    name: "CineStill 400D",
    brand: "CineStill",
    iso: 400,
    process: "C-41",
    formats: ["135"],
    aliases: ["씨네스틸400D", "씨네스틸400"],
  },
  {
    id: "cinestill-800t",
    name: "CineStill 800T",
    brand: "CineStill",
    iso: 800,
    process: "C-41",
    formats: ["135", "120"],
    aliases: ["씨네스틸800T", "씨네스틸800", "씨네스틸"],
  },

  // ── Lomography ───────────────────────────────────────────────────────────────
  {
    id: "lomo-color-400",
    name: "Lomography Color Negative 400",
    brand: "Lomography",
    iso: 400,
    process: "C-41",
    formats: ["135", "120"],
    aliases: ["로모400", "로모컬러400"],
  },
  {
    id: "lomo-color-800",
    name: "Lomography Color Negative 800",
    brand: "Lomography",
    iso: 800,
    process: "C-41",
    formats: ["135"],
    aliases: ["로모800", "로모컬러800"],
  },
  {
    id: "lomo-berlin-kino",
    name: "Lomography Berlin Kino B&W 400",
    brand: "Lomography",
    iso: 400,
    process: "B&W",
    formats: ["135"],
    aliases: ["베를린키노", "berlin kino"],
  },

  // ── AgfaPhoto ────────────────────────────────────────────────────────────────
  {
    id: "agfa-vista-200",
    name: "AgfaPhoto Vista 200",
    brand: "AgfaPhoto",
    iso: 200,
    process: "C-41",
    formats: ["135"],
    aliases: ["아그파200", "비스타200"],
    discontinued: true,
  },
  {
    id: "agfa-vista-400",
    name: "AgfaPhoto Vista 400",
    brand: "AgfaPhoto",
    iso: 400,
    process: "C-41",
    formats: ["135"],
    aliases: ["아그파400", "비스타400"],
    discontinued: true,
  },
  {
    id: "agfa-photo-200",
    name: "AgfaPhoto 200",
    brand: "AgfaPhoto",
    iso: 200,
    process: "C-41",
    formats: ["135"],
    aliases: ["아그파사진200"],
  },

  // ── Fomapan (흑백) ──────────────────────────────────────────────────────────
  {
    id: "fomapan-100",
    name: "Fomapan 100",
    brand: "Foma",
    iso: 100,
    process: "B&W",
    formats: ["135", "120"],
    aliases: ["포마판100", "foma100"],
  },
  {
    id: "fomapan-200",
    name: "Fomapan 200",
    brand: "Foma",
    iso: 200,
    process: "B&W",
    formats: ["135", "120"],
    aliases: ["포마판200"],
  },
  {
    id: "fomapan-400",
    name: "Fomapan 400",
    brand: "Foma",
    iso: 400,
    process: "B&W",
    formats: ["135", "120"],
    aliases: ["포마판400"],
  },

  // ── Rollei ──────────────────────────────────────────────────────────────────
  {
    id: "rollei-retro-80s",
    name: "Rollei Retro 80S",
    brand: "Rollei",
    iso: 80,
    process: "B&W",
    formats: ["135", "120"],
    aliases: ["롤라이레트로80S"],
  },
  {
    id: "rollei-cr200",
    name: "Rollei CR200",
    brand: "Rollei",
    iso: 200,
    process: "E-6",
    formats: ["135", "120"],
    aliases: ["롤라이CR200"],
  },
];

// 필름명 + 별명으로 검색
export function searchFilms(query: string): FilmEntry[] {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase().replace(/\s+/g, "");
  return FILMS.filter((film) => {
    const name = film.name.toLowerCase().replace(/\s+/g, "");
    const brand = film.brand.toLowerCase();
    const aliases = (film.aliases ?? []).map((a) => a.toLowerCase().replace(/\s+/g, ""));
    return (
      name.includes(q) ||
      brand.includes(q) ||
      aliases.some((a) => a.includes(q)) ||
      String(film.iso).startsWith(q)
    );
  }).slice(0, 8);
}
