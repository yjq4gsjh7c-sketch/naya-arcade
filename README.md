# Naya Arcade

Due giochi touch in italiano per bambini: Blocchi (blocchi in caduta) e Memory.

- Da sola, contro un robot oppure con un amico sullo stesso dispositivo.
- Facile, Media e Super. Partenza lenta e 6 coppie nel livello Facile.
- Blocchi: due campi simultanei nelle sfide, durata 2 minuti, sequenza di pezzi condivisa. Vince il punteggio più alto; un campo pieno si ferma mentre l'altro continua. Le sfide finiscono prima se entrambi i campi sono pieni.
- Memory: a turni; una coppia permette di giocare ancora. Il robot usa solo carte già scoperte, con memoria limitata a livello Facile e Media.
- Record locali distinti per gioco, modalità e difficoltà. Il record è il punteggio di Naya, non del robot o dell'amico.
- Musica originale e suoni sintetizzati con Web Audio. I pulsanti permettono di spegnerli separatamente. L'audio parte dopo un tocco, come richiesto da iPadOS.
- Festeggiamenti per record, serie e traguardi. Rispetta la preferenza di movimento ridotto.
- Pausa automatica quando si cambia scheda o si blocca lo schermo.
- Nessun account, pubblicità, tracciamento o risorsa esterna.
- Offline dopo il primo caricamento completo via HTTPS. I record non vengono sincronizzati tra dispositivi e possono essere rimossi cancellando i dati del browser.

## Pubblicare su GitHub Pages

Caricare questi file nella radice di un repository. In Settings → Pages selezionare Deploy from a branch, branch main, cartella /(root), e salvare. Il link è https://USERNAME.github.io/REPOSITORY/.

Su iPad: aprire il link in Safari, Condividi → Aggiungi alla schermata Home. Caricare il gioco una prima volta online prima di usarlo offline.

## Comandi

Usare i pulsanti sullo schermo. Blocchi supporta anche tastiera: frecce per Naya, spazio per caduta immediata; WASD e Q per l'amico.

## Avvio locale

Da questa cartella: `python3 -m http.server 8765`. Aprire http://localhost:8765. Nessun passaggio di build o dipendenza richiesti.

Il gioco non utilizza marchi, loghi o risorse ufficiali Tetris.
