# Setup automatizare social media — Make.com

**Timp necesar: ~15 minute | Cost: GRATUIT (1000 operatii/luna)**
**Nu necesita Meta Developer account!**

---

## Ce face Make.com

GitHub Actions genereaza bannerul zilnic + caption-ul si trimite un webhook catre Make.com.
Make.com primeste datele si posteaza automat pe:
- **Facebook Page** — AmCupon.ro (text + imagine + link)
- **Instagram Business** — @alexmarius98 (imagine + caption)

---

## Pasul 1 — Creeaza cont Make.com

1. Mergi la [make.com](https://make.com) → **Get started free**
2. Inregistrare cu alexmarius855@gmail.com
3. Alege planul **Free** (1000 operatii/luna — suficient)

---

## Pasul 2 — Creeaza Scenario

1. In dashboard, click **Create a new scenario**
2. Click pe cercul cu `+` (adauga primul modul)
3. Cauta **"Webhooks"** → selecteaza **"Custom Webhook"**
4. Click **"Add"** → da un nume (ex: `amcupon-social-post`)
5. Click **"Save"** → copiaza URL-ul webhook-ului

   Arata asa: `https://hook.eu2.make.com/abc123xyz...`

6. **Copiaza acest URL** — il vom adauga in GitHub Secrets

---

## Pasul 3 — Adauga modulele Facebook + Instagram

### Modul Facebook Pages

1. Click pe `+` dupa webhook-ul tau
2. Cauta **"Facebook Pages"** → selecteaza **"Create a Post"**
3. Click **"Add"** → **"Sign in with Facebook"**
4. Autentifica-te cu contul tau Facebook (cel cu AmCupon.ro)
5. Autorizeaza Make.com pentru pagina AmCupon.ro
6. Configureaza campurile:
   - **Page**: selecteaza `AmCupon.ro`
   - **Message**: click pe campul text → **"1. Custom Webhook"** → selecteaza `caption`
   - **Link**: click pe campul text → selecteaza `link`
   - **Attached Image URL**: click → selecteaza `image_url`
7. Click **OK**

### Modul Instagram Business

1. Click pe `+` dupa modulul Facebook
2. Cauta **"Instagram for Business"** → selecteaza **"Create a Photo Post"**
3. Click **"Add"** → se va conecta automat prin acelasi cont Facebook
4. Configureaza campurile:
   - **Page**: selecteaza `AmCupon.ro` (cea conectata la Instagram)
   - **Caption**: click → selecteaza `caption`
   - **Image URL**: click → selecteaza `image_url`
5. Click **OK**

---

## Pasul 4 — Seteaza Scheduling

1. Click pe ceasul mic din stanga scenariului
2. Alege **"Immediately as data arrives"** (se declanseaza la fiecare webhook)
3. Click **Save**

---

## Pasul 5 — Salveaza URL-ul in GitHub Secrets

1. Mergi la repo-ul GitHub al AmCupon.ro
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `MAKE_WEBHOOK_URL`
5. Value: URL-ul webhook-ului de la Pasul 2
6. Click **Add secret**

**GATA!** De acum, la fiecare rulare GitHub Actions (08:00 + 19:00 Romania), se va posta automat pe Facebook + Instagram.

---

## Test manual

Dupa ce ai setat totul:
1. In GitHub → Actions → "Actualizare Automata Date & Blog"
2. Click **"Run workflow"** → **"Run workflow"**
3. Urmareste logul → ar trebui sa vezi:
   ```
   Trimit webhook morning (general)...
   Banner URL: https://amcupon.ro/banner-daily.png
   Webhook trimis cu succes (HTTP 200)
   ```
4. Verifica Facebook + Instagram — postul ar trebui sa apara!

---

## Depanare

**"Webhook trimis cu succes" dar nu apare post**
- In Make.com → History → vezi ce a primit webhook-ul
- Verifica ca modulele FB + IG sunt corect configurate

**"MAKE_WEBHOOK_URL nu e setat — skip"**
- Verifica ca ai adaugat secretul corect in GitHub

**Imaginea nu se afiseaza**
- Bannerul e generat si publicat la `amcupon.ro/banner-daily.png` dupa primul run
- Daca e primul run, imaginea poate lipsi; al doilea run va functiona corect

---

## Alternativa — Token Meta API direct (avansat)

Daca ai cont Meta Developer (sau il poti crea de pe telefon):

### Facebook Page Token
1. Mergi la [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer)
2. Selecteaza pagina `AmCupon.ro`
3. Adauga permisiunile: `pages_manage_posts`, `pages_read_engagement`
4. Click "Generate Access Token"
5. Extinde la 60 zile: GET `/oauth/access_token?grant_type=fb_exchange_token&...`
6. Adauga in GitHub Secrets:
   - `FACEBOOK_PAGE_ID` = `1080299791844588`
   - `FACEBOOK_PAGE_TOKEN` = tokenul generat

### Instagram Account ID + Token
1. Same token de mai sus (merge si pentru Instagram daca contul e conectat)
2. GET `/me/accounts` → gaseste `instagram_business_account.id`
3. Adauga in GitHub Secrets:
   - `INSTAGRAM_ACCOUNT_ID` = ID-ul gasit
   - `INSTAGRAM_ACCESS_TOKEN` = acelasi token ca Facebook

---

## Rezumat GitHub Secrets necesare

| Secret | Metoda | Valoare |
|--------|--------|---------|
| `MAKE_WEBHOOK_URL` | Make.com (recomandat) | URL din Make.com scenario |
| `FACEBOOK_PAGE_ID` | API direct (optional) | `1080299791844588` |
| `FACEBOOK_PAGE_TOKEN` | API direct (optional) | token din Graph API Explorer |
| `INSTAGRAM_ACCOUNT_ID` | API direct (optional) | ID din `/me/accounts` |
| `INSTAGRAM_ACCESS_TOKEN` | API direct (optional) | acelasi token ca FB |
