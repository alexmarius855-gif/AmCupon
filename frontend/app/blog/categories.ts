/* Mapare categorii blog (micro -> macro) — sursa unica, folosita de
   blog/page.tsx (grupare + filtre) si sitemap.ts (URL-uri categorie). */

export const CATEG_MAP: Record<string, string> = {
  "Ghiduri": "Ghiduri", "Ghid": "Ghiduri",
  "Electronice": "Electronice", "Electronics IT&C": "Electronice", "Electronice IT&C": "Electronice",
  "Electronice & Gadgeturi": "Electronice", "Periferice Gaming": "Electronice", "Gaming": "Electronice",
  "Laptopuri & PC": "Electronice", "Baterii & Incarcare": "Electronice", "Energie Portabila": "Electronice",
  "Monitoare Portabile": "Electronice", "Online Mall": "Electronice", "Gadgets": "Electronice",
  "Fashion": "Fashion", "Fashion & General": "Fashion", "Fashion Feminin": "Fashion",
  "Incaltaminte": "Fashion", "Sneakers & Streetwear": "Fashion", "Imbracaminte Bambus": "Fashion",
  "Home & Garden": "Casa & Gradina", "Casa & Gradina": "Casa & Gradina", "Casa": "Casa & Gradina",
  "Electrocasnice": "Casa & Gradina", "Mobilier & Birou": "Casa & Gradina", "Brazi Artificiali": "Casa & Gradina",
  "Beauty": "Frumusete", "Frumusete": "Frumusete", "Jewelry": "Frumusete",
  "Sport": "Sport", "Sports & outdoors": "Sport", "Sport & Outdoor": "Sport",
  "Fitness & Sport": "Sport", "Pariuri & Sport": "Sport", "Outdoor & Camping": "Sport",
  "Biciclete Electrice": "Sport", "Biciclete & MTB": "Sport", "Fitness App": "Sport",
  "Sanatate": "Sanatate", "Farmacie": "Sanatate", "Pharma": "Sanatate",
  "Health & Personal care": "Sanatate", "Sticle Apa Smart": "Sanatate",
  "Copii": "Copii & Jucarii", "Babies Kids & Toys": "Copii & Jucarii",
  "Copii si Jucarii": "Copii & Jucarii", "Accesorii Bebe": "Copii & Jucarii", "Babywearing": "Copii & Jucarii",
  "Carti": "Carti", "Books": "Carti", "Carti & Rezumate": "Carti",
  "Calatorie": "Calatorie", "Transport & Calatorii": "Calatorie", "Turism & Activitati": "Calatorie",
  "eSIM Calatorii": "Calatorie",
  "Automotive": "Auto-Moto", "Auto-Moto": "Auto-Moto", "Auto": "Auto-Moto",
  "Animale": "Animale", "Pet supplies": "Animale", "Accesorii Animale": "Animale",
  "Hosting": "Tehnologie", "Hosting WordPress": "Tehnologie", "Hosting & Domenii": "Tehnologie",
  "Software & VPN": "Tehnologie", "Antivirus & Securitate": "Tehnologie", "Domenii Web": "Tehnologie",
  "Proxy & VPN": "Tehnologie", "VPN": "Tehnologie", "Securitate Mac": "Tehnologie",
  "CRM & Marketing": "Tehnologie", "Editare Foto": "Tehnologie", "Video & AI Tools": "Tehnologie",
  "Ecommerce Platform": "Tehnologie", "Teme Shopify": "Tehnologie", "Teme WordPress": "Tehnologie",
  "WordPress Tools": "Tehnologie", "Stock Photos": "Tehnologie", "Smart Home": "Tehnologie",
};

export const MACRO_ORDINE = ["Ghiduri","Electronice","Fashion","Casa & Gradina","Frumusete","Sport","Sanatate","Copii & Jucarii","Carti","Calatorie","Auto-Moto","Animale","Tehnologie"];

export const MACRO_EMOJI: Record<string, string> = {
  "Ghiduri": "📘", "Electronice": "💻", "Fashion": "👗", "Casa & Gradina": "🏡",
  "Frumusete": "💄", "Sport": "🏃", "Sanatate": "💊", "Copii & Jucarii": "🧸",
  "Carti": "📚", "Calatorie": "✈️", "Auto-Moto": "🚗", "Animale": "🐾", "Tehnologie": "⚙️",
};

export const getMacro = (cat: string): string => CATEG_MAP[cat] || "";
