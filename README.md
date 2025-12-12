# UMApp

Aplikacija, ki združuje urnik, vaje in ostale funkcionalnosti, ki so uporabne študentom.


## Lokalna postavitev projekta

Potrebujete naložen [Node.js](https://nodejs.org/) ter [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/) (ponavadi pride že z Node.js).

1. Klonirajte repozitorij:
```bash
   git clone git@github.com:RPO-legende/UMApp.git
    cd UMApp
```
2. Namestite odvisnosti:
```bash
   cd frontend
    npm install
    cd ../backend
    npm install
```

3. Zaženite aplikacijo - posebej terminalno okno za backend in frontend:
```bash
   # V enem terminalu zaženite backend
   cd backend
   npm run dev
   # V drugem terminalu zaženite frontend
   cd ../frontend
   npm run dev
   ```

Backend (z zadnjo zbuildano verzijo frontend-a, zapakirano v njem) je na voljo na [http://localhost:3000](http://localhost:3000) in frontend (ki se posodablja s kodo) na [http://localhost:5173](http://localhost:5173).

Priporočljiva je uporaba [http://localhost:5173](http://localhost:5173).