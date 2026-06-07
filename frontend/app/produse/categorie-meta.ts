// Metadate pentru paginile de produse pe categorie
// Importat atat de page.tsx (Server) cat si de clienti

export const CAT_META: Record<string, {
  label: string; emoji: string; desc: string; h1: string; keywords: string[];
}> = {
  fashion: {
    label: "Moda & Imbracaminte",
    emoji: "👗",
    desc: "Haine, pantofi, genti si accesorii fashion la reducere. Cele mai bune oferte de moda online din Romania, actualizate zilnic.",
    h1: "Produse Fashion la Reducere",
    keywords: ["haine reducere romania", "pantofi reducere", "moda online reduceri", "fashion deals 2026"],
  },
  electronice: {
    label: "Electronice & IT",
    emoji: "💻",
    desc: "Telefoane, laptopuri, tablete, TV si gadgeturi la reducere. Oferte electronice verificate zilnic din magazinele partenere.",
    h1: "Electronice & IT la Reducere",
    keywords: ["telefoane reducere romania", "laptop reducere", "electronice oferte", "it deals 2026"],
  },
  beauty: {
    label: "Frumusete & Cosmetice",
    emoji: "💄",
    desc: "Parfumuri, skincare, makeup si produse de ingrijire la reducere. Oferte beauty din magazinele partenere, verificate zilnic.",
    h1: "Produse Beauty la Reducere",
    keywords: ["cosmetice reducere romania", "parfumuri oferte", "skincare reduceri", "beauty deals"],
  },
  sport: {
    label: "Sport & Outdoor",
    emoji: "🏃",
    desc: "Echipamente sportive, biciclete, articole fitness si outdoor la reducere. Oferte sport din Romania, actualizate zilnic.",
    h1: "Articole Sport la Reducere",
    keywords: ["sport reducere romania", "echipamente sportive oferte", "fitness reduceri", "outdoor deals"],
  },
  casa: {
    label: "Casa & Gradina",
    emoji: "🏡",
    desc: "Mobila, decoratiuni, unelte, electrocasnice si accesorii casa la reducere. Oferte pentru casa ta, actualizate zilnic.",
    h1: "Casa & Gradina la Reducere",
    keywords: ["mobila reducere romania", "decoratiuni oferte", "casa gradina reduceri", "home deals"],
  },
  copii: {
    label: "Copii & Jucarii",
    emoji: "🧸",
    desc: "Jucarii, haine copii, carucioare si accesorii bebelusi la reducere. Oferte pentru copii, verificate zilnic.",
    h1: "Jucarii & Produse Copii la Reducere",
    keywords: ["jucarii reducere romania", "haine copii oferte", "bebelusi reduceri", "jucarii deals"],
  },
  farmacie: {
    label: "Farmacie & Sanatate",
    emoji: "💊",
    desc: "Medicamente, suplimente, vitamine si produse naturale la reducere. Oferte farmacie online Romania, verificate zilnic.",
    h1: "Produse Farmacie & Sanatate la Reducere",
    keywords: ["farmacie reducere romania", "suplimente oferte", "vitamine reduceri", "sanatate deals"],
  },
  carti: {
    label: "Carti & Educatie",
    emoji: "📚",
    desc: "Carti, manuale, e-books si materiale educationale la reducere. Oferte carti din Romania, actualizate zilnic.",
    h1: "Carti la Reducere",
    keywords: ["carti reducere romania", "carti online oferte", "librarii reduceri", "books deals"],
  },
  auto: {
    label: "Auto & Moto",
    emoji: "🚗",
    desc: "Piese auto, accesorii masina, anvelope si produse moto la reducere. Oferte auto din Romania, actualizate zilnic.",
    h1: "Produse Auto & Moto la Reducere",
    keywords: ["piese auto reducere romania", "accesorii masina oferte", "anvelope reduceri", "auto deals"],
  },
  animale: {
    label: "Animale de Companie",
    emoji: "🐾",
    desc: "Hrana, accesorii si produse pentru caini, pisici si alte animale de companie la reducere din Romania.",
    h1: "Produse Animale de Companie la Reducere",
    keywords: ["hrana animale reducere", "accesorii caini oferte", "produse pisici reduceri"],
  },
  alimente: {
    label: "Alimente & Supermarket",
    emoji: "🛒",
    desc: "Alimente, bauturi, cafea, ceai si produse bio la reducere. Oferte supermarket online Romania, verificate zilnic.",
    h1: "Alimente & Bauturi la Reducere",
    keywords: ["alimente reducere romania", "supermarket online oferte", "cafea reduceri", "food deals"],
  },
  bijuterii: {
    label: "Bijuterii & Accesorii",
    emoji: "💎",
    desc: "Inele, coliere, cercei, bratari si bijuterii din aur si argint la reducere. Oferte bijuterii din Romania.",
    h1: "Bijuterii la Reducere",
    keywords: ["bijuterii reducere romania", "inele oferte", "coliere reduceri", "jewelry deals"],
  },
  jocuri: {
    label: "Jocuri & Gaming",
    emoji: "🎮",
    desc: "Jocuri video, console, jocuri de societate si accesorii gaming la reducere. Oferte gaming Romania.",
    h1: "Jocuri & Gaming la Reducere",
    keywords: ["jocuri reducere romania", "gaming oferte", "console reduceri", "games deals"],
  },
  altele: {
    label: "Alte Categorii",
    emoji: "🛍️",
    desc: "Produse diverse la reducere din magazinele partenere AmCupon.ro, actualizate zilnic.",
    h1: "Produse Diverse la Reducere",
    keywords: ["reduceri diverse", "oferte diverse online", "produse reducere romania"],
  },
};
