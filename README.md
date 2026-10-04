# Naya Arcade

Drei kinderfreundliche Spiele mit deutscher Oberfläche: Blöcke, Memory und **Meine Welt**, eine eigene 3D-Bauwelt. Läuft in Safari auf dem iPad mit Bildschirmsteuerung.

## Meine Welt

Wähle Haus oder Stall und tippe auf die Wiese. Möbel öffnen die Dachansicht und lassen sich innerhalb eines Gebäudes platzieren. Tiere bewegen sich, lassen sich füttern und suchen bei Hunger eine Futterstelle, wenn automatisches Füttern eingeschaltet ist. Lampen lassen sich antippen; Tag/Nacht und Musik sind umschaltbar. Objekte können verschoben, gedreht, gefärbt und entfernt werden; Rückgängig stellt die letzten Änderungen wieder her. Bis zu 100 Objekte pro Welt.

Die Welt und Arcade-Rekorde werden lokal im Browser gespeichert. Sie synchronisieren sich nicht zwischen Geräten und können durch Löschen der Website-Daten verloren gehen. Die Dateien werden nach dem ersten Onlinebesuch für Offlinebetrieb zwischengespeichert.

## Entwicklung und Veröffentlichung

Statische Dateien ohne Buildschritt. Lokal z. B. mit einem HTTP-Server starten. GitHub Pages veröffentlicht den main-Zweig aus dem Stammverzeichnis. Änderungen an zwischengespeicherten Dateien erfordern eine neue Cache-Version in sw.js. Bestehende Speicherformate bei Erweiterungen erhalten oder migrieren.

3D: Three.js 0.160.1, lokal mitgeliefert unter vendor; MIT-Lizenz in vendor/THREE-LICENSE.txt. Geometrien und Musik werden im Spiel erzeugt; keine externen Assetdienste und keine Konten erforderlich.
