# public/data

## comuni.json

Elenco dei 7.896 comuni italiani per l'autocomplete di `/scuole/stima`.
Formato minimo: `[{ "n": "<nome ISTAT>", "p": "<sigla provincia>" }, …]`
(~230 KB, caricato lazy al mount della pagina, mai nel bundle).

**Provenienza**: derivato da `school/data/comuni_italiani.csv` del repo
backend `pv_engine` (a sua volta da ISTAT — Elenco comuni 1/1/2025, CC BY
3.0 IT; vedi `school/data/README.md` del backend per fonti complete).
La coppia nome+provincia inviata all'API elimina a monte gli omonimi
(es. Castro BG/LE).

**Rigenerazione** (dopo un aggiornamento del CSV backend):

```bash
python3 -c "
import csv, json
rows = [{'n': r['nome'], 'p': r['sigla_provincia']}
        for r in csv.DictReader(open('<path-backend>/school/data/comuni_italiani.csv', encoding='utf-8'))]
json.dump(rows, open('public/data/comuni.json', 'w', encoding='utf-8'),
          ensure_ascii=False, separators=(',', ':'))
"
```
