"""
Verifica daca linkurile din output.json sunt functionale.
Rezultate salvate in ../data/link_report.json
"""
import json
import time
import urllib.request
import urllib.error
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

INPUT_FILE = "../data/output.json"
REPORT_FILE = "../data/link_report.json"

TIMEOUT = 8        # secunde per request
MAX_WORKERS = 10   # cereri simultane
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"


def check_url(magazin: dict) -> dict:
    url = magazin.get("url", "")
    if not url:
        return {"magazin": magazin["magazin"], "url": "", "status": "FARA_URL", "ok": False}

    try:
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            return {
                "magazin": magazin["magazin"],
                "url": url,
                "status": resp.status,
                "ok": resp.status < 400,
                "url_final": resp.url,  # dupa redirect
            }
    except urllib.error.HTTPError as e:
        return {"magazin": magazin["magazin"], "url": url, "status": e.code, "ok": e.code < 400}
    except urllib.error.URLError as e:
        return {"magazin": magazin["magazin"], "url": url, "status": "EROARE", "mesaj": str(e.reason), "ok": False}
    except Exception as e:
        return {"magazin": magazin["magazin"], "url": url, "status": "EROARE", "mesaj": str(e), "ok": False}


def main():
    with open(INPUT_FILE, encoding="utf-8") as f:
        magazine = json.load(f)

    total = len(magazine)
    print(f"Verific {total} linkuri cu {MAX_WORKERS} conexiuni simultane...\n")

    rezultate = []
    ok_count = 0
    eroare_count = 0

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(check_url, m): m for m in magazine}
        done = 0
        for future in as_completed(futures):
            done += 1
            r = future.result()
            rezultate.append(r)
            stare = "OK" if r["ok"] else "--"
            if r["ok"]:
                ok_count += 1
            else:
                eroare_count += 1
            print(f"[{done:3}/{total}] {stare} {r['magazin']:30} {r['status']}")

    # Sortam: erorile primele
    rezultate.sort(key=lambda x: (x["ok"], x["magazin"]))

    report = {
        "generat_la": datetime.now().isoformat(),
        "total": total,
        "ok": ok_count,
        "erori": eroare_count,
        "rezultate": rezultate,
    }

    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*50}")
    print(f"TOTAL: {total} | OK: {ok_count} | ERORI: {eroare_count}")
    print(f"\nLinkuri cu probleme:")
    for r in rezultate:
        if not r["ok"]:
            mesaj = r.get("mesaj", "")[:60]
            print(f"  -- {r['magazin']:30} [{r['status']}] {mesaj}")
    print(f"\nRaport complet: {REPORT_FILE}")


if __name__ == "__main__":
    start = time.time()
    main()
    print(f"\nTimp total: {time.time() - start:.1f}s")
