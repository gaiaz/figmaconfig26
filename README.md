# Config Watch Party App

App Vite + React per creare vCard decorate con sticker durante un watch party Config e mostrarle in una board condivisa.

## Sviluppo locale

```bash
npm install
npm run dev
```

Apri `http://127.0.0.1:5173/`.

Senza variabili Supabase l'app usa le card demo in memoria. Con Supabase configurato salva partecipanti, foto e board live.

## Setup Supabase

1. Crea un nuovo progetto su Supabase.
2. Apri SQL Editor e lancia il contenuto di `supabase/schema.sql`.
3. Vai in Project Settings -> API e copia:
   - Project URL
   - anon public key
4. Crea `.env` partendo da `.env.example`:

```bash
cp .env.example .env
```

5. Compila:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_EVENT_ID=config-watch-party
VITE_SUPABASE_PHOTO_BUCKET=participant-photos
```

6. Riavvia il dev server.

## Come funziona

- Le card vengono salvate nella tabella `participants`.
- Le foto vengono caricate nel bucket pubblico `participant-photos`.
- La board ascolta gli insert Supabase Realtime e aggiorna i partecipanti senza refresh.
- `VITE_EVENT_ID` separa eventi diversi usando lo stesso progetto.

## Deploy

Build:

```bash
npm run build
```

Deploy su Vercel o Netlify come progetto Vite. Imposta le stesse variabili `.env` nel pannello del provider.
