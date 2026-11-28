import type { Metadata } from "next";
import { clasaFonturi } from "./(nou)/_ui/fonturi";
import Antet from "./(nou)/_ui/Antet";
import Pagina404 from "./(nou)/_ui/Pagina404";
import "./(nou)/nou.css";

/**
 * 404 pentru adresele care nu se potrivesc cu nicio ruta (25.11.2026). Site-ul are doua layout-uri radacina in
 * trecere (app/(vechi) si app/(nou)), deci nu exista unul comun din care sa se compuna 404-ul: Next sare randarea
 * si serveste direct acest document (next.config.ts: experimental.globalNotFound). Next pune singur `noindex`.
 */
export const metadata: Metadata = {
  title: "Pagina nu există — AmCupon.ro",
  description: "Pagina căutată nu există. Ofertele de azi, produsele cu prețul confirmat și toate magazinele partenere sunt pe AmCupon.ro.",
};

export default function GlobalNotFound() {
  return (
    <html lang="ro" className={clasaFonturi}>
      <body>
        <Antet />
        <main id="continut">
          <Pagina404 />
        </main>
      </body>
    </html>
  );
}
