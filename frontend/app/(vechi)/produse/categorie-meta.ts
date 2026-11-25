// Metadate pentru paginile de produse pe categorie
// Importat atat de page.tsx (Server) cat si de clienti

export const CAT_META: Record<string, {
  label: string; emoji: string; desc: string; h1: string; keywords: string[];
}> = {
  fashion: {
    label: "Modă & Îmbrăcăminte",
    emoji: "👗",
    desc: "Haine, pantofi, genți și accesorii fashion la reducere. Cele mai bune oferte de modă online din România, actualizate zilnic.",
    h1: "Produse Fashion la Reducere",
    keywords: ["haine reducere românia", "pantofi reducere", "modă online reduceri", "fashion deals 2026"],
  },
  electronice: {
    label: "Electronice & IT",
    emoji: "💻",
    desc: "Telefoane, laptopuri, tablete, TV și gadgeturi la reducere. Oferte electronice actualizate zilnic din magazinele partenere.",
    h1: "Electronice & IT la Reducere",
    keywords: ["telefoane reducere românia", "laptop reducere", "electronice oferte", "it deals 2026"],
  },
  beauty: {
    label: "Frumusețe & Cosmetice",
    emoji: "💄",
    desc: "Parfumuri, skincare, makeup și produse de îngrijire la reducere. Oferte beauty din magazinele partenere, actualizate zilnic.",
    h1: "Produse Beauty la Reducere",
    keywords: ["cosmetice reducere românia", "parfumuri oferte", "skincare reduceri", "beauty deals"],
  },
  sport: {
    label: "Sport & Outdoor",
    emoji: "🏃",
    desc: "Echipamente sportive, biciclete, articole fitness și outdoor la reducere. Oferte sport din România, actualizate zilnic.",
    h1: "Articole Sport la Reducere",
    keywords: ["sport reducere românia", "echipamente sportive oferte", "fitness reduceri", "outdoor deals"],
  },
  casa: {
    label: "Casă & Grădină",
    emoji: "🏡",
    desc: "Mobilă, decorațiuni, unelte, electrocasnice și accesorii casă la reducere. Oferte pentru casa ta, actualizate zilnic.",
    h1: "Casă & Grădină la Reducere",
    keywords: ["mobilă reducere românia", "decorațiuni oferte", "casă grădină reduceri", "home deals"],
  },
  copii: {
    label: "Copii & Jucării",
    emoji: "🧸",
    desc: "Jucării, haine copii, cărucioare și accesorii bebeluși la reducere. Oferte pentru copii, actualizate zilnic.",
    h1: "Jucării & Produse Copii la Reducere",
    keywords: ["jucării reducere românia", "haine copii oferte", "bebeluși reduceri", "jucării deals"],
  },
  farmacie: {
    label: "Farmacie & Sănătate",
    emoji: "💊",
    desc: "Medicamente, suplimente, vitamine și produse naturale la reducere. Oferte farmacie online România, actualizate zilnic.",
    h1: "Produse Farmacie & Sănătate la Reducere",
    keywords: ["farmacie reducere românia", "suplimente oferte", "vitamine reduceri", "sănătate deals"],
  },
  carti: {
    label: "Cărți & Educație",
    emoji: "📚",
    desc: "Cărți, manuale, e-books și materiale educaționale la reducere. Oferte cărți din România, actualizate zilnic.",
    h1: "Cărți la Reducere",
    keywords: ["cărți reducere românia", "cărți online oferte", "librării reduceri", "books deals"],
  },
  auto: {
    label: "Auto & Moto",
    emoji: "🚗",
    desc: "Piese auto, accesorii mașină, anvelope și produse moto la reducere. Oferte auto din România, actualizate zilnic.",
    h1: "Produse Auto & Moto la Reducere",
    keywords: ["piese auto reducere românia", "accesorii mașină oferte", "anvelope reduceri", "auto deals"],
  },
  animale: {
    label: "Animale de Companie",
    emoji: "🐾",
    desc: "Hrană, accesorii și produse pentru câini, pisici și alte animale de companie la reducere din România.",
    h1: "Produse Animale de Companie la Reducere",
    keywords: ["hrană animale reducere", "accesorii câini oferte", "produse pisici reduceri"],
  },
  alimente: {
    label: "Alimente & Supermarket",
    emoji: "🛒",
    desc: "Alimente, băuturi, cafea, ceai și produse bio la reducere. Oferte supermarket online România, actualizate zilnic.",
    h1: "Alimente & Băuturi la Reducere",
    keywords: ["alimente reducere românia", "supermarket online oferte", "cafea reduceri", "food deals"],
  },
  bijuterii: {
    label: "Bijuterii & Accesorii",
    emoji: "💎",
    desc: "Inele, coliere, cercei, brățări și bijuterii din aur și argint la reducere. Oferte bijuterii din România.",
    h1: "Bijuterii la Reducere",
    keywords: ["bijuterii reducere românia", "inele oferte", "coliere reduceri", "jewelry deals"],
  },
  jocuri: {
    label: "Jocuri & Gaming",
    emoji: "🎮",
    desc: "Jocuri video, console, jocuri de societate și accesorii gaming la reducere. Oferte gaming România.",
    h1: "Jocuri & Gaming la Reducere",
    keywords: ["jocuri reducere românia", "gaming oferte", "console reduceri", "games deals"],
  },
  altele: {
    label: "Alte Categorii",
    emoji: "🛍️",
    desc: "Produse diverse la reducere din magazinele partenere AmCupon.ro, actualizate zilnic.",
    h1: "Produse Diverse la Reducere",
    keywords: ["reduceri diverse", "oferte diverse online", "produse reducere românia"],
  },
};
